import { Component, OnInit, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DataStoreService } from '../../store/sheet-data.store';
import { WarbandData } from '../../models/spreadsheet.model';
import { combineLatest, forkJoin, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-warband-details-card',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatIconModule],
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
    private router: Router,
    private dataStoreService: DataStoreService
  ) { }

  ngOnInit() {
    // Subscribe to data from the store
    combineLatest({
      routeParams: this.route.paramMap,
      warbandData: this.dataStoreService.warbandData$,
    }).subscribe(({ routeParams, warbandData }) => {
      const warbandName = routeParams.get('name');
      console.log("subscribtion runs",warbandName,warbandData)
      if (warbandName && warbandData.length > 0) {
        this.processWarbandsForChart(warbandData);
        this.updateWarbandDetails(warbandName);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle any changes in inputs or other relevant data here
    if (changes['selectedWarband']) {
      // Update the selected warband data
    }
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
    console.log('warbandDetailsCardloadedWarbands', this.winrateByWarbandChartData)
  }

  private updateWarbandDetails(warbandName: string | null): void {
    if (warbandName) {
      // Find the warband data based on the name
      console.log('name is set')
      this.selectedWarband = this.getWarbandByName(warbandName);
    }
  }

  private getWarbandByName(name: string | null): any {
    return this.winrateByWarbandChartData.find((warband) => warband.name === name);
  }

  closeCard() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}