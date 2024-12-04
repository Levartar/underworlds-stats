import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParsedRow } from '../models/spreadsheet.model';

@Injectable({
  providedIn: 'root'
})


export class GoogleSheetService {

  private sheetUrl = 
  'https://docs.google.com/spreadsheets/d/1HIX_SvAZ6hOa0k65y_tVaNBxTHnZk-7IVPPgGYtcHdI/export?format=csv&id=1HIX_SvAZ6hOa0k65y_tVaNBxTHnZk-7IVPPgGYtcHdI&gid=338969474';

  constructor(private http: HttpClient) { }

  fetchSheetData(): Observable<string> {
    return this.http.get(this.sheetUrl, { responseType: 'text' });
  }

  parseCsvData(csv: string): ParsedRow[] {
    const rows = csv.split('\n');
    const headers = rows[0].split(',');

    //Filter Data for empty entries
  
    const filteredRows = rows.slice(1).map(row => {
      const values = row.split(',');
      return {
        date: values[headers.indexOf('Date')]?.trim(),
        p1Warband: values[headers.indexOf('P1 Warband')]?.trim(),
        p1Deck1: values[headers.indexOf('P1 Deck1')]?.trim(),
        p1Deck2: values[headers.indexOf('P1 Deck2')]?.trim(),
        wins: Number(values[headers.indexOf('Wins')]?.trim()),
        losses: Number(values[headers.indexOf('Losses')]?.trim()),
        ties: Number(values[headers.indexOf('Ties')]?.trim()),
        p2Warband: values[headers.indexOf('P2 Warband')]?.trim(),
        p2Deck1: values[headers.indexOf('P2 Deck1')]?.trim(),
        p2Deck2: values[headers.indexOf('P2 Deck2')]?.trim(),
        tag: values[headers.indexOf('Tag')]?.trim() || null,
        gW: Number(values[headers.indexOf('G-W')]?.trim()),
        gL: Number(values[headers.indexOf('G-L')]?.trim()),
        gT: Number(values[headers.indexOf('G-T')]?.trim()),
      } as ParsedRow;
    });
    return filteredRows.filter(row => row.date && row.date.trim() !== '')
  }
  
}