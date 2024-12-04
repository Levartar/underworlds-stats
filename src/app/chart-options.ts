// src/app/chart-options.ts

import { ChartOptions } from 'chart.js';

export const chartOptions: ChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right', // Place the legend outside
      //labels: {
      //  boxWidth: 20,
      //  padding: 20,
      //},
    },
    tooltip: {
      enabled: true, // Enable tooltips on hover
    },
    //Currently Not Working. 
    //Should add pointers from the names to the chart parts
    //datalabels: {
    //  anchor: 'end', // Position labels at the end of the segment
    //  align: 'start', // Align labels to the side
    //  formatter: (value: any, context: any) => {
    //    return context.chart.data.labels[context.dataIndex]; // Show the name of the warband
    //  },
    //},
  },
  elements: {
    arc: {
      borderWidth: 2, // Adjust border width of the doughnut chart
    },
  },
  maintainAspectRatio: false, // To make sure the chart maintains a proper aspect ratio
};
