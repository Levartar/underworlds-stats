import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';

import { WarbandDataCalculationsService } from '../../services/warband-data-calculations.service';
import { DataStoreService } from '../../store/sheet-data.store';
import { GoogleSheetService } from '../../services/google-sheet.service';
import { DashboardComponent } from '../../dashboard/dashboard.component';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, DashboardComponent, MatTabsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})

export class MainComponent implements OnInit {
  data: any[] | null = null;

  constructor(
    private warbandDataCalculationsService: WarbandDataCalculationsService,
    private googleSheetService: GoogleSheetService,
    private dataStoreService: DataStoreService
  ) {}

  ngOnInit() {
    // Fetch data
    forkJoin({
      gameData: this.googleSheetService.fetchSheetData(),
      warbandData: this.googleSheetService.fetchSheetWarband(),
      deckData: this.googleSheetService.fetchSheetDecks(),
    }).subscribe(({ gameData, warbandData, deckData }) => {
      // Parse and store data
      const parsedGameData = this.googleSheetService.parseCsvData(gameData);
      const parsedWarbandData = this.googleSheetService.parseWarbandCsvData(warbandData);
      const parsedDeckData = this.googleSheetService.parseDecksCsvData(deckData)

      this.dataStoreService.setGameSheet(parsedGameData);
      this.dataStoreService.setWarbandSheet(parsedWarbandData);
      this.dataStoreService.setDeckSheet(parsedDeckData);
      this.warbandDataCalculationsService.calculateWarbandData();
      this.warbandDataCalculationsService.calculateDeckData();
      this.warbandDataCalculationsService.calculateDeckCombiData();
    });


    this.googleSheetService.fetchSheetData().subscribe(csv => {
      this.data = this.googleSheetService.parseCsvData(csv);
    });
  }
}
