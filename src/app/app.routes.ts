import { Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainComponent } from './main/main.component';
import { WinrateComponent } from './components/winrate/winrate.component';
import { WarbandDetailsCardComponent } from './components/warband-details-card/warband-details-card.component';
import { WarbandsComponent } from './components/warbands/warbands.component';
import { MetaComponent } from './components/meta/meta.component';
import { DecksComponent } from './components/decks/decks.component';
import { DecksDetailsCardComponent } from './components/decks-details-card/decks-details-card.component';
import { DeckCombiWinratesComponent } from './components/deck-combi-winrates/deck-combi-winrates.component';
import { DeckCombiDetailsCardComponent } from './components/deck-combi-details-card/deck-combi-details-card.component';
import { DeckMetaComponent } from './components/deck-meta/deck-meta.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full'},
  {
    path: 'main', component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: LandingPageComponent,
        data: { title: 'Dashboard' },
        children: [
          {
            path: 'deck/:name', component: DeckCombiDetailsCardComponent
          },
          {
            path: 'warband/:name', component: WarbandDetailsCardComponent
          }
        ]
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
        path: 'warband-winrates',
        component: WinrateComponent,
        data: { title: 'Warband Winrates' },
        children: [
          {
            path: ':name', component: WarbandDetailsCardComponent
          }
        ]
      },
      {
        path: 'deck-winrates',
        component: DeckCombiWinratesComponent,
        data: { title: 'Deck Winrates' },
        children: [
          {
            path: ':name', component: DeckCombiDetailsCardComponent
          }
        ]
      },
      {
        path: 'warband-meta',
        component: MetaComponent,
        data: { title: 'Warband Meta' },
      },
      {
        path: 'deck-meta',
        component: DeckMetaComponent,
        data: { title: 'Deck Meta' },
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

