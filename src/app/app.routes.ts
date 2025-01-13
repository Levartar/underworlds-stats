import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainComponent } from './main/main.component';
import { WinrateComponent } from './components/winrate/winrate.component';

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
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'decks',
        redirectTo: 'dashboard',
        //component: DecksComponent,
        data: { title: 'Decks' },
      },
      {
        path: 'winrate',
        component: WinrateComponent,
        data: { title: 'Winrates' },
      },
      {
        path: 'meta',
        redirectTo: 'dashboard',
        //component: MetaComponent,
        data: { title: 'Meta' },
      },
      {
        path: 'warbands',
        redirectTo: 'dashboard',
        //component: WarbandsComponent,
        data: { title: 'Warbands' },
      },
    ]
  },
  { path: '**', redirectTo: 'main'}
];

