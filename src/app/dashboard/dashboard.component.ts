import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import {ChartOptions } from 'chart.js'

import { GoogleSheetService } from '../services/google-sheet.service';
import { WARBAAND_CONFIG } from '../models/warband-config';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  totalGames: number = 0;
  gamesByWarband: { [key: string]: number } = {};
  sortedWarbands: { name: string; count: number; color: string }[] = [];

  // Chart data
  warbandNameChartLabels: string[] = [];
  gamesByWarbandChartData: number[] = [];
  warbandChartColors: string[] = [];
  chart: Chart | null = null;

  constructor(private googleSheetService: GoogleSheetService) {}

  ngOnInit(): void {
    this.googleSheetService.fetchSheetData().subscribe((data) => {
      this.processData(this.googleSheetService.parseCsvData(data));
      this.sortWarbandsBySize();
      this.renderChart()
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
    // Map stats to sorted array using configuration
    this.sortedWarbands = Object.entries(this.gamesByWarband)
      .map(([name, count]) => {
        const config = WARBAAND_CONFIG.find(wb => wb.name === name);
        return {
          name,
          count,
          color: config?.color || '#000000' // Default to black if not found
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
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
            tooltip: {
              enabled: true,
            },
          },
          elements: {
            arc: {
              borderWidth: 2,
            },
          },
        }
      });
    }
  }
}