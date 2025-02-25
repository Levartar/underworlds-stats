import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SimpleDialogComponent } from '../simple-dialog/simple-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  easterEggImages: string[] = [
    '../../assets/alathyr.png',
    '../../assets/renglaith.png',
    '../../assets/cyreni.png',
    '../../assets/cephanyr.png'
  ];

  constructor(private dialog: MatDialog) {
  }

  openDialog() {
    this.dialog.open(SimpleDialogComponent, {
      data: {
        content: "<p><iframe id='kofiframe' src='https://ko-fi.com/ibastrawberry/?hidefeed=true&widget=true&embed=true&preview=true' style='border-radius:10px;border:none;width:100%;padding:4px;background:#333;' height='576' title='ibastrawberry'></iframe></p> <div style='flex-shrink: 0;'>Uni is starting in a few weeks and i need a new Laptop. My old Surface isn't doing it anymore. <br> Love You all and thanks for all the support i got from this Community ♥</div><br><div>When reaching 500€ in Donations i will add detailed Warband Pages where you can see all matchup data, winrates vs all other Warbands and popularity over time.</div",
      }
    });
  }

  easterEgg() {
    const container = document.querySelector('.easter-egg-container');
    console.log(container);
    if (container) {
      const images = container.querySelectorAll('.easter-egg-image');
      images.forEach((image, index) => {
        (image as HTMLElement).style.left = 32 * index + 'px';
        setTimeout(() => {
          image.classList.add('active');
        }, index * 100); // Stagger the animation
      });
      // Start the jumping animation
      setTimeout(() => {
        this.startJumping(images);
      }, 10000); // Trigger start jumping only after 10 seconds
    }
  }

  startJumping(images: NodeListOf<Element>) {
    let currentIndex = 0;
    setInterval(() => {
      images.forEach((image, index) => {
        if (index === currentIndex) {
          image.classList.add('jump');
          setTimeout(() => {
            image.classList.remove('jump');
          }, 500); // Duration of the jump animation
        }
      });
      currentIndex = (currentIndex + 1) % images.length;
    }, 1000); // Interval between jumps
  }
}