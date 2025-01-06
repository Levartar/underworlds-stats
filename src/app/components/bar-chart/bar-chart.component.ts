import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ArcElement, BarController, BarElement, CategoryScale, Chart, ChartEvent, Legend, LinearScale, Tooltip } from 'chart.js';
import { WarbandDataDialogComponent } from '../warband-data-dialog/warband-data-dialog.component';
import { chartOptions } from '../../chart-options';
import { darkenColor } from '../../helpers/color.helpers';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent {
@Input() chartId: string = '';
@Input() data!: { names: string[], values: number[], color: string };

  labels: string[] = [];
  values: number[] = [];
  color: string = 'ccc';

  public chart: Chart | null = null;

  constructor(private dialog: MatDialog) {
    Chart.register(BarElement, CategoryScale, BarController, LinearScale, Tooltip, Legend);
  }

  ngAfterViewInit(): void {
    this.labels = this.data.names;
    this.values = this.data.values;
    this.color = this.data.color;
    this.renderChart();
    console.log("barComponent", this.labels, this.values, this.color)
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
        type: 'bar',
        data: {
          labels: this.labels,
          datasets: [
            {
              data: this.values,
              backgroundColor: this.color,
              hoverBackgroundColor: darkenColor(this.color, 48),
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