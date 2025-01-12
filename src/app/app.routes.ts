import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainComponent } from './components/main/main.component';

export const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full'},
  {
    path: 'main', component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'decks',
        redirectTo: 'dashboard'
        //component: DecksComponent,
      },
      {
        path: 'winrate',
        redirectTo: 'dashboard'
        //component: WinrateComponent,
      },
      {
        path: 'meta',
        redirectTo: 'dashboard'
        //component: MetaComponent,
      },
      {
        path: 'warbands',
        redirectTo: 'dashboard'
        //component: WarbandsComponent,
      },
    ]
  },
  { path: '**', redirectTo: 'main'}
];

