import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { routes } from './app/app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule), 
    provideAnimationsAsync(), 
    provideRouter(routes), provideCharts(withDefaultRegisterables()), provideCharts(withDefaultRegisterables())
  ],
}).catch(err => console.error(err));
