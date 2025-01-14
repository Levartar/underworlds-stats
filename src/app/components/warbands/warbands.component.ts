import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { DataStoreService } from '../../store/sheet-data.store';
import { WarbandData } from '../../models/spreadsheet.model';

@Component({
  selector: 'app-warbands',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './warbands.component.html',
  styleUrl: './warbands.component.scss'
})
export class WarbandsComponent {
  warbandData: {
    name: string, winrate: number,
    iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
  }[] = [];

  constructor(
    private router: Router,
    private dataStoreService: DataStoreService
  ) {}

    ngOnInit(): void {
      // Subscribe to data from the store
      this.dataStoreService.warbandData$.subscribe((data) => {
        if (data.length > 0) {
          this.processWarbandsForChart(data);
        }
      });
    }
  
    processWarbandsForChart(data: WarbandData[]): void {
      data.slice().forEach((wb) => {
        this.warbandData.push({
          name: wb.name,
          winrate: wb.gamesPlayed > 0 ? (wb.gamesWon / wb.gamesPlayed) * 100 : 0,
          iconLink: wb.icon,
          metaScore: wb.metaScore,
          gamesPlayed: wb.gamesPlayed,
          legality: wb.legality == "TRUE",
        });
      });
    }

  navigateToWarbandDetails(warband: any) {
    this.router.navigate([`/main/warbands/${warband.name}`]);
  }
}
