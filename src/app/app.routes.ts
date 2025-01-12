import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainComponent } from './components/main/main.component';

export const routes: Routes = [
  {
    path: 'main', component: MainComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'warbands',
        component: DashboardComponent
      },
      {
        path: 'winrate',
        component: DashboardComponent
      },
      {
        path: 'meta',
        component: DashboardComponent
      },
      {
        path: 'decks',
        component: DashboardComponent
      }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

