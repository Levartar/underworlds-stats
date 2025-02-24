import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { DeckCombiData, DeckData, Filters, SheetData, SheetDeck, SheetMeta, SheetWarband, WarbandData } from '../models/spreadsheet.model';


@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private gameSheetSubject = new BehaviorSubject<SheetData[]>([]);
  private filteredGameSheetSubject = new BehaviorSubject<SheetData[]>([]);
  private warbandSheetSubject = new BehaviorSubject<SheetWarband[] | null>(null);
  private warbandDataSubject = new BehaviorSubject<WarbandData[]>([]);
  private DeckSheetSubject = new BehaviorSubject<SheetDeck[] | null>(null);
  private DeckDataSubject = new BehaviorSubject<DeckData[]>([]);
  private DeckCombiDataSubject = new BehaviorSubject<DeckCombiData[]>([]);
  private filtersSubject = new BehaviorSubject<Filters>({mirrorMatches: true, allowLegacyContent: true, timeFrame: null, metas: "none", selectedTag: [''],dataThreshold: 15});
  private metasSubject = new BehaviorSubject<SheetMeta[]>([]);

  // Observables for components to subscribe to
  gameSheet$: Observable<SheetData[]> = this.gameSheetSubject.asObservable();
  filteredGameSheet$: Observable<SheetData[]> = this.filteredGameSheetSubject.asObservable();
  warbandSheet$: Observable<SheetWarband[] | null> = this.warbandSheetSubject.asObservable();
  warbandData$: Observable<WarbandData[]> = this.warbandDataSubject.asObservable();
  deckSheet$: Observable<SheetDeck[] | null> = this.DeckSheetSubject.asObservable();
  deckData$: Observable<DeckData[]> = this.DeckDataSubject.asObservable();
  deckCombiData$: Observable<DeckCombiData[]> = this.DeckCombiDataSubject.asObservable();
  filters$: Observable<Filters> = this.filtersSubject.asObservable();
  metas$: Observable<SheetMeta[]> = this.metasSubject.asObservable();


  // Methods to set data in the store
  setGameSheet(data: SheetData[]): void {
    this.gameSheetSubject.next(data);
  }

  setFilteredGameSheet(data: SheetData[]): void {
    this.filteredGameSheetSubject.next(data);
  }

  setWarbandSheet(data: SheetWarband[]): void {
    this.warbandSheetSubject.next(data);
  }

  setWarbandData(data: WarbandData[]) {
    this.warbandDataSubject.next(data);
  }

  setDeckSheet(data: SheetDeck[]): void {
    this.DeckSheetSubject.next(data);
  }

  setDeckData$(data: DeckData[]): void {
    this.DeckDataSubject.next(data);
  }

  // Observable for warband data
  setDeckCombiData$(data: DeckCombiData[]): void {
    this.DeckCombiDataSubject.next(data);
  }

  setFilters(filters: Filters): void {
    this.filtersSubject.next(filters);
  }

  setMetas$(metas: SheetMeta[]): void {
    this.metasSubject.next(metas);
  }


  // Methods to get the current value
  getGameSheet$(): Observable<SheetData[] | null> {
    return this.gameSheet$;
  }

  getFilteredGameSheet$(): Observable<SheetData[] | null> {
    return this.filteredGameSheet$;
  }

  getWarbandSheet$(): Observable<SheetWarband[] | null> {
    return this.warbandSheet$;
  }

  // Observable for warband data
  getWarbandData$(): Observable<WarbandData[]> {
    return this.warbandData$;
  }

  getDeckSheet$(): Observable<SheetDeck[] | null> {
    return this.deckSheet$;
  }

  getDeckData$(): Observable<DeckData[] | null> {
    return this.deckData$;
  }

  // Observable for warband data
  getDeckCombiData$(): Observable<DeckCombiData[]> {
    return this.deckCombiData$;
  }

  getFilters$(): Observable<Filters> {
    return this.filters$;
  }

  getMetas$(): Observable<SheetMeta[]> {
    return this.metas$;
  }
  
}
