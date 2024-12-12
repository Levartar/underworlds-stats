import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../../store/sheet-data.store';
import { WarbandData, DeckCombiData, SheetData } from '../../models/spreadsheet.model';
import { NgIf } from '@angular/common';
import { MiniDoughnutChartComponent } from '../mini-doughnut-chart/mini-doughnut-chart.component';

@Component({
  selector: 'app-warband-data',
  standalone: true,
  imports: [MiniDoughnutChartComponent,NgIf],
  templateUrl: './warband-data.component.html',
  styleUrl: './warband-data.component.css'
})
export class WarbandDataComponent implements OnInit {
  @Input() warbandName!: string;
  warbandData: WarbandData | undefined;
  deckCombos: DeckCombiData[] = [];
  winrateVsWarbands: { name: string; winrate: number }[] = [];
  winrateWithDecks: { deck: string; winrate: number }[] = [];
  gamesPlayedVsOthers: number = 0;
  totalGames: number = 0;
  metascore: number = 0;
  winrate: number = 0;

  constructor(private dataStoreService: DataStoreService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.dataStoreService.getWarbandData$().subscribe((data) => {
      this.warbandData = data.find((w) => w.name === this.warbandName);
      this.gamesPlayedVsOthers =
        this.warbandData?.gamesPlayed || 0;
      this.metascore = this.warbandData?.metaScore || 0;
      this.winrate =
        this.warbandData?.gamesWon! /
        (this.warbandData?.gamesPlayed || 1) || 0;
    });

    this.dataStoreService.getDeckCombiData$().subscribe((data) => {
      this.deckCombos = data.filter(
        (d) => d.name1 === this.warbandName || d.name2 === this.warbandName
      );
    });

    this.dataStoreService.getGameSheet$().subscribe((data: SheetData[]|null) => {
      if(data){
        this.calculateWinrateVsWarbands(data);
        this.calculateWinrateWithDecks(data);
      }
    });
  }

  calculateWinrateVsWarbands(data: SheetData[]): void {
    const warbandGames = data.filter(
      (g) => g.p1Warband === this.warbandName || g.p2Warband === this.warbandName
    );
    const opponentWinrates: { [key: string]: { wins: number; total: number } } =
      {};
    warbandGames.forEach((game) => {
      const opponent =
        game.p1Warband === this.warbandName ? game.p2Warband : game.p1Warband;
      if (!opponentWinrates[opponent]) {
        opponentWinrates[opponent] = { wins: 0, total: 0 };
      }
      opponentWinrates[opponent].total += 1;
      if (
        (game.p1Warband === this.warbandName && game.wins === 1) ||
        (game.p2Warband === this.warbandName && game.losses === 1)
      ) {
        opponentWinrates[opponent].wins += 1;
      }
    });
    this.winrateVsWarbands = Object.entries(opponentWinrates).map(
      ([name, data]) => ({
        name,
        winrate: (data.wins / data.total) * 100,
      })
    );
  }

  calculateWinrateWithDecks(data: SheetData[]): void {
    const deckWinrates: { [key: string]: { wins: number; total: number } } = {};
    data.forEach((game) => {
      const deck = `${game.p1Deck1}-${game.p1Deck2}`;
      if (!deckWinrates[deck]) {
        deckWinrates[deck] = { wins: 0, total: 0 };
      }
      deckWinrates[deck].total += 1;
      if (
        (game.p1Warband === this.warbandName && game.wins === 1) ||
        (game.p2Warband === this.warbandName && game.losses === 1)
      ) {
        deckWinrates[deck].wins += 1;
      }
    });
    this.winrateWithDecks = Object.entries(deckWinrates).map(
      ([deck, data]) => ({
        deck,
        winrate: (data.wins / data.total) * 100,
      })
    );
  }
}