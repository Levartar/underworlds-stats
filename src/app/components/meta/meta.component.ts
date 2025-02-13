import { ChangeDetectorRef, Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective, ThemeService } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

import { DataStoreService } from '../../store/sheet-data.store';
import { WarbandData } from '../../models/spreadsheet.model';
import { CardDataCalculationsService } from '../../services/card-data-calculations.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-meta',
  standalone: true,
  imports: [
    BaseChartDirective,
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatIconModule],
  templateUrl: './meta.component.html',
  styleUrl: './meta.component.scss'
})
export class MetaComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  warbandMetaData: {
    name: string, winrate: number,
    iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
    bestSynergy: { deckCombiName: string, winrate: number, gamesWithDeckCombi: number },
    bestMatchup: { opponentName: string, winrate: number, bestGames: number },
    worstMatchup: { opponentName: string, winrate: number, worstGames: number },
  }[] = []

  selectedWarbandIndex: number | null = null;

  chartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderRadius: 5,
        borderWidth: 1,
        offset: 20,
        borderColor: 'transparent',
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
  minGamesThreshhold: number = 5;

  constructor(private dataStoreService: DataStoreService,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService,
  ) { }

  ngOnInit() {
    combineLatest({
      warbandData: this.dataStoreService.warbandData$,
      filters: this.dataStoreService.filters$,
    }).subscribe(({ warbandData, filters }) => {
      if (warbandData.length > 0) {
        this.processMetaForChart(warbandData);
        if (filters.dataThreshold) {
          this.minGamesThreshhold = filters.dataThreshold
        }
      }
    });

    this.updateChartColors();
    window.addEventListener('themeChange', (event) => {
      this.updateChartColors();
    });
  }

  processMetaForChart(data: WarbandData[]): void {
    const otherCutOff = 25; //Every Metascore smaller is added to 'Others'
    const otherWarbands = data.filter(wb => wb.metaScore < 25);

    const otherMetaScore = otherWarbands.reduce((sum, wb) => sum + wb.metaScore, 0);
    const otherGamesPlayed = otherWarbands.reduce((sum, wb) => sum + wb.gamesPlayed, 0);
    const otherWinrate = otherGamesPlayed > 0 ? (otherWarbands.reduce((sum, wb) => sum + wb.gamesWon, 0) / otherGamesPlayed) * 100 : 0;

    this.warbandMetaData = CardDataCalculationsService.processWarbandsforChartData(
      data.filter(wb => wb.metaScore >= otherCutOff).slice(), this.minGamesThreshhold)
      .sort((a, b) => b.metaScore - a.metaScore); // Sort warbands by meta score;

    if (otherMetaScore > 0) {
      this.warbandMetaData.push({
        name: 'Others',
        winrate: otherWinrate,
        iconLink: 'https://www.underworldsdb.com/img/universal-icon.png',
        metaScore: otherMetaScore,
        gamesPlayed: otherGamesPlayed,
        legality: true,
        bestSynergy: {
          deckCombiName: "",
          winrate: 0,
          gamesWithDeckCombi: 0,
        },
        bestMatchup: {
          opponentName: "",
          winrate: 0,
          bestGames: 0,
        },
        worstMatchup: {
          opponentName: "",
          winrate: 0,
          worstGames: 0,
        },
      });
    }

    this.updateChartData();
  }

  updateChartData() {
    this.chartData.labels = this.warbandMetaData.map(warband => warband.name);
    this.chartData.datasets[0].data = this.warbandMetaData.map(warband => warband.metaScore);
    this.chartData.datasets[0].backgroundColor = this.warbandMetaData.map((warband, index) =>
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
    const borderColor = isDarkTheme ? '#000' : '#fff';

    // Update chart data background colors
    if (this.chartData && this.chartData.datasets) {
      this.chartData.datasets.forEach((dataset: any) => {
        dataset.backgroundColor = dataset.backgroundColor.map((color: string) => {
          return color === '#FF5000' ? color : backgroundColor;
        });
      });
    }

    this.themeService.setColorschemesOptions({
      backgroundColor: [backgroundColor],
      borderColor: [borderColor],
    });
  }

}
