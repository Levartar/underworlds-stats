import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-simple-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './simple-dialog.component.html',
  styleUrl: './simple-dialog.component.scss'
})
export class SimpleDialogComponent {
  openSubmitGameLink() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSchHKcWiMWNdlPXC6AgsFnWNtogONptF6vyW4gUC6fW584ibA/viewform', '_blank');
  }
}
