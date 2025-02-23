import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatList, MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

import { DeckCombiData, SheetWarband, WarbandData } from '../../models/spreadsheet.model';
import { DataStoreService } from '../../store/sheet-data.store';
import { combineLatest } from 'rxjs';




@Component({
  selector: 'app-deck-combi-winrates',
  standalone: true,
  imports: [
    RouterModule,
    MatListModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatIconModule],
  templateUrl: './deck-combi-winrates.component.html',
  styleUrl: './deck-combi-winrates.component.scss'
})
export class DeckCombiWinratesComponent {
  totalGames: number = 0;
    warbandData: SheetWarband[] = [];
    selectedWarband: any;
    darkMode: boolean = document.body.classList.contains('dark-theme');
    minGamesThreshhold: number = 15;
  
    // Chart data    
    winrateByDeckCombiChartData: { name1: string; name2: string; 
    winrate: number; iconLink1: string; iconLink2: string; 
    metaScore: number; gamesPlayed: number; legality: boolean; }[]=[];
  
    constructor(
      private router: Router,
      private dataStoreService: DataStoreService
    ) { }
  
    ngOnInit(): void {
      // Subscribe to data from the store
      combineLatest({
        //warbandData: this.dataStoreService.warbandData$,
        deckCombiData: this.dataStoreService.deckCombiData$,
        filters: this.dataStoreService.filters$,
      }).subscribe(({deckCombiData, filters }) => {
        if (deckCombiData.length > 0) {
          if (filters.dataThreshold) {
            this.minGamesThreshhold = filters.dataThreshold
          }
          this.processDeckCombiForChart(deckCombiData);
          //this.processWarbandsForChart(warbandData);
        }
      });
  
      window.addEventListener('themeChange', (event) => {
        this.darkMode = document.body.classList.contains('dark-theme');
      });
    }

    processDeckCombiForChart(data: DeckCombiData[]): void {
      //Get Array from key object Map and sort it
      this.totalGames = data.reduce((acc, curr) => acc + curr.gamesPlayed, 0) / 2
  
      // Prepare chart data
      this.winrateByDeckCombiChartData = data.slice().map((deckCombi) => ({
        name1: deckCombi.name1,
        name2: deckCombi.name2,
        winrate: deckCombi.gamesPlayed > 0 ? (deckCombi.gamesWon / deckCombi.gamesPlayed) * 100 : 0,
        iconLink1: deckCombi.icon1,
        iconLink2: deckCombi.icon2,
        metaScore: deckCombi.metaScore,
        gamesPlayed: deckCombi.gamesPlayed,
        legality: deckCombi.legality,
      }));
      console.log("warbandData", this.warbandData)
      //sort by Winrate in a very bad way :(
      this.winrateByDeckCombiChartData.sort((a, b) => {
        if (a.gamesPlayed >= this.minGamesThreshhold && b.gamesPlayed >= this.minGamesThreshhold) {
          return b.winrate - a.winrate;
        } else if (a.gamesPlayed >= this.minGamesThreshhold) {
          return -1;
        } else if (b.gamesPlayed >= this.minGamesThreshhold) {
          return 1;
        } else {
          return 0;
        }
      });
  
      console.log('winrates', this.winrateByDeckCombiChartData)
    }
  
    navigateToDeckCombiDetails(deckCombi: any): void {
      console.log(`/main/deck-winrates/${deckCombi.name1+' + '+deckCombi.name2}`)
      this.router.navigate([`/main/deck-winrates/${deckCombi.name1+' + '+deckCombi.name2}`]);
    }
  }

