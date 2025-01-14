import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainComponent } from './main/main.component';
import { WinrateComponent } from './components/winrate/winrate.component';
import { WarbandDetailsCardComponent } from './components/warband-details-card/warband-details-card.component';
import { WarbandsComponent } from './components/warbands/warbands.component';

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
        path: 'winrates',
        component: WinrateComponent,
        data: { title: 'Winrates' },
        children: [
          {
            path: ':name', component: WarbandDetailsCardComponent
          }
        ]
      },
      {
        path: 'meta',
        redirectTo: 'dashboard',
        //component: MetaComponent,
        data: { title: 'Meta' },
      },
      {
        path: 'warbands',
        component: WarbandsComponent,
        data: { title: 'Warbands' },
        children: [
          {
            path: ':name', component: WarbandDetailsCardComponent
          }
        ]
      },
    ]
  },
  { path: '**', redirectTo: 'main'}
];

