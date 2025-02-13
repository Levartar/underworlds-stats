import { Component, OnInit, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { combineLatest, forkJoin, map } from 'rxjs';

import { DataStoreService } from '../../store/sheet-data.store';
import { WarbandData } from '../../models/spreadsheet.model';
import { CardDataCalculationsService } from '../../services/card-data-calculations.service';

@Component({
  selector: 'app-warband-details-card',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './warband-details-card.component.html',
  styleUrl: './warband-details-card.component.scss'
})
export class WarbandDetailsCardComponent implements OnInit {
  selectedWarband: any;
  minGamesThreshhold: number=5;
  winrateByWarbandChartData: {
    name: string, winrate: number,
    iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
    bestSynergy: { deckCombiName: string, winrate: number, gamesWithDeckCombi:number },
    bestMatchup: { opponentName: string, winrate: number, bestGames:number },
    worstMatchup: { opponentName: string, winrate: number, worstGames:number },
  }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataStoreService: DataStoreService,
  ) { }

  ngOnInit() {
    // Subscribe to data from the store
    combineLatest({
      routeParams: this.route.paramMap,
      warbandData: this.dataStoreService.warbandData$,
      filters: this.dataStoreService.filters$,
    }).subscribe(({ routeParams, warbandData, filters}) => {
      const warbandName = routeParams.get('name');
      console.log("subscribtion runs",warbandName,warbandData)
      if (warbandName && warbandData.length > 0) {
        this.processWarbandsForChart(warbandData);
        this.updateWarbandDetails(warbandName);
        if (filters.dataThreshold){
          this.minGamesThreshhold = filters.dataThreshold
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle any changes in inputs or other relevant data here
    if (changes['selectedWarband']) {
      // Update the selected warband data
    }
  }

  processWarbandsForChart(data: WarbandData[]): void {
    this.winrateByWarbandChartData= CardDataCalculationsService.processWarbandsforChartData(
      data,this.minGamesThreshhold)
    console.log('warbandDetailsCardloadedWarbands', this.winrateByWarbandChartData)
  }

  private updateWarbandDetails(warbandName: string | null): void {
    if (warbandName) {
      // Find the warband data based on the name
      console.log('name is set')
      this.selectedWarband = this.getWarbandByName(warbandName);
    }
  }

  private getWarbandByName(name: string | null): any {
    return this.winrateByWarbandChartData.find((warband) => warband.name === name);
  }

  closeCard() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}