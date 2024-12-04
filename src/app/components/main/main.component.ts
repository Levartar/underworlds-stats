import { Component, OnInit } from '@angular/core';
import { GoogleSheetService } from '../../services/google-sheet.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})

export class MainComponent implements OnInit {
  data: any[] | null = null;

  constructor(private googleSheetService: GoogleSheetService) {}

  ngOnInit() {
    this.googleSheetService.fetchSheetData().subscribe(csv => {
      this.data = this.googleSheetService.parseCsvData(csv);
    });
  }
}
