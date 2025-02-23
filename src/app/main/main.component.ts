import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, forkJoin } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list'
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import {MatTooltipModule} from '@angular/material/tooltip';

import { WarbandDataCalculationsService } from '../services/warband-data-calculations.service';
import { DataStoreService } from '../store/sheet-data.store';
import { GoogleSheetService } from '../services/google-sheet.service';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { FilterComponent } from "../components/filter/filter.component";
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent } from '../components/simple-dialog/simple-dialog.component';


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
    MatSlideToggleModule,
    RouterModule,
    MatListModule,
    HeaderComponent,
    FooterComponent,
    FilterComponent,
    MatTooltipModule,
],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})

export class MainComponent implements OnInit {
  data: any[] | null = null;
  darkmode: boolean = true;
  currentRouteName: string = 'Dashboard';
  showFilter = true;

  constructor(
    private warbandDataCalculationsService: WarbandDataCalculationsService,
    private googleSheetService: GoogleSheetService,
    private dataStoreService: DataStoreService,
    private router: Router, private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    // Fetch data
    forkJoin({
      gameData: this.googleSheetService.fetchSheetData(),
      warbandData: this.googleSheetService.fetchSheetWarband(),
      deckData: this.googleSheetService.fetchSheetDecks(),
      metasData: this.googleSheetService.fetchSheetMetas(),
    }).subscribe(({ gameData, warbandData, deckData, metasData }) => {
      // Parse and store data
      const parsedGameData = this.googleSheetService.parseCsvData(gameData);
      const parsedWarbandData = this.googleSheetService.parseWarbandCsvData(warbandData);
      const parsedDeckData = this.googleSheetService.parseDecksCsvData(deckData)
      const parsedMetasData = this.googleSheetService.parseMetasCsvData(metasData);

      this.dataStoreService.setGameSheet(parsedGameData);
      this.dataStoreService.setWarbandSheet(parsedWarbandData);
      this.dataStoreService.setDeckSheet(parsedDeckData);
      this.dataStoreService.setMetas$(parsedMetasData);
      this.warbandDataCalculationsService.calculateWarbandData();
      this.warbandDataCalculationsService.calculateDeckData();
      this.warbandDataCalculationsService.calculateDeckCombiData();
    });

    this.googleSheetService.fetchSheetData().subscribe(csv => {
      this.data = this.googleSheetService.parseCsvData(csv);
    });
    
    this.updateRouteName();
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd)) // Filter only NavigationEnd events
    .subscribe(() => {
      this.updateRouteName();
    });
  }

  private updateRouteName(): void {
  // Access the first child route of the activated route
  const firstChild = this.activatedRoute.firstChild;

    // Get the route's `data.title` or use a fallback name
    this.currentRouteName = firstChild?.snapshot.data['title'] || 'Dashboard';  }

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
    // Dispatch the custom event `themeChange`
    const event = new CustomEvent('themeChange', { detail: { darkmode: this.darkmode } });
    window.dispatchEvent(event);
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  openDialog(): void {
    this.dialog.open(SimpleDialogComponent);
  }
}
