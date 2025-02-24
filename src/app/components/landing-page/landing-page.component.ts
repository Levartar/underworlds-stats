import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DataStoreService } from '../../store/sheet-data.store';
import { WarbandData, DeckCombiData, SheetData, Filters } from '../../models/spreadsheet.model';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, forkJoin, take } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { Router, RouterOutlet } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSelectModule,
    ReactiveFormsModule,
    BaseChartDirective,
    MatListModule,
    MatTooltipModule,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  minGamesThreshold: number = 15;
  darkMode: boolean = document.body.classList.contains('dark-theme');
  topWarbands: WarbandData[] = [];
  topDeckCombis: DeckCombiData[] = [];
  gamesPlayedData: any;
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: {
        ticks: {
          color: this.darkMode ? 'white' : 'black'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: this.darkMode ? 'white' : 'black'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: this.darkMode ? 'white' : 'black'
        }
      }
    },
    layout: {
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    }
  };
  filterForm: FormGroup;

  constructor(
    private router: Router,
    private dataStoreService: DataStoreService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      timeFrame: ['months']
    });
  }

  ngOnInit(): void {
    //this.setFiltersToLastMeta();
    this.subscribeToData();
    //this.filterForm.valueChanges.subscribe(() => {
    //  console.log("filterForm.valueChanges");
    //  this.updateGamesPlayedData();
    //});

    window.addEventListener('themeChange', (event) => {
      this.darkMode = document.body.classList.contains('dark-theme');
      this.chartOptions = {
        ...this.chartOptions,
        scales: {
          x: {
            ticks: {
              color: this.darkMode ? 'white' : 'black'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: this.darkMode ? 'white' : 'black'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: this.darkMode ? 'white' : 'black'
            }
          }
        }
      };
    });
  }

  //setFiltersToLastMeta(): void {
  //  this.dataStoreService.getMetas$().subscribe(metas => {
  //    console.log("metasSubscription",metas);
  //    if (metas.length > 0) {
  //      this.dataStoreService.setFilters({
  //        timeFrame: {
  //          start: metas[metas.length - 1].startDate,
  //          end: metas[metas.length - 1].endDate
  //        },
  //        mirrorMatches: true,
  //        allowLegacyContent: false,
  //        metas: metas[metas.length - 1].name,
  //        selectedTag: null,
  //        dataThreshold: 15
  //      });
  //    }
  //  });
  //};

  //clearFilters(): void {
  //  this.dataStoreService.setFilters({
  //    timeFrame: null,
  //    mirrorMatches: true,
  //    allowLegacyContent: true,
  //    metas: "none",
  //    selectedTag: null,
  //    dataThreshold: 15
  //  });
  //}

  subscribeToData(): void {
    console.log("subscribeToData Starts");
    combineLatest({
      warbandData: this.dataStoreService.getWarbandData$(),
      deckCombiData: this.dataStoreService.getDeckCombiData$(),
      filters: this.dataStoreService.getFilters$(),
    }).subscribe({
      next: ({ warbandData, deckCombiData, filters }) => {
        this.topWarbands = warbandData.sort((a, b) => {
          const aRatio = a.gamesPlayed >= filters.dataThreshold! ? a.gamesWon / a.gamesPlayed : -1;
          const bRatio = b.gamesPlayed >= filters.dataThreshold! ? b.gamesWon / b.gamesPlayed : -1;
          return bRatio - aRatio;
        }).slice(0, 4);

        this.topDeckCombis = deckCombiData.sort((a, b) => {
          const aRatio = a.gamesPlayed >= filters.dataThreshold! ? a.gamesWon / a.gamesPlayed : -1;
          const bRatio = b.gamesPlayed >= filters.dataThreshold! ? b.gamesWon / b.gamesPlayed : -1;
          return bRatio - aRatio;
        }).slice(0, 4);
        
        this.minGamesThreshold = filters.dataThreshold!;
      },
      error: (err) => {
        console.error("Error in subscribeToData", err);
      },
    });
    this.updateGamesPlayedData();
  }

  updateGamesPlayedData(): void {
    this.dataStoreService.getFilteredGameSheet$().subscribe(data => {
      if(data){
        const timeFrame = this.filterForm.get('timeFrame')?.value;
        console.log("data", data);
        const groupedData = this.groupGamesByTimeFrame(data, timeFrame);
        this.gamesPlayedData = {
          labels: Object.keys(groupedData),
          datasets: [
            {
              label: 'Games Played',
              data: Object.values(groupedData),
              borderColor: '#42A5F5',
              fill: false
            }
          ]
        };
        console.log("GamesPlayedData", this.gamesPlayedData);
      }
    });
  }

  groupGamesByTimeFrame(data: SheetData[], timeFrame: string): { [key: string]: number } {
    const groupedData: { [key: string]: number } = {};

    data.forEach(game => {
      const date = new Date(game.date);
      let key: string;

      switch (timeFrame) {
        case 'weeks':
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          key = `${startOfWeek.getFullYear()}-${startOfWeek.getMonth() + 1}-${startOfWeek.getDate()}`;
          break;
        case 'months':
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        case 'years':
          key = `${date.getFullYear()}`;
          break;
        default:
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key]+= (game.wins+game.losses+game.ties)* 0.5;
    });
    console.log("groupedDataLength", groupedData);

    const filteredGroupedData = Object.keys(groupedData).filter(key => {
      const [year, month, day] = key.split('-').map(Number);
      return new Date(year, month - 1 || 1, day || 1).getTime() <= new Date().getTime();
    }).reduce((acc, key) => {
      acc[key] = groupedData[key];
      return acc;
    }, {} as { [key: string]: number });

    // Sort the grouped data by date
    //const sortedGroupedData = Object.keys(filteredGroupedData).sort((a, b) => {
    //  const [aYear, aMonth, aDay] = a.split('-').map(Number);
    //  const [bYear, bMonth, bDay] = b.split('-').map(Number);
    //  return new Date(aYear, aMonth - 1, aDay || 1).getTime() - new Date(bYear, bMonth - 1, bDay || 1).getTime();
    //}).reduce((acc, key) => {
    //  acc[key] = filteredGroupedData[key];
    //  return acc;
    //}, {} as { [key: string]: number });
    console.log("FilteredgroupedDataLength", filteredGroupedData);

    return filteredGroupedData;
  }

  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  navigateToWarbandDetails(warband: WarbandData) {
    console.log("navigateToWarbandDetails", `/main/dashboard/warband/${warband.name}`);
    this.router.navigate([`/main/dashboard/warband/${warband.name}`]);
  }

  navigateToDeckCombiDetails(deckCombi: DeckCombiData) {
    console.log("navigateToDeckCombiDetails", `/main/dashboard/deck/${deckCombi.name1 + ' + ' + deckCombi.name2}`);
    this.router.navigate([`/main/dashboard/deck/${deckCombi.name1 + ' + ' + deckCombi.name2}`]);
  }

  openSubmitGameLink() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSchHKcWiMWNdlPXC6AgsFnWNtogONptF6vyW4gUC6fW584ibA/viewform', '_blank');
  }
}