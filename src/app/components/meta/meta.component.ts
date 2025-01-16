import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { DataStoreService } from '../../store/sheet-data.store';
import { WarbandData } from '../../models/spreadsheet.model';

@Component({
  selector: 'app-meta',
  standalone: true,
  imports: [BaseChartDirective, CommonModule, MatCardModule, MatDividerModule],
  templateUrl: './meta.component.html',
  styleUrl: './meta.component.scss'
})
export class MetaComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  warbandMetaData: {
    name: string, winrate: number,
    iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
    bestSynergy: { deckCombiName: string, winrate: number },
    bestmatchup: { opponentName: string, winrate: number },
    worstmatchup: { opponentName: string, winrate: number },
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
    },
    onClick: this.onChartClick.bind(this),
  };

  constructor(private dataStoreService: DataStoreService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {    // Subscribe to data from the store
    this.dataStoreService.warbandData$.subscribe((data) => {
      if (data.length > 0) {
        this.processMetaForChart(data);
      }
    });
  }

  processMetaForChart(data: WarbandData[]): void {
    const otherCutOff = 25;
    const otherWarbands = data.filter(wb => wb.metaScore < 25);

    const otherMetaScore = otherWarbands.reduce((sum, wb) => sum + wb.metaScore, 0);
    const otherGamesPlayed = otherWarbands.reduce((sum, wb) => sum + wb.gamesPlayed, 0);
    const otherWinrate = otherGamesPlayed > 0 ? (otherWarbands.reduce((sum, wb) => sum + wb.gamesWon, 0) / otherGamesPlayed) * 100 : 0;

    this.warbandMetaData = data
      .filter(wb => wb.metaScore >= otherCutOff).slice().map((wb) => {
        // Calculate the best synergy
        const bestSynergy = Object.entries(wb.deckSynergies)
          .map(([deckCombiName, stats]) => {
            const totalGames = stats.wins + stats.losses + stats.ties;
            const winrate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
            return { deckCombiName, winrate };
          })
          .reduce(
            (best, current) => (current.winrate > best.winrate ? current : best),
            { deckCombiName: "", winrate: 0 }
          );

        // Calculate the best matchup
        const bestMatchup = Object.entries(wb.matchups)
          .map(([opponentName, stats]) => {
            const totalGames = stats.wins + stats.losses + stats.ties;
            const winrate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
            return { opponentName, winrate };
          })
          .reduce(
            (best, current) => (current.winrate > best.winrate ? current : best),
            { opponentName: "", winrate: 0 }
          );

        // Calculate the worst matchup
        const worstMatchup = Object.entries(wb.matchups)
          .map(([opponentName, stats]) => {
            const totalGames = stats.wins + stats.losses + stats.ties;
            const winrate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
            return { opponentName, winrate };
          })
          .reduce(
            (worst, current) => (current.winrate < worst.winrate ? current : worst),
            { opponentName: "", winrate: 100 }
          );

        // Push to chart data // Filter warbands with meta score >= 1
        return ({
          name: wb.name,
          winrate: wb.gamesPlayed > 0 ? (wb.gamesWon / wb.gamesPlayed) * 100 : 0,
          iconLink: wb.icon,
          metaScore: wb.metaScore,
          gamesPlayed: wb.gamesPlayed,
          legality: wb.legality == "TRUE",
          bestSynergy,
          bestmatchup: bestMatchup,
          worstmatchup: worstMatchup,
        });
      }).sort((a, b) => b.metaScore - a.metaScore); // Sort warbands by meta score;

    if (otherMetaScore > 0) {
      this.warbandMetaData.push({
        name: 'Others',
        winrate: otherWinrate,
        iconLink: '',
        metaScore: otherMetaScore,
        gamesPlayed: otherGamesPlayed,
        legality: true,
        bestSynergy: {
          deckCombiName: "",
          winrate: 0
        },
        bestmatchup: {
          opponentName: "",
          winrate: 0
        },
        worstmatchup: {
          opponentName: "",
          winrate: 0
        },
      });
    }

    this.updateChartData();
  }

  updateChartData() {
    this.chartData.labels = this.warbandMetaData.map(warband => warband.name);
    this.chartData.datasets[0].data = this.warbandMetaData.map(warband => warband.metaScore);
    this.chartData.datasets[0].backgroundColor = this.warbandMetaData.map((warband, index) =>
      this.selectedWarbandIndex === index ? '#FF5000' : 'white'
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
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }

}
