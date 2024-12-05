import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { SheetData, SheetWarband, WarbandData } from '../models/spreadsheet.model';


@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private gameSheetSubject = new BehaviorSubject<SheetData[] | null>(null);
  private warbandSheetSubject = new BehaviorSubject<SheetWarband[] | null>(null);
  private warbandDataSubject = new BehaviorSubject<WarbandData[]>([]);

  // Observables for components to subscribe to
  gameSheet$: Observable<SheetData[] | null> = this.gameSheetSubject.asObservable();
  warbandSheet$: Observable<SheetWarband[] | null> = this.warbandSheetSubject.asObservable();
  warbandData$: Observable<WarbandData[]> = this.warbandDataSubject.asObservable();


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

  // Methods to get the current value (optional)
  getGameSheet(): Observable<SheetData[] | null> {
    return this.gameSheet$;
  }

  getWarbandSheet(): Observable<SheetWarband[] | null> {
    return this.warbandSheet$;
  }

  // Observable for warband data
  getWarbandData$(): Observable<WarbandData[]> {
    return this.warbandData$;
  }
}
