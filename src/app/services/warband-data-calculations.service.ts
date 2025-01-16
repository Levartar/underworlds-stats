import { Injectable } from '@angular/core';
import { combineLatest, filter, forkJoin, map, of } from 'rxjs';
import { DataStoreService } from '../store/sheet-data.store'; // Update the path if necessary
import { DeckCombiData, DeckData, SheetData, SheetDeck, WarbandData } from '../models/spreadsheet.model'; // Update the path if necessary

@Injectable({
  providedIn: 'root'
})
export class WarbandDataCalculationsService {

  constructor(private dataStoreService: DataStoreService) { }

  calculateWarbandData(): void {
    combineLatest([
      this.dataStoreService.getGameSheet$(), // Observable for game data
      this.dataStoreService.getWarbandSheet$(), // Observable for warband data
    ])
      .pipe(
        filter(([gameSheet, warbandSheet]) => gameSheet !== null && warbandSheet !== null),
        map(([gameSheet, warbandSheet]) => {
          const totalGames = gameSheet?.reduce(
            (sum, game) => sum + game.wins + game.losses + game.ties,
            0
          );
  
          // Map warband data to include calculated fields
          return warbandSheet!.map((warband) => {
            const warbandGames = gameSheet!.filter((game) => game.p1Warband === warband.name);
  
            // Calculate base stats
            const gamesWon = warbandGames.reduce((sum, game) => sum + game.wins, 0);
            const gamesLost = warbandGames.reduce((sum, game) => sum + game.losses, 0);
            const gamesTied = warbandGames.reduce((sum, game) => sum + game.ties, 0);
            const gamesPlayed = gamesWon + gamesLost + gamesTied;
  
            // Calculate deck synergies
            const deckSynergies = warbandGames.reduce((synergies, game) => {
              const decks = [game.p1Deck1, game.p1Deck2].sort(); // Ensure consistent order
              const key = decks.join(' + ');
  
              if (!synergies[key]) {
                synergies[key] = { wins: 0, losses: 0, ties: 0 };
              }
  
              synergies[key].wins += game.wins;
              synergies[key].losses += game.losses;
              synergies[key].ties += game.ties;
  
              return synergies;
            }, {} as { [key: string]: { wins: number; losses: number; ties: number } });
  
            // Calculate matchups
            const matchups = warbandGames.reduce((opponents, game) => {
              const opponentName = game.p2Warband;
  
              if (!opponents[opponentName]) {
                opponents[opponentName] = { wins: 0, losses: 0, ties: 0 };
              }
  
              opponents[opponentName].wins += game.wins;
              opponents[opponentName].losses += game.losses;
              opponents[opponentName].ties += game.ties;
  
              return opponents;
            }, {} as { [key: string]: { wins: number; losses: number; ties: number } });
  
            // Return the calculated warband data
            return {
              ...warband,
              gamesPlayed,
              gamesWon,
              gamesLost,
              gamesTied,
              metaScore: gamesPlayed > 0 ? (gamesWon / (totalGames! / 2)) * 1000 : 0,
              deckSynergies,
              matchups,
            };
          });
        })
      )
      .subscribe((calculatedWarbandData: WarbandData[]) => {
        // Store the calculated warband data
        console.log("calculatedWarbandData", calculatedWarbandData);
        this.dataStoreService.setWarbandData(calculatedWarbandData);
      });
  }

