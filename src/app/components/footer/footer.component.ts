import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SimpleDialogComponent } from '../simple-dialog/simple-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  constructor(private dialog: MatDialog){
  }

  openDialog() {
    this.dialog.open(SimpleDialogComponent, {
      data: {
        content: "<p><iframe id='kofiframe' src='https://ko-fi.com/ibastrawberry/?hidefeed=true&widget=true&embed=true&preview=true' style='border-radius:10px;border:none;width:100%;padding:4px;background:#333;' height='570' title='ibastrawberry'></iframe></p>",
      }
    });
  }
}
