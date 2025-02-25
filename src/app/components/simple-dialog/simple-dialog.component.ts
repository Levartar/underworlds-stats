import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-simple-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  templateUrl: './simple-dialog.component.html',
  styleUrl: './simple-dialog.component.scss'
})
export class SimpleDialogComponent {
  safeContent: SafeHtml;
  
  constructor(@Inject(MAT_DIALOG_DATA) 
  public data: { title: string, content: string, link:string },
  private sanitizer: DomSanitizer
) {
  this.safeContent = this.sanitizer.bypassSecurityTrustHtml(data.content);
}
}
