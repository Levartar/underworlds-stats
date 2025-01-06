import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WarbandDataComponent } from '../warband-data/warband-data.component';

@Component({
  selector: 'app-warband-data-dialog',
  standalone: true,
  imports: [WarbandDataComponent],
  template: `
      <app-warband-data class="dialog-container" 
      [warbandName]="data.warbandName">
      </app-warband-data>
  `,
  styleUrl: './warband-data-dialog.component.scss',
})
export class WarbandDataDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { warbandName: string }) {
    console.log("warbandDataDialogComponent Opened",data)
  }
}