  calculateDeckCombiData(): void {
    combineLatest([
      this.dataStoreService.getGameSheet$(), // Observable for game data
      this.dataStoreService.getDeckSheet$(), // Observable for deck data
    ]).pipe(
      filter(([gameSheet, deckSheet]) => gameSheet !== null && deckSheet !== null),
      map(([gameSheet, deckSheet]) => {
        console.log("decksheet",deckSheet)

        const deckCombiMap: { [key: string]: DeckCombiData } = {};

        const getDeckCombiKey = (deck1: string, deck2: string): string => {
          return [deck1, deck2].sort().join('|'); // Sort to ensure consistent key regardless of order
        };

        gameSheet!.forEach((entry) => {
          const { p1Deck1, p1Deck2, wins, losses, ties } = entry;

          if (!p1Deck1 || !p1Deck2) return; // Skip if either deck is missing

          const key = getDeckCombiKey(p1Deck1, p1Deck2);

          if (!deckCombiMap[key]) {
            // Initialize the DeckCombiData for this combination
            const deck1Data =
              deckSheet!.find(deck => deck.name === p1Deck1) ||
              ({} as SheetDeck);
            const deck2Data =
              deckSheet!.find(deck => deck.name === p1Deck2) ||
              ({} as SheetDeck);

            deckCombiMap[key] = {
              name1: p1Deck1,
              name2: p1Deck2,
              metaScore: 0,
              gamesPlayed: 0,
              gamesWon: 0,
              gamesLost: 0,
              gamesTied: 0,
              legality: deck1Data.legality === 'TRUE' && deck2Data.legality === 'TRUE' ? 'true' : 'false',
              colorA: deck1Data.colorA || '#000000',
              colorB: deck1Data.colorB || '#000000',
              icon: deck1Data.icon || ''
            };
          }

          // Update counts for this combination
          const deckCombiData = deckCombiMap[key];
          deckCombiData.gamesPlayed += wins + losses + ties;
          deckCombiData.gamesWon += wins;
          deckCombiData.gamesLost += losses;
          deckCombiData.gamesTied += ties;
        });

        // Calculate metaScore for each combination
        const totalGames = gameSheet!.reduce((sum, entry) => sum + entry.wins + entry.losses + entry.ties, 0);
        Object.values(deckCombiMap).forEach(deckCombi => {
          deckCombi.metaScore = totalGames > 0 ? (deckCombi.gamesWon / (totalGames!/2)) * 1000 : 0;
        });

        // Convert map to array and store the data
        const deckCombiDataArray: DeckCombiData[] = Object.values(deckCombiMap);
        return deckCombiDataArray
      })
    ).subscribe((calculatedDeckCombiData: DeckCombiData[]) => {
      console.log("calculatedDeckCombiData", calculatedDeckCombiData)
      this.dataStoreService.setDeckCombiData$(calculatedDeckCombiData)
    })
  }

  calculateDeckData(): void {
    combineLatest([
      this.dataStoreService.getGameSheet$(), // Observable for game data
      this.dataStoreService.getDeckSheet$(), // Observable for deck data
    ]).pipe(
      filter(([gameSheet, deckSheet]) => gameSheet !== null && deckSheet !== null),
      map(([gameSheet, deckSheet]) => {
        console.log("decksheet",deckSheet)

        const totalGames = gameSheet?.reduce(
          (sum, game) => sum + game.wins + game.losses + game.ties,
          0
        );

        // Map warband data to include calculated fields
        return deckSheet!.map((deck) => {
          const gamesWon = gameSheet!
            .filter((game) => game.p1Deck1 === deck.name || game.p1Deck2 === deck.name)
            .reduce((sum, game) => sum + game.wins, 0);

          const gamesLost = gameSheet!
            .filter((game) => game.p1Deck1 === deck.name || game.p1Deck2 === deck.name)
            .reduce((sum, game) => sum + game.losses, 0);

          const gamesTied = gameSheet!
            .filter((game) => game.p1Deck1 === deck.name || game.p1Deck2 === deck.name)
            .reduce((sum, game) => sum + game.ties, 0);

          const gamesPlayed = gamesWon + gamesLost + gamesTied;

          return {
            ...deck,
            gamesPlayed,
            gamesWon,
            gamesLost,
            gamesTied,
            metaScore: gamesPlayed > 0 ? (gamesWon / (totalGames! / 2)) * 1000 : 0,
          };
        });
      })
    ).subscribe((calculatedDeckData: DeckData[]) => {
      console.log("calculatedDeckData",calculatedDeckData)
      this.dataStoreService.setDeckData$(calculatedDeckData)
    })
  }
}