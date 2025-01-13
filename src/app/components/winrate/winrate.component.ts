import { Component } from '@angular/core';
import { CommonModule} from '@angular/common';
import { MatList, MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import { DeckCombiData, SheetWarband, WarbandData } from '../../models/spreadsheet.model';
import { DataStoreService } from '../../store/sheet-data.store';


@Component({
  selector: 'app-winrate',
  standalone: true,
  imports: [MatListModule, CommonModule, MatButtonModule],
  templateUrl: './winrate.component.html',
  styleUrl: './winrate.component.scss'
})
export class WinrateComponent {
  totalGames: number = 0;
  warbandData: SheetWarband[] = [];

  // Chart data
  warbandNameChartLabels: string[] = [];
  gamesByWarbandChartData: { names: string[], values: number[], colors: string[] } | null = null;
  metascoreByWarbandChartData: { names: string[], values: number[], colors: string[] } | null = null;
  metascoreByDeckCombi: { names: string[], values: number[], colors: string[] } | null = null;
  warbandChartColors: string[] = [];
  winrateByWarbandChartData: {name: string, value: number, iconLink: string}[] = [];

  constructor(
    private dataStoreService: DataStoreService
  ) { }

  ngOnInit(): void {
    // Subscribe to data from the store
    this.dataStoreService.warbandData$.subscribe((data) => {
      if (data.length > 0) {
        this.processWarbandsForChart(data);
      }
    });

    this.dataStoreService.deckCombiData$.subscribe((data) => {
      if (data.length > 0) {
        this.processDecksForChart(data);
      }
    });
  }

  processDecksForChart(data: DeckCombiData[]) {
    this.totalGames = data.reduce((acc, curr) => acc + curr.gamesPlayed, 0) / 2
    const sortByMetaDecks = data.sort((a, b) =>
      b.metaScore - a.metaScore);

    this.metascoreByDeckCombi = {
      names: sortByMetaDecks.map(deck => `${deck.name1} + ${deck.name2}`),
      values: sortByMetaDecks.map(deck => Math.floor(deck.metaScore)),
      colors: sortByMetaDecks.map(deck => deck.colorA)
    }
    console.log("metascoreByDeckCombi", this.metascoreByWarbandChartData)
  }

  processWarbandsForChart(data: WarbandData[]): void {
    //Get Array from key object Map and sort it
    this.totalGames = data.reduce((acc, curr) => acc + curr.gamesPlayed, 0) / 2
    console.log('totalgames', this.totalGames)
    const sortByGamesWarbands = data.slice().sort((a, b) =>
      b.gamesPlayed - a.gamesPlayed); //.slice() creates a shallow
    const sortByMetaWarbands = data.slice().sort((a, b) =>
      b.metaScore - a.metaScore);

    // Prepare chart data

    data.slice().forEach(
        wb=>{
          this.winrateByWarbandChartData.push({
            name: wb.name, 
            value: wb.gamesPlayed>0?(wb.gamesWon / wb.gamesPlayed)*100:0,
            iconLink: wb.icon,
          })
        }
      )
    //sort by Winrate
    this.winrateByWarbandChartData.sort((a,b) => b.value-a.value);

    console.log('winrates',this.winrateByWarbandChartData)

    this.gamesByWarbandChartData = {
      names: sortByGamesWarbands.map(wb => wb.name),
      values: sortByGamesWarbands.map(wb => wb.gamesPlayed),
      colors: sortByGamesWarbands.map(wb => wb.colorB)
    }

    this.metascoreByWarbandChartData = {
      names: sortByMetaWarbands.map(wb => wb.name),
      values: sortByMetaWarbands.map(wb => Math.floor(wb.metaScore)),
      colors: sortByMetaWarbands.map(wb => wb.colorB)
    }
  }

}
