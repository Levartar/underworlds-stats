import { Component, OnInit, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { combineLatest, forkJoin, map } from 'rxjs';

import { DataStoreService } from '../../store/sheet-data.store';
import { DeckData, WarbandData } from '../../models/spreadsheet.model';
import { CardDataCalculationsService } from '../../services/card-data-calculations.service';

@Component({
  selector: 'app-decks-details-card',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './decks-details-card.component.html',
  styleUrl: './decks-details-card.component.scss'
})
export class DecksDetailsCardComponent {
  selectedWarband: any;
  minGamesThreshhold: number = 15;
  winrateByDeckChartData: {
    name: string, winrate: number,
    iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
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
      deckData: this.dataStoreService.deckData$,
      filters: this.dataStoreService.filters$,
    }).subscribe(({ routeParams, deckData, filters}) => {
      const deckName = routeParams.get('name');
      if (deckName && deckData.length > 0) {
        if (filters.dataThreshold){
          this.minGamesThreshhold = filters.dataThreshold
          console.log('minGamesThreshhold', this.minGamesThreshhold)
        }
        this.processDecksForChart(deckData);
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

  processDecksForChart(data: DeckData[]): void {
    //this.winrateByWarbandChartData= CardDataCalculationsService.processWarbandsforChartData(
    //  data,this.minGamesThreshhold)
    this.winrateByDeckChartData = data.slice().map((deck) => {
      // Calculate the best synergy
      const bestSynergy = Object.entries(deck.warbandSynergies)
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
        const bestMatchup = Object.entries(deck.combinations)
          .map(([opponentName, stats]) => {
            const bestGames = stats.wins + stats.losses + stats.ties;
            const winrate = bestGames > 0 ? (stats.wins / bestGames) * 100 : 0;
            return { name:opponentName, winrate, games:bestGames };
          })
          .reduce(
            (best, current) => (current.winrate > best.winrate && 
              current.games>=this.minGamesThreshhold ? current : best),
            { name: "", winrate: 0, games: 0 }
          );

        // Calculate the worst matchup
        const worstMatchup = Object.entries(deck.combinations)
          .map(([opponentName, stats]) => {
            const worstGames = stats.wins + stats.losses + stats.ties;
            const winrate = worstGames > 0 ? (stats.wins / worstGames) * 100 : 0;
            return { name:opponentName, winrate, games:worstGames };
          })
          .reduce(
            (worst, current) => (current.winrate < worst.winrate &&
              current.games>=this.minGamesThreshhold ? current : worst),
            { name: "", winrate: 100, games:0 }
          );

      // Push to chart data
      return{
        name: deck.name,
        winrate: deck.gamesPlayed > 0 ? (deck.gamesWon / deck.gamesPlayed) * 100 : 0,
        iconLink: deck.icon,
        metaScore: deck.metaScore,
        gamesPlayed: deck.gamesPlayed,
        legality: deck.legality == "TRUE",
        bestSynergy,
        bestMatchup,
        worstMatchup,
      };
    });

    console.log('deckDetailsCardloaded', this.winrateByDeckChartData)
  }

  private updateWarbandDetails(warbandName: string | null): void {
    if (warbandName) {
      // Find the warband data based on the name
      console.log('name is set')
      this.selectedWarband = this.getWarbandByName(warbandName);
    }
  }

  private getWarbandByName(name: string | null): any {
    return this.winrateByDeckChartData.find((warband) => warband.name === name);
  }

  closeCard() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
