import { Component, OnInit, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { combineLatest, forkJoin, map } from 'rxjs';

import { DataStoreService } from '../../store/sheet-data.store';
import { DeckCombiData, DeckData, WarbandData } from '../../models/spreadsheet.model';
import { CardDataCalculationsService } from '../../services/card-data-calculations.service';

@Component({
  selector: 'app-deck-combi-details-card',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './deck-combi-details-card.component.html',
  styleUrl: './deck-combi-details-card.component.scss'
})
export class DeckCombiDetailsCardComponent {
  selectedWarband: any;
  minGamesThreshhold: number = 15;
  winrateByDeckCombiChartData: {
    name: string, winrate: number,
    iconLink1: string,iconLink2: string, metaScore: number, 
    gamesPlayed: number, legality: boolean,
    bestSynergy: { name: string, winrate: number, games:number },
    bestMatchup: { name: string, winrate: number, games:number },
    worstMatchup: { name: string, winrate: number, games:number },
  }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataStoreService: DataStoreService,
  ) { }

  ngOnInit() {
    // Subscribe to data from the store
    combineLatest({
      routeParams: this.route.paramMap,
      deckCombiData: this.dataStoreService.deckCombiData$,
      filters: this.dataStoreService.filters$,
    }).subscribe(({ routeParams, deckCombiData, filters}) => {
      const deckName = routeParams.get('name');
      if (deckName && deckCombiData.length > 0) {
        if (filters.dataThreshold){
          this.minGamesThreshhold = filters.dataThreshold
          console.log('minGamesThreshhold', this.minGamesThreshhold)
        }
        this.processDecksForChart(deckCombiData);
        this.updateWarbandDetails(deckName);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle any changes in inputs or other relevant data here
    if (changes['selectedWarband']) {
      // Update the selected warband data
    }
  }

  processDecksForChart(data: DeckCombiData[]): void {
    //  data,this.minGamesThreshhold)
    this.winrateByDeckCombiChartData = data.slice().map((deckCombi) => {
      // Calculate the best synergy
      const bestSynergy = Object.entries(deckCombi.warbandSynergies)
          .map(([warbandName, stats]) => {
            const gamesWithWarband = stats.wins + stats.losses + stats.ties;
            const winrate = gamesWithWarband > 0 ? (stats.wins / gamesWithWarband) * 100 : 0;
            return { name:warbandName, winrate, games:gamesWithWarband };
          })
          .reduce(
            (best, current) => (current.winrate > best.winrate && 
              current.games>=this.minGamesThreshhold ? current : best),
            { name: "", winrate: 0, games:0 }
          );

        // Calculate the best combination
        const bestMatchup = Object.entries(deckCombi.deckCombiMatchups)
          .map(([opponentDCName, stats]) => {
            const bestGames = stats.wins + stats.losses + stats.ties;
            const winrate = bestGames > 0 ? (stats.wins / bestGames) * 100 : 0;
            return { name:opponentDCName, winrate, games:bestGames };
          })
          .reduce(
            (best, current) => (current.winrate > best.winrate && 
              current.games>=this.minGamesThreshhold ? current : best),
            { name: "", winrate: 0, games: 0 }
          );

        // Calculate the worst matchup
        const worstMatchup = Object.entries(deckCombi.deckCombiMatchups)
          .map(([opponentDCName, stats]) => {
            const worstGames = stats.wins + stats.losses + stats.ties;
            const winrate = worstGames > 0 ? (stats.wins / worstGames) * 100 : 0;
            return { name:opponentDCName, winrate, games:worstGames };
          })
          .reduce(
            (worst, current) => (current.winrate < worst.winrate &&
              current.games>=this.minGamesThreshhold ? current : worst),
            { name: "", winrate: 100, games:0 }
          );

      // Push to chart data
      return{
        name: deckCombi.name1 + ' + ' + deckCombi.name2,
        winrate: deckCombi.gamesPlayed > 0 ? (deckCombi.gamesWon / deckCombi.gamesPlayed) * 100 : 0,
        iconLink1: deckCombi.icon1,
        iconLink2: deckCombi.icon2,
        metaScore: deckCombi.metaScore,
        gamesPlayed: deckCombi.gamesPlayed,
        legality: deckCombi.legality,
        bestSynergy,
        bestMatchup,
        worstMatchup,
      };
    });

    console.log('deckCombiDetailsCardloaded', this.winrateByDeckCombiChartData)
  }

  private updateWarbandDetails(warbandName: string | null): void {
    if (warbandName) {
      // Find the warband data based on the name
      console.log('name is set')
      this.selectedWarband = this.getWarbandByName(warbandName);
    }
  }

  private getWarbandByName(name: string | null): any {
    return this.winrateByDeckCombiChartData.find((deckCombi) => deckCombi.name === name);
  }

  closeCard() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}