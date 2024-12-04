import { Component, Input, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

import { darkenColor } from '../../helpers/color.helpers';
import { chartOptions } from '../../chart-options';


@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [],
  templateUrl: './doughnut-chart.component.html',
  styleUrl: './doughnut-chart.component.css'
})
export class DoughnutChartComponent implements OnInit {
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() colors: string[] = [];

  public chart: Chart | null = null;

  constructor() {}

  ngOnInit(): void {
    this.renderChart();
    console.log(this.labels,this.data,this.colors)
  }

  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = document.getElementById('doughnut-chart') as HTMLCanvasElement;

    if (canvas) {
      this.chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: this.labels,
          datasets: [
            {
              label: "Games",
              data: this.data,
              backgroundColor: this.colors,
              hoverBackgroundColor: this.colors.map(color=>darkenColor(color,48)),
              borderWidth: 1
            }
          ]
        },
        options: chartOptions
      });
    }
  }
};
