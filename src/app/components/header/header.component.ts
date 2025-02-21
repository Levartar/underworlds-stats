import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  darkMode: boolean = document.body.classList.contains('dark-theme');

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.addEventListener('themeChange', (event) => {
      this.darkMode = document.body.classList.contains('dark-theme');
    });
  }

  navigateToDashboard() {
      // Inject the Router service in the constructor
        this.router.navigate(['main/dashboard']);
  }
}
