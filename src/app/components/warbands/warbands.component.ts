import { CommonModule, NgFor } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { DataStoreService } from '../../store/sheet-data.store';
import { WarbandData } from '../../models/spreadsheet.model';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-warbands',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './warbands.component.html',
  styleUrl: './warbands.component.scss'
})
export class WarbandsComponent {
  warbandData: {
    name: string, winrate: number,
    iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
  }[] = [];

  filteredWarbandData: {
    name: string, winrate: number,
    iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
  }[] = [];

  searchTerm: string = '';

  constructor(
    private router: Router,
    private dataStoreService: DataStoreService,
  ) { }

  ngOnInit(): void {
    // Subscribe to data from the store
    this.dataStoreService.warbandData$.subscribe((data) => {
      if (data.length > 0) {
        this.processWarbandsForChart(data);
        this.searchWarbands();
      }
    });
  }

  processWarbandsForChart(data: WarbandData[]): void {
    this.warbandData = data.slice().map((wb) => ({
        name: wb.name,
        winrate: wb.gamesPlayed > 0 ? (wb.gamesWon / wb.gamesPlayed) * 100 : 0,
        iconLink: wb.icon,
        metaScore: wb.metaScore,
        gamesPlayed: wb.gamesPlayed,
        legality: wb.legality == "TRUE",
      }));
      console.log("warbandData",this.warbandData)
  }

  searchWarbands() {
    if (this.searchTerm.trim() === '') {
      this.filteredWarbandData = this.warbandData;
    } else {
      this.filteredWarbandData = this.warbandData.filter(warband =>
        warband.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  navigateToWarbandDetails(warband: any) {
    this.router.navigate([`/main/warbands/${warband.name}`]);
  }
}
