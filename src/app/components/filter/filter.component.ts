import { Component, ChangeDetectionStrategy} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { DataStoreService } from '../../store/sheet-data.store';
import { SheetData, WarbandData } from '../../models/spreadsheet.model';


@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatSelectModule,
    NgFor,
    MatButtonModule,
    ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent {
  filterForm: FormGroup;
  tags: string[] = [];

  constructor(private fb: FormBuilder, private dataStoreService: DataStoreService) {
    this.filterForm = this.fb.group({
      mirrorMatches: true,
      allowIllegalWarbands: true,
      timeFrame: this.fb.group({
        start: '',
        end: ''
      }),
      metas: '',
      selectedTag: '',
      dataThreshold: 0
    });

    this.dataStoreService.gameSheet$.subscribe((data) => {
      if (data.length > 0) {
        this.processSheetData(data);
      }
    });

    this.filterForm.valueChanges.subscribe(values => {
      console.log('filtervalues',values);
      this.dataStoreService.setFilters(values);
    });
  }

  processSheetData(data: SheetData[]): void {
    const tagsSet = new Set<string>();
    data.forEach(game => {
      if (game.tag) {
        game.tag.split(',').forEach(tag => tagsSet.add(tag.trim().toUpperCase()));
      }
    });
    this.tags = Array.from(tagsSet);
  }

  clearFilters(): void {
    this.filterForm.reset({
      mirrorMatches: true,
      allowIllegalWarbands: true,
      timeFrame: {
        start: '',
        end: ''
      },
      metas: '',
      selectedTag: '',
      dataThreshold: 0
    });
  }
}
