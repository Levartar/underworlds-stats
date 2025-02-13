import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  darkMode: boolean = document.body.classList.contains('dark-theme');

  ngOnInit(): void {
    window.addEventListener('themeChange', (event) => {
      this.darkMode = document.body.classList.contains('dark-theme');
    });
  }
}
