import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list'
import { RouterModule } from '@angular/router';

import { WarbandDataCalculationsService } from '../../services/warband-data-calculations.service';
import { DataStoreService } from '../../store/sheet-data.store';
import { GoogleSheetService } from '../../services/google-sheet.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatSidenavModule,
    RouterModule,
    MatListModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})

export class MainComponent implements OnInit {
  data: any[] | null = null;
  darkmode: boolean = false;

  constructor(
    private warbandDataCalculationsService: WarbandDataCalculationsService,
    private googleSheetService: GoogleSheetService,
    private dataStoreService: DataStoreService
  ) {   console.log('MainComponent loaded');}

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

  toggleTheme() {
    if (this.darkmode) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      this.darkmode = false;
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      this.darkmode = true;
    }
  }
}
