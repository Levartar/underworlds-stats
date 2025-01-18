import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatList, MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';

import { DeckCombiData, SheetWarband, WarbandData } from '../../models/spreadsheet.model';
import { DataStoreService } from '../../store/sheet-data.store';



@Component({
  selector: 'app-winrate',
  standalone: true,
  imports: [
    RouterModule,
    MatListModule,
    CommonModule,
    MatButtonModule,
    MatCardModule],
  templateUrl: './winrate.component.html',
  styleUrl: './winrate.component.scss'
})
export class WinrateComponent {
  totalGames: number = 0;
  warbandData: SheetWarband[] = [];
  selectedWarband: any;

  // Chart data
  warbandNameChartLabels: string[] = [];
  gamesByWarbandChartData: { names: string[], values: number[], colors: string[] } | null = null;
  metascoreByWarbandChartData: { names: string[], values: number[], colors: string[] } | null = null;
  metascoreByDeckCombi: { names: string[], values: number[], colors: string[] } | null = null;
  warbandChartColors: string[] = [];
  winrateByWarbandChartData: {
    name: string, winrate: number,
    iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
  }[] = [];

  constructor(
    private router: Router,
    private dataStoreService: DataStoreService
  ) { }

  ngOnInit(): void {
    // Subscribe to data from the store
    this.dataStoreService.warbandData$.subscribe((data) => {
      if (data.length > 0) {
        this.processWarbandsForChart(data);
      }
    });
  }

  processWarbandsForChart(data: WarbandData[]): void {
    //Get Array from key object Map and sort it
    this.totalGames = data.reduce((acc, curr) => acc + curr.gamesPlayed, 0) / 2

    // Prepare chart data

    this.winrateByWarbandChartData = data.slice().map((wb) => ({
      name: wb.name,
      winrate: wb.gamesPlayed > 0 ? (wb.gamesWon / wb.gamesPlayed) * 100 : 0,
      iconLink: wb.icon,
      metaScore: wb.metaScore,
      gamesPlayed: wb.gamesPlayed,
      legality: wb.legality == "TRUE",
    }));
    console.log("warbandData", this.warbandData)
    //sort by Winrate
    this.winrateByWarbandChartData.sort((a, b) => b.winrate - a.winrate);

    console.log('winrates', this.winrateByWarbandChartData)
  }

  navigateToWarbandDetails(warband: any): void {
    console.log(`/main/winrates/${warband.name}`)
    this.router.navigate([`/main/winrates/${warband.name}`]);
  }
}
