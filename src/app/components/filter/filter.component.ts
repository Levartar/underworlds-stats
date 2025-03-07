import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { DataStoreService } from '../../store/sheet-data.store';
import { Filters, SheetData, SheetMeta, WarbandData } from '../../models/spreadsheet.model';
import { MatTooltipModule } from '@angular/material/tooltip';


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
    MatTooltipModule
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent {
  filterForm: FormGroup;
  tags: string[] = [];
  metas: { name: string, startDate: Date, endDate: Date }[] = [];
  isPatching: boolean = false;

  constructor(private fb: FormBuilder, private dataStoreService: DataStoreService) {
    this.filterForm = this.fb.group({
      mirrorMatches: true,
      allowLegacyContent: true,
      timeFrame: this.fb.group({
        start: '',
        end: ''
      }),
      metas: '',
      selectedTag: '',
      tournamentsOnly: false,
      worldQualifiersOnly: false,
      dataThreshold: 15
    });

    this.dataStoreService.gameSheet$.subscribe((data) => {
      if (data.length > 0) {
        this.processSheetData(data);
      }
    });

    this.dataStoreService.metas$.subscribe((metas) => {
      if (metas.length > 0) {
        this.processMetas(metas);
      }
    });

    this.filterForm.valueChanges.subscribe(values => {
      if (this.isPatching) {
        return;
      }

      if (values.metas) {
        if (values.metas === 'none') {
          values.timeFrame.start = '';
          values.timeFrame.end = '';
        } else {
          values.timeFrame.start = values.metas.startDate;
          values.timeFrame.end = values.metas.endDate && !isNaN(new Date(values.metas.endDate).getTime()) ? values.metas.endDate : new Date();
        }
        // Change the datepicker values to the meta start and end date
        this.isPatching = true;
        this.filterForm.patchValue({
          timeFrame: {
            start: values.timeFrame.start,
            end: values.timeFrame.end
          }
        }, { emitEvent: false });
        this.isPatching = false;
        console.log('selectedMeta', values.metas);
      }
      
      this.dataStoreService.setFilters({...values,
        selectedTag: [values.selectedTag],
      } as Filters);
      console.log('filtervalues', values);
    });
  }


  processMetas(metas: SheetMeta[]) {
    metas.forEach(meta => {
      this.metas.push({ name: meta.name, startDate: meta.startDate, endDate: meta.endDate });
    });
    console.log('metas', this.metas);
  }

  processSheetData(data: SheetData[]): void {
    const tagsMap = new Map<string, Date>();
    data.forEach(game => {
      if (game.tag) {
      const tag = game.tag.trim();
      if (!tagsMap.has(tag) || new Date(game.date) < tagsMap.get(tag)!) {
        tagsMap.set(tag, new Date(game.date));
      }
      }
    });
    this.tags = Array.from(tagsMap.keys()).sort((a, b) => 
      tagsMap.get(b)!.getTime() - tagsMap.get(a)!.getTime());
  }

  getTagName(tagName:string){
    return tagName.split('%')[1];
  }

  clearFilters(): void {
    this.filterForm.reset({
      mirrorMatches: true,
      allowLegacyContent: true,
      timeFrame: {
        start: '',
        end: ''
      },
      metas: '',
      selectedTag: '',
      tournamentsOnly: false,
      worldQualifiersOnly: false,
      dataThreshold: 15
    });
  }
}
