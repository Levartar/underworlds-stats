import { Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainComponent } from './main/main.component';
import { WinrateComponent } from './components/winrate/winrate.component';
import { WarbandDetailsCardComponent } from './components/warband-details-card/warband-details-card.component';
import { WarbandsComponent } from './components/warbands/warbands.component';
import { MetaComponent } from './components/meta/meta.component';
import { DecksComponent } from './components/decks/decks.component';
import { DecksDetailsCardComponent } from './components/decks-details-card/decks-details-card.component';

export const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full'},
  {
    path: 'main', component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'winrates',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        redirectTo: 'winrates',
        //component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'decks',
        component: DecksComponent,
        data: { title: 'Decks' },
        children: [
          {
            path: ':name', component: DecksDetailsCardComponent
          }
        ]
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
        component: MetaComponent,
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

