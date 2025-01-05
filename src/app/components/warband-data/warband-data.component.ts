import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../../store/sheet-data.store';
import { WarbandData, DeckCombiData, SheetData } from '../../models/spreadsheet.model';
import { NgIf } from '@angular/common';
import { MiniDoughnutChartComponent } from '../mini-doughnut-chart/mini-doughnut-chart.component';
import { BarChartComponent } from "../bar-chart/bar-chart.component";
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-warband-data',
  standalone: true,
  imports: [MiniDoughnutChartComponent, NgIf, BarChartComponent],
  templateUrl: './warband-data.component.html',
  styleUrl: './warband-data.component.css'
})
export class WarbandDataComponent implements OnInit {
  @Input() warbandName!: string;
  warbandData: WarbandData | undefined;
  deckCombos: DeckCombiData[] = [];
  winrateVsWarbands: { names: string[]; winrates: number[];} = {names:[],winrates: []};
  winrateWithDecks: { names: string[]; winrates: number[];} = {names:[],winrates: []};
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
      this.totalGames = data.reduce((acc,curr)=>acc+curr.gamesPlayed,0)
      this.warbandData = data.find((w) => w.name === this.warbandName);
      this.gamesPlayedVsOthers =
        this.warbandData?.gamesPlayed || 0;
      this.metascore = Math.floor(this.warbandData?.metaScore || 0);
      this.winrate =
        (this.warbandData?.gamesWon! /
        (this.warbandData?.gamesPlayed || 1) || 0)*100;
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
      (g) => g.p1Warband === this.warbandName
    );
    const opponentWinrates: { [key: string]: { wins: number; total: number } } =
      {};
    warbandGames.forEach((game) => {
      const opponent =game.p2Warband;
      if (!opponentWinrates[opponent]) {
        opponentWinrates[opponent] = { wins: 0, total: 0,};
      }
      opponentWinrates[opponent].total += game.wins+game.losses+game.ties;
      opponentWinrates[opponent].wins += game.wins;

    });
    this.winrateVsWarbands = Object.entries(opponentWinrates).reduce(
      (acc: { names: string[]; winrates: number[] }, [name, data]) => {
        acc.names.push(name);
        acc.winrates.push((data.wins / data.total) * 100);
        return acc;
      },
      { names: [], winrates: [] }
    );
  }

  calculateWinrateWithDecks(data: SheetData[]): void {
    const warbandGames = data.filter(
      (g) => g.p1Warband === this.warbandName
    );
    const deckWinrates: { [key: string]: { wins: number; total: number } } = {};
    warbandGames.forEach((game) => {
      const deck = `${game.p1Deck1}-${game.p1Deck2}`;
      if (!deckWinrates[deck]) {
        deckWinrates[deck] = { wins: 0, total: 0 };
      }
      deckWinrates[deck].total += game.wins+game.losses+game.ties;
      deckWinrates[deck].wins += game.wins;
    });
    this.winrateWithDecks = Object.entries(deckWinrates).reduce(
      (acc: { names: string[]; winrates: number[] }, [name, data]) => {
        acc.names.push(name);
        acc.winrates.push((data.wins / data.total) * 100);
        return acc;
      },
      { names: [], winrates: [] }
    );
  }
}