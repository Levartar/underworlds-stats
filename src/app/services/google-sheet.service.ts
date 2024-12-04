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
  
    return rows.slice(1).map(row => {
      const values = row.split(',');
      const result: ParsedRow = {};
      headers.forEach((header, index) => {
        result[header.trim()] = values[index]?.trim();
      });
      return result;
    });
  }
  
}