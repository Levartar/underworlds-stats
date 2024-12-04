import { PluginOptions } from 'chart.js';

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends keyof ChartTypeRegistry> {
    datalabels?: PluginOptions<'doughnut'>;
  }
}
