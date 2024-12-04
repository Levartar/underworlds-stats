import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import { ChartOptions } from 'chart.js'

import { GoogleSheetService } from '../services/google-sheet.service';
import { WARBAAND_CONFIG } from '../models/warband-config';
import { chartOptions } from '../chart-options';
import { SheetData, SheetWarband } from '../models/spreadsheet.model';
import { DataStoreService } from '../store/sheet-data.store'
import { darkenColor } from '../helpers/color.helpers';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  totalGames: number = 0;
  warbandData: SheetWarband[] = [];
  gameData: SheetData[] = [];
  gamesByWarband: { [key: string]: {count:number;color:string}} = {};
  sortedWarbands: {name:string; count: number; color: string}[] = [];

  // Chart data
  warbandNameChartLabels: string[] = [];
  gamesByWarbandChartData: number[] = [];
  warbandChartColors: string[] = [];
  chart: Chart | null = null;

  constructor(
    private googleSheetService: GoogleSheetService,
    private dataStoreService: DataStoreService
  ) { }

  ngOnInit(): void {
    // Check if data is already in the store
    if (!this.dataStoreService.getGameData() || !this.dataStoreService.getWarbandData()) {
      // Fetch data if not already in store
      forkJoin({
        gameData: this.googleSheetService.fetchSheetData(),
        warbandData: this.googleSheetService.fetchSheetWarband()
      }).subscribe(({ gameData, warbandData }) => {
        // Parse and store data
        const parsedGameData = this.googleSheetService.parseCsvData(gameData);
        const parsedWarbandData = this.googleSheetService.parseWarbandCsvData(warbandData);

        this.dataStoreService.setGameData(
          parsedGameData.map((gameEntry) => {
            // Find the warband data for Player 1
            const warbandData = parsedWarbandData.find((wb) => wb.name === gameEntry.p1Warband);
        
            return {
              ...gameEntry, // Spread existing game entry data
              color: warbandData?.colorB || '#000000', // Default to black if not found
              icon: warbandData?.icon || '', // Default to an empty string if no icon
              legality: warbandData?.legality=='True' || false, // Default to false if legality not found
            };
          })
        );
        this.dataStoreService.setWarbandData(parsedWarbandData);


        // Process game data
        //const parsedGameData = this.googleSheetService.parseCsvData(gameData);
        //this.processData(parsedGameData);
//
        //// Process warband data
        //const parsedWarbandData = this.googleSheetService.parseWarbandCsvData(warbandData);
        //this.warbandData = parsedWarbandData;
        //this.sortWarbandsBySize();

        // Render the chart only after both are processed
        //this.renderChart();
        //console.log(parsedWarbandData)
      });
    }
    // Subscribe to data from the store
    this.dataStoreService.gameData$.subscribe((data) => {
      if (data) {
        console.log(data)
        this.processData(data);
        this.sortWarbandsBySize();
        this.renderChart();
      }
    });
  }

  processData(data: SheetData[]): void {
    this.totalGames = data.length;

    data.forEach(row => {
      const warband = row.p1Warband;
      const color = row.color;
      if (!this.gamesByWarband[warband]) {
        this.gamesByWarband[warband] = { count: 0, color: color || '#000000' }; // Default to black if color is missing
      }
      this.gamesByWarband[warband].count++;
    });
    console.log(this.gamesByWarband)
  }

  sortWarbandsBySize(): void {
    //Get Array from key object Map and sort it
    this.sortedWarbands = Object.entries(
      this.gamesByWarband).map(([name,stats]) => ({name,count: stats.count,
        color: stats.color})).sort((a,b) => 
          b.count - a.count);

    // Prepare chart data
    this.warbandNameChartLabels = this.sortedWarbands.map(wb=>wb.name);
    this.gamesByWarbandChartData = this.sortedWarbands.map(wb => wb.count);
    this.warbandChartColors = this.sortedWarbands.map(wb => wb.color);
  }

  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = document.getElementById('gamesByWarbandChart') as HTMLCanvasElement;

    if (canvas) {
      this.chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: this.warbandNameChartLabels,
          datasets: [
            {
              label: "Games",
              data: this.gamesByWarbandChartData,
              backgroundColor: this.warbandChartColors,
              hoverBackgroundColor: this.warbandChartColors.map(color=>darkenColor(color,48)),
              borderWidth: 1
            }
          ]
        },
        options: chartOptions
      });
    }
  }
}