import { ChangeDetectorRef, Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective, ThemeService } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

import { DataStoreService } from '../../store/sheet-data.store';
import { DeckCombiData, WarbandData } from '../../models/spreadsheet.model';
import { CardDataCalculationsService } from '../../services/card-data-calculations.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-deck-meta',
  standalone: true,
  imports: [
    BaseChartDirective,
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './deck-meta.component.html',
  styleUrl: './deck-meta.component.scss'
})
export class DeckMetaComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  deckCombiMetaData: {
    name: string, winrate: number,
    iconLink1: string, iconLink2: string, metaScore: number, 
    gamesPlayed: number, legality: boolean,
    bestSynergy: { name: string, winrate: number, games:number },
    bestMatchup: { name: string, winrate: number, games:number },
    worstMatchup: { name: string, winrate: number, games:number },
  }[] = [];

  selectedWarbandIndex: number | null = null;

  chartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderRadius: 8,
        borderWidth: 4,
        //offset: 20,
        borderColor: '#333',
      },
    ],
  };
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: '#fff',
      },
    },
    onClick: this.onChartClick.bind(this),
  };
  minGamesThreshhold: number = 15;

  constructor(private dataStoreService: DataStoreService,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService,
  ) { }

  ngOnInit() {
    combineLatest({
      deckCombiData: this.dataStoreService.deckCombiData$,
      filters: this.dataStoreService.filters$,
    }).subscribe(({ deckCombiData, filters }) => {
      if (deckCombiData.length > 0) {
        if (filters.dataThreshold) {
          this.minGamesThreshhold = filters.dataThreshold
        }
        this.processMetaForChart(deckCombiData);
      }
    });

    this.updateChartColors();
    window.addEventListener('themeChange', (event) => {
      this.updateChartColors();
    });
  }

  processMetaForChart(data: DeckCombiData[]): void {
    const otherCutOff = 25; //Every Metascore smaller is added to 'Others'
    const otherDeckCombis = data.filter(dc => dc.metaScore < 25);

    const otherMetaScore = otherDeckCombis.reduce((sum, dc) => sum + dc.metaScore, 0);
    const otherGamesPlayed = otherDeckCombis.reduce((sum, dc) => sum + dc.gamesPlayed, 0);
    const otherWinrate = otherGamesPlayed > 0 ? (otherDeckCombis.reduce((sum, dc) => sum + dc.gamesWon, 0) / otherGamesPlayed) * 100 : 0;

    this.deckCombiMetaData =data.filter(
      wb => wb.metaScore >= otherCutOff).slice().map((dc) => {
        // Calculate the best synergy
        const bestSynergy = Object.entries(dc.warbandSynergies)
            .map(([name, stats]) => {
              const games = stats.wins + stats.losses + stats.ties;
              const winrate = games > 0 ? (stats.wins / games) * 100 : 0;
              return { name, winrate, games };
            })
            .reduce(
              (best, current) => (current.winrate > best.winrate && 
                current.games>=this.minGamesThreshhold ? current : best),
              { name: "", winrate: 0, games:0 }
            );
  
          // Calculate the best matchup
          const bestMatchup = Object.entries(dc.deckCombiMatchups)
            .map(([name, stats]) => {
              const games = stats.wins + stats.losses + stats.ties;
              const winrate = games > 0 ? (stats.wins / games) * 100 : 0;
              return { name, winrate, games };
            })
            .reduce(
              (best, current) => (current.winrate > best.winrate && 
                current.games>=this.minGamesThreshhold ? current : best),
              { name: "", winrate: 0, games: 0 }
            );
  
          // Calculate the worst matchup
          const worstMatchup = Object.entries(dc.deckCombiMatchups)
            .map(([name, stats]) => {
              const games = stats.wins + stats.losses + stats.ties;
              const winrate = games > 0 ? (stats.wins / games) * 100 : 0;
              return { name, winrate, games };
            })
            .reduce(
              (worst, current) => (current.winrate < worst.winrate &&
                current.games>=this.minGamesThreshhold ? current : worst),
              { name: "", winrate: 100, games:0 }
            );
  
        // Push to chart data
        return{
          name: dc.name1+' + '+dc.name2,
          winrate: dc.gamesPlayed > 0 ? (dc.gamesWon / dc.gamesPlayed) * 100 : 0,
          iconLink1: dc.icon1,
          iconLink2: dc.icon2,
          metaScore: dc.metaScore,
          gamesPlayed: dc.gamesPlayed,
          legality: dc.legality,
          bestSynergy,
          bestMatchup,
          worstMatchup,
        };
      }).sort((a, b) => b.metaScore - a.metaScore); // Sort warbands by meta score;

    if (otherMetaScore > 0) {
      this.deckCombiMetaData.push({
        name: 'Others',
        winrate: otherWinrate,
        iconLink1: 'https://www.underworldsdb.com/img/universal-icon.png',
        iconLink2: 'https://www.underworldsdb.com/img/universal-icon.png',
        metaScore: otherMetaScore,
        gamesPlayed: otherGamesPlayed,
        legality: true,
        bestSynergy: {
          name: "",
          winrate: 0,
          games: 0,
        },
        bestMatchup: {
          name: "",
          winrate: 0,
          games: 0,
        },
        worstMatchup: {
          name: "",
          winrate: 0,
          games: 0,
        },
      });
    }

    this.updateChartData();
  }

  updateChartData() {
    this.chartData.labels = this.deckCombiMetaData.map(deckCombi => deckCombi.name);
    this.chartData.datasets[0].data = this.deckCombiMetaData.map(deckCombi => deckCombi.metaScore);
    this.chartData.datasets[0].backgroundColor = this.deckCombiMetaData.map((deckCombi, index) =>
      this.selectedWarbandIndex === index ? '#FF5000' :
        document.body.classList.contains('dark-theme') ? '#fff' : '#333'
    );
    if (this.chart) {
      this.chart.update();
    }
  }

  onChartClick(event: ChartEvent, activeElements: any[]) {
    if (activeElements.length > 0) {
      const index = activeElements[0].index;
      this.selectedWarbandIndex = index;
      this.updateChartData();
      this.scrollToWarband(index);
      this.cdr.detectChanges(); // Manually trigger change detection
    }
  }

  onWarbandCardClick(index: number) {
    this.selectedWarbandIndex = index;
    this.updateChartData();
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  scrollToWarband(index: number) {
    const element = document.getElementById(`warband-${index}`);
    const container = document.querySelector('.warband-info-container-scrollable');
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset = elementRect.left - containerRect.left + container.scrollLeft;
      container.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }

  updateChartColors(): void {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const backgroundColor = isDarkTheme ? '#fff' : '#333';
    const borderColor = isDarkTheme ? '#333' : '#fff';

    // Update chart data background colors
    if (this.chartData && this.chartData.datasets) {
      this.chartData.datasets.forEach((dataset: any) => {
        dataset.backgroundColor = dataset.backgroundColor.map((color: string) => {
          return color === '#FF5000' ? color : backgroundColor;
        });
        dataset.borderColor = borderColor;
      });
    }

    this.themeService.setColorschemesOptions({
      backgroundColor: [backgroundColor],
      borderColor: [borderColor],
    });
  }

}