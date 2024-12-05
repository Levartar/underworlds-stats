import { Injectable } from '@angular/core';
import { combineLatest, filter, forkJoin, map, of } from 'rxjs';
import { DataStoreService } from '../store/sheet-data.store'; // Update the path if necessary
import { WarbandData } from '../models/spreadsheet.model'; // Update the path if necessary

@Injectable({
  providedIn: 'root'
})
export class WarbandDataCalculationsService {
  constructor(private dataStoreService: DataStoreService) {}

  calculateWarbandData(): void {
    combineLatest([
      this.dataStoreService.getGameSheet(), // Observable for game data
      this.dataStoreService.getWarbandSheet(), // Observable for warband data
    ])
      .pipe(
        filter(([gameSheet, warbandSheet]) => gameSheet !== null && warbandSheet !== null),
        map(([gameSheet, warbandSheet]) => {
          const totalGames = gameSheet?.reduce(
            (sum, game) => sum + game.wins + game.losses + game.ties,
            0
          );
          console.log("warbanddatacalculationservice is used",totalGames)


          // Map warband data to include calculated fields
          return warbandSheet!.map((warband) => {
            const gamesWon = gameSheet!
              .filter((game) => game.p1Warband === warband.name)
              .reduce((sum, game) => sum + game.wins, 0);

            const gamesLost = gameSheet!
              .filter((game) => game.p1Warband === warband.name)
              .reduce((sum, game) => sum + game.losses, 0);

            const gamesTied = gameSheet!
              .filter((game) => game.p1Warband === warband.name)
              .reduce((sum, game) => sum + game.ties, 0);

            const gamesPlayed = gamesWon + gamesLost + gamesTied;

            return {
              ...warband,
              name:warband.name,
              legality: warband.legality,
              colorA: warband.colorA,
              colorB: warband.colorB,
              icon: warband.icon,
              gamesPlayed,
              gamesWon,
              gamesLost,
              gamesTied,
              metaScore: gamesPlayed > 0 ? Math.floor((gamesWon / (totalGames!/2)) * 1000) : 0,
            };
          });
        })
      )
      .subscribe((calculatedWarbandData: WarbandData[]) => {
        // Store the calculated warband data
        this.dataStoreService.setWarbandData(calculatedWarbandData);
      });
  }
}