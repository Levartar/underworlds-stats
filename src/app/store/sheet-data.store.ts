import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { SheetData, SheetWarband } from '../models/spreadsheet.model';


@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private gameDataSubject = new BehaviorSubject<SheetData[] | null>(null);
  private warbandDataSubject = new BehaviorSubject<SheetWarband[] | null>(null);

  // Observables for components to subscribe to
  gameData$: Observable<SheetData[] | null> = this.gameDataSubject.asObservable();
  warbandData$: Observable<SheetWarband[] | null> = this.warbandDataSubject.asObservable();

  // Methods to set data in the store
  setGameData(data: SheetData[]): void {
    this.gameDataSubject.next(data);
  }

  setWarbandData(data: SheetWarband[]): void {
    this.warbandDataSubject.next(data);
  }

  // Methods to get the current value (optional)
  getGameData(): SheetData[] | null {
    return this.gameDataSubject.getValue();
  }

  getWarbandData(): SheetWarband[] | null {
    return this.warbandDataSubject.getValue();
  }
}
