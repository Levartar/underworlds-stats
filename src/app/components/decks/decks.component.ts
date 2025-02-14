import { CommonModule, NgFor } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { DataStoreService } from '../../store/sheet-data.store';
import { DeckData, WarbandData } from '../../models/spreadsheet.model';
import { combineLatest } from 'rxjs';


@Component({
  selector: 'app-decks',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './decks.component.html',
  styleUrl: './decks.component.scss'
})
export class DecksComponent {
  deckData: DeckData[] = [];
  filteredDecksData: DeckData[] = [];

  searchTerm: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataStoreService: DataStoreService,
  ) { }

  ngOnInit(): void {
    // Subscribe to data from the store
    combineLatest({
      routeParams: this.route.paramMap,
      deckData: this.dataStoreService.deckData$,
      filters: this.dataStoreService.filters$,
    }).subscribe(({ routeParams, deckData, filters }) => {
      //const warbandName = routeParams.get('name');
      console.log("subscribtion runs", deckData)
      if (deckData.length > 0) {
        this.processDecksForChart(deckData);
        this.searchDecks();
      }
    });
  }

  processDecksForChart(data: DeckData[]): void {
    this.deckData=data
    console.log("deckData", data)
  }

  searchDecks() {
    if (this.searchTerm.trim() === '') {
      this.filteredDecksData = this.deckData;
    } else {
      this.filteredDecksData = this.deckData.filter(deck =>
        deck.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  navigateToDeckDetails(deck: any) {
    this.router.navigate([`/main/decks/${deck.name}`]);
  }
}