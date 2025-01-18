import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { DataStoreService } from '../../store/sheet-data.store';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent {
  filterForm: FormGroup;

  constructor(private fb: FormBuilder, private dataStoreService: DataStoreService) {
    this.filterForm = this.fb.group({
      mirrorMatches: [true],
      timeFrame: [''],
      metas: [''],
      dataThreshold: [0]
    });

    this.dataStoreService.getFilters$().subscribe(filters => {
      this.filterForm.patchValue(filters);
    });

    this.filterForm.valueChanges.subscribe(values => {
      this.dataStoreService.setFilters(values);
    });
  }
}
