import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import {ChartOptions } from 'chart.js'

import { GoogleSheetService } from '../services/google-sheet.service';
import { WARBAAND_CONFIG } from '../models/warband-config';
import { chartOptions } from '../chart-options';
import { SheetData, SheetWarband } from '../models/spreadsheet.model';

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
  gamesByWarband: { [key: string]: number } = {};
  sortedWarbands: { name: string; count: number; color: string }[] = [];

  // Chart data
  warbandNameChartLabels: string[] = [];
  gamesByWarbandChartData: number[] = [];
  warbandChartColors: string[] = [];
  chart: Chart | null = null;

  constructor(private googleSheetService: GoogleSheetService) {}

  ngOnInit(): void {
    forkJoin({
      gameData: this.googleSheetService.fetchSheetData(),
      warbandData: this.googleSheetService.fetchSheetWarband()
    }).subscribe(({ gameData, warbandData }) => {
      // Process game data
      const parsedGameData = this.googleSheetService.parseCsvData(gameData);
      this.processData(parsedGameData);

      // Process warband data
      const parsedWarbandData = this.googleSheetService.parseWarbandCsvData(warbandData);
      this.warbandData = parsedWarbandData;
      this.sortWarbandsBySize();

      // Render the chart only after both are processed
      this.renderChart();
      console.log(parsedWarbandData)
    });
  }

 processData(data: any[]): void {
    this.totalGames = data.length;

    data.forEach(row => {
      const warband = row.p1Warband;
      this.gamesByWarband[warband] = (this.gamesByWarband[warband] || 0) + 1;
    });
    console.log(this.gamesByWarband)
  }

  sortWarbandsBySize(): void {
    //Get Color From Warband Data Sheet
    this.sortedWarbands = Object.entries(this.gamesByWarband)
      .map(([name, count]) => {
        const color = this.warbandData.find(wb => 
          wb.name === name)?.colorB;
        return {
          name,
          count,
          color: color || '#000000' // Default to black if not found
        };
      })
      .sort((a, b) => b.count - a.count); // Sort by size

    // Prepare chart data
    this.warbandNameChartLabels = this.sortedWarbands.map(wb => wb.name);
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
              hoverBackgroundColor: this.warbandChartColors,
              borderWidth: 1
            }
          ]
        },
        options: chartOptions
      });
    }
  }
}