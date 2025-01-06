import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ArcElement, Chart, ChartEvent, DoughnutController, Legend, Tooltip } from 'chart.js';

import { darkenColor } from '../../helpers/color.helpers';
import { chartOptions } from '../../chart-options';
import { MatDialog } from '@angular/material/dialog';
import { WarbandDataDialogComponent } from '../warband-data-dialog/warband-data-dialog.component';


@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [],
  templateUrl: './doughnut-chart.component.html',
  styleUrl: './doughnut-chart.component.scss'
})
export class DoughnutChartComponent implements AfterViewInit {
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
    console.log("doughnutComponent", this.labels, this.values, this.colors)
  }

  handleChartClick(event: ChartEvent): void {
    const activePoints = this.chart!.getElementsAtEventForMode(
      event.native!,
      'nearest',
      { intersect: true },
      false
    );

    if (activePoints.length > 0) {
      const datasetIndex = activePoints[0].datasetIndex;
      const index = activePoints[0].index;
      const warbandName = this.labels[index];

      // Open dialog with the warband name
      const dialogRef = this.dialog.open(WarbandDataDialogComponent, {
        data: { warbandName },
        width: 'auto',
        height: 'auto',
        disableClose: false,
        backdropClass: 'custom-backdrop', // Optional: Custom backdrop styling
        panelClass: 'custom-dialog-container', // Optional: Custom dialog styling
      });
    }
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
        options: {
          ...chartOptions,
          onClick: this.handleChartClick.bind(this),
        }
      });
    }
  }
};
