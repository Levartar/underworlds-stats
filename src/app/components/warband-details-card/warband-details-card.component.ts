import { Component, ElementRef, OnInit, Renderer2, SimpleChanges } from '@angular/core';
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
  minGamesThreshhold: number = 15;
  winrateByWarbandChartData: {
    name: string, winrate: number,
    iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
    bestSynergy: { deckCombiName: string, winrate: number, gamesWithDeckCombi: number },
    bestMatchup: { opponentName: string, winrate: number, bestGames: number },
    worstMatchup: { opponentName: string, winrate: number, worstGames: number },
  }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataStoreService: DataStoreService,
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    // Subscribe to data from the store
    combineLatest({
      routeParams: this.route.paramMap,
      warbandData: this.dataStoreService.warbandData$,
      filters: this.dataStoreService.filters$,
    }).subscribe(({ routeParams, warbandData, filters }) => {
      const warbandName = routeParams.get('name');
      console.log("subscribtion runs", warbandName, warbandData)
      if (warbandName && warbandData.length > 0) {
        if (filters.dataThreshold) {
          this.minGamesThreshhold = filters.dataThreshold
        }
        this.processWarbandsForChart(warbandData);
        this.updateWarbandDetails(warbandName);
      }
    });

    // Add scroll event listener
    window.addEventListener('scroll', this.onScroll.bind(this));
    this.onScroll(); //Call double to fix initial position
    this.onScroll();
  }

  ngOnDestroy() {
    // Remove scroll event listener
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle any changes in inputs or other relevant data here
    if (changes['selectedWarband']) {
      // Update the selected warband data
    }
  }

  processWarbandsForChart(data: WarbandData[]): void {
    this.winrateByWarbandChartData = CardDataCalculationsService.processWarbandsforChartData(
      data, this.minGamesThreshhold)
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
    window.removeEventListener('scroll', this.onScroll.bind(this));
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  onScroll() {
    const cardElement = this.el.nativeElement.querySelector('.warband-details-card');
    const footerElement = document.querySelector('app-footer');
    const footerRect = footerElement?.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();

    if (footerRect && cardRect) {
      if (footerRect.top <= window.innerHeight) {
        // Fix the card above the footer
        this.renderer.setStyle(cardElement, 'position', 'absolute');
        this.renderer.setStyle(cardElement, 'bottom', `${window.innerHeight - footerRect.top + 16}px`);
      } else {
        this.renderer.setStyle(cardElement, 'bottom', `${16}px`);
      }
    }
  }
}