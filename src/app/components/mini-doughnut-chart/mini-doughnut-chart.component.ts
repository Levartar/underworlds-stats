import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ArcElement, Chart, ChartEvent, DoughnutController, Legend, Tooltip } from 'chart.js';

import { darkenColor } from '../../helpers/color.helpers';
import { chartOptions } from '../../chart-options';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-mini-doughnut-chart',
  standalone: true,
  imports: [],
  templateUrl: './mini-doughnut-chart.component.html',
  styleUrl: './mini-doughnut-chart.component.css'
})
export class MiniDoughnutChartComponent implements AfterViewInit {
  @Input() chartId: string = '';
  @Input() data!: { names: string[], values: number[], colors: string[] };
  
  labels: string[] = [];
  values: number[] = [];
  colors: string[] = [];

  public chart: Chart | null = null;

  constructor(private dialog: MatDialog) {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
  }

  ngAfterViewInit(): void {
    this.labels = this.data.names;
    this.values = this.data.values;
    this.colors = this.data.colors;
    this.renderChart();
    console.log("MiniDoughnutComponent", this.labels, this.values, this.colors)
  }

  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = document.getElementById(this.chartId) as HTMLCanvasElement;

    if (canvas) {
      this.chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: this.labels,
          datasets: [
            {
              data: this.values,
              backgroundColor: this.colors,
              hoverBackgroundColor: this.colors.map(color => darkenColor(color, 48)),
              borderWidth: 1
            }
          ]
        },
        options: chartOptions
      });
    }
  }
};
