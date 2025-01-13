import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { WinrateComponent } from '../winrate/winrate.component';
import { DataStoreService } from '../../store/sheet-data.store';
import { WarbandData } from '../../models/spreadsheet.model';

@Component({
  selector: 'app-warband-details-card',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './warband-details-card.component.html',
  styleUrl: './warband-details-card.component.scss'
})
export class WarbandDetailsCardComponent implements OnInit {
  selectedWarband: any;
  winrateByWarbandChartData: {
    name: string, winrate: number,
    iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
    bestSynergy: { deckCombiName: string, winrate: number },
    bestmatchup: { opponentName: string, winrate: number },
    worstmatchup: { opponentName: string, winrate: number },
  }[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataStoreService: DataStoreService
  ) { }

  ngOnInit() {
    // Retrieve the warband name from the route
    const warbandName = this.route.snapshot.paramMap.get('name');

    // Subscribe to data from the store
    this.dataStoreService.warbandData$.subscribe((data) => {
      if (data.length > 0) {
        this.processWarbandsForChart(data);
      }
    });

    this.selectedWarband = this.getWarbandByName(warbandName);
  }

  processWarbandsForChart(data: WarbandData[]): void {
    data.slice().forEach((wb) => {
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

      // Push to chart data
      this.winrateByWarbandChartData.push({
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
    });
    //sort by Winrate
    this.winrateByWarbandChartData.sort((a, b) => b.winrate - a.winrate);
  }

  private getWarbandByName(name: string | null): any {
    return this.winrateByWarbandChartData.find((warband) => warband.name === name);
  }
}