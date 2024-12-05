import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import { ChartOptions } from 'chart.js'
import { NgIf } from '@angular/common';

import { GoogleSheetService } from '../services/google-sheet.service';
import { chartOptions } from '../chart-options';
import { SheetData, SheetWarband, WarbandData } from '../models/spreadsheet.model';
import { DataStoreService } from '../store/sheet-data.store'
import { darkenColor } from '../helpers/color.helpers';
import { DoughnutChartComponent } from '../components/doughnut-chart/doughnut-chart.component';
import { WarbandDataCalculationsService } from '../services/warband-data-calculations.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DoughnutChartComponent, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
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
  isDataReady: boolean = false;


  constructor(
    private googleSheetService: GoogleSheetService,
    private warbandDataCalculationsService: WarbandDataCalculationsService,
    private dataStoreService: DataStoreService
  ) { }

  ngOnInit(): void {
    // Fetch data if not already in store
    forkJoin({
      gameData: this.googleSheetService.fetchSheetData(),
      warbandData: this.googleSheetService.fetchSheetWarband()
    }).subscribe(({ gameData, warbandData }) => {
      // Parse and store data
      const parsedGameData = this.googleSheetService.parseCsvData(gameData);
      const parsedWarbandData = this.googleSheetService.parseWarbandCsvData(warbandData);

      this.dataStoreService.setGameSheet(
        parsedGameData.map((gameEntry) => {
          // Find the warband data for Player 1
          const warbandData = parsedWarbandData.find((wb) => wb.name === gameEntry.p1Warband);

          return {
            ...gameEntry, // Spread existing game entry data
            color: warbandData?.colorB || '#000000', // Default to black if not found
            icon: warbandData?.icon || '', // Default to an empty string if no icon
            legality: warbandData?.legality == 'True' || false, // Default to false if legality not found
          };
        })
      );
      this.dataStoreService.setWarbandSheet(parsedWarbandData);
      this.warbandDataCalculationsService.calculateWarbandData();
      console.log()
    });

    // Subscribe to data from the store
    this.dataStoreService.warbandData$.subscribe((data) => {
      if (data.length>0) {
        this.processWarbandsForChart(data);
        console.log(data)
      }
    });
  }

  processWarbandsForChart(data: WarbandData[]): void {
    //Get Array from key object Map and sort it
    this.totalGames = data.reduce((acc, curr)=>acc+curr.gamesPlayed,0)/2
    console.log('totalgames',this.totalGames)
    const sortByGamesWarbands = data.sort((a, b) =>
      b.gamesPlayed - a.gamesPlayed);
    const sortByMetaWarbands = data.sort((a, b) =>
      b.metaScore - a.metaScore);

    // Prepare chart data
    this.gamesByWarbandChartData = {
      names: sortByGamesWarbands.map(wb=> wb.name),
      values: sortByGamesWarbands.map(wb=> wb.gamesPlayed),
      colors: sortByGamesWarbands.map(wb=> wb.colorB)
    }

    this.metascoreByWarbandChartData = {
      names: sortByMetaWarbands.map(wb=> wb.name),
      values: sortByMetaWarbands.map(wb=> wb.metaScore),
      colors: sortByMetaWarbands.map(wb=> wb.colorB)
    }
    this.isDataReady = true;
    console.log("metascoreChartData",this.metascoreByWarbandChartData)
  }
}