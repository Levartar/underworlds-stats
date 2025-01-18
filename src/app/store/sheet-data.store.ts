import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { DeckCombiData, DeckData, Filters, SheetData, SheetDeck, SheetWarband, WarbandData } from '../models/spreadsheet.model';


@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private gameSheetSubject = new BehaviorSubject<SheetData[]>([]);
  private warbandSheetSubject = new BehaviorSubject<SheetWarband[] | null>(null);
  private warbandDataSubject = new BehaviorSubject<WarbandData[]>([]);
  private DeckSheetSubject = new BehaviorSubject<SheetDeck[] | null>(null);
  private DeckDataSubject = new BehaviorSubject<DeckData[]>([]);
  private DeckCombiDataSubject = new BehaviorSubject<DeckCombiData[]>([]);
  private filtersSubject = new BehaviorSubject<Filters>({mirrorMatches: true, allowIllegalWarbands: true, timeFrame: null,metas: null, selectedTag: null,dataThreshold: null});

  // Observables for components to subscribe to
  gameSheet$: Observable<SheetData[]> = this.gameSheetSubject.asObservable();
  warbandSheet$: Observable<SheetWarband[] | null> = this.warbandSheetSubject.asObservable();
  warbandData$: Observable<WarbandData[]> = this.warbandDataSubject.asObservable();
  deckSheet$: Observable<SheetDeck[] | null> = this.DeckSheetSubject.asObservable();
  deckData$: Observable<DeckData[]> = this.DeckDataSubject.asObservable();
  deckCombiData$: Observable<DeckCombiData[]> = this.DeckCombiDataSubject.asObservable();
  filters$: Observable<Filters> = this.filtersSubject.asObservable();


  // Methods to set data in the store
  setGameSheet(data: SheetData[]): void {
    this.gameSheetSubject.next(data);
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


  // Methods to get the current value
  getGameSheet$(): Observable<SheetData[] | null> {
    return this.gameSheet$;
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
  
}
