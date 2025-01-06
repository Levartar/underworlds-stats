import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { NgIf } from '@angular/common';

import { DeckCombiData, DeckData, SheetData, SheetWarband, WarbandData } from '../models/spreadsheet.model';
import { DataStoreService } from '../store/sheet-data.store'
import { DoughnutChartComponent } from '../components/doughnut-chart/doughnut-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DoughnutChartComponent, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  totalGames: number = 0;
  warbandData: SheetWarband[] = [];
  gameData: SheetData[] = [];
  gamesByWarband: { [key: string]: { count: number; color: string } } = {};

  // Chart data
  warbandNameChartLabels: string[] = [];
  gamesByWarbandChartData: {names:string[],values:number[],colors:string[]}|null = null;
  metascoreByWarbandChartData: {names:string[],values:number[],colors:string[]}|null = null;
  metascoreByDeckCombi: {names:string[],values:number[],colors:string[]}|null = null;
  warbandChartColors: string[] = [];
  chart: Chart | null = null;

  constructor(
    private dataStoreService: DataStoreService
  ) { }

  ngOnInit(): void {
    // Subscribe to data from the store
    this.dataStoreService.warbandData$.subscribe((data) => {
      if (data.length>0) {
        this.processWarbandsForChart(data);
      }
    });

    this.dataStoreService.deckCombiData$.subscribe((data) => {
      if (data.length>0) {
        this.processDecksForChart(data);
      }
    });
  }


  processDecksForChart(data: DeckCombiData[]) {
    this.totalGames = data.reduce((acc, curr)=>acc+curr.gamesPlayed,0)/2
    const sortByMetaDecks = data.sort((a, b) =>
      b.metaScore - a.metaScore);

    this.metascoreByDeckCombi = {
      names: sortByMetaDecks.map(deck=> `${deck.name1} + ${deck.name2}`),
      values: sortByMetaDecks.map(deck=> Math.floor(deck.metaScore)),
      colors: sortByMetaDecks.map(deck=> deck.colorA)
    }
    console.log("metascoreByDeckCombi",this.metascoreByWarbandChartData)
  }

  processWarbandsForChart(data: WarbandData[]): void {
    //Get Array from key object Map and sort it
    this.totalGames = data.reduce((acc, curr)=>acc+curr.gamesPlayed,0)/2
    console.log('totalgames',this.totalGames)
    const sortByGamesWarbands = data.slice().sort((a, b) =>
      b.gamesPlayed - a.gamesPlayed); //.slice() creates a shallow
    const sortByMetaWarbands = data.slice().sort((a, b) =>
      b.metaScore - a.metaScore);

    // Prepare chart data
    this.gamesByWarbandChartData = {
      names: sortByGamesWarbands.map(wb=> wb.name),
      values: sortByGamesWarbands.map(wb=> wb.gamesPlayed),
      colors: sortByGamesWarbands.map(wb=> wb.colorB)
    }
    console.log("gamesByWarbandChartData",this.gamesByWarbandChartData)

    this.metascoreByWarbandChartData = {
      names: sortByMetaWarbands.map(wb=> wb.name),
      values: sortByMetaWarbands.map(wb=> Math.floor(wb.metaScore)),
      colors: sortByMetaWarbands.map(wb=> wb.colorB)
    }
    console.log("metascoreChartData",this.metascoreByWarbandChartData)
  }
}