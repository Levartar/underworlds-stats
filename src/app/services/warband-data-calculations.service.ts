import { Injectable } from '@angular/core';
import { combineLatest, filter, forkJoin, map, of } from 'rxjs';
import { DataStoreService } from '../store/sheet-data.store'; // Update the path if necessary
import { DeckCombiData, DeckData, Filters, SheetData, SheetDeck, WarbandData } from '../models/spreadsheet.model'; // Update the path if necessary

@Injectable({
  providedIn: 'root'
})
export class WarbandDataCalculationsService {

  constructor(private dataStoreService: DataStoreService) { }

  private getFilteredGameSheet(gameSheet: SheetData[], filters: Filters, legalWarbands: string[], legalDecks: string[]): SheetData[] {
    let filteredGameSheet = gameSheet;

    if (!filters.mirrorMatches) {
      filteredGameSheet = filteredGameSheet.filter(game => !game.mirror);
    }
    //Filter Illegal Warbands
    if (!filters.allowLegacyContent) {
      filteredGameSheet = filteredGameSheet.filter(
        game => legalWarbands.includes(game.p1Warband) &&
          legalWarbands.includes(game.p2Warband));
    }
    //Filter Illegal Decks
    if (!filters.allowLegacyContent) {
      filteredGameSheet = filteredGameSheet.filter(
        game => legalDecks.includes(game.p1Deck1) &&
          (legalDecks.includes(game.p1Deck2) || game.p1Deck2 === 'Rivals') &&
          legalDecks.includes(game.p2Deck1) &&
          (legalDecks.includes(game.p2Deck2) || game.p2Deck2 === 'Rivals'));
    }

    if (filters.timeFrame?.start && filters.timeFrame.end) {
      const startDate = new Date(filters.timeFrame.start);
      const endDate = new Date(filters.timeFrame.end);
      filteredGameSheet = filteredGameSheet.filter(game => {
        const gameDate = new Date(game.date);
        return gameDate >= startDate && gameDate <= endDate;
      });
    }

    if (filters.selectedTag[0] !== "" && filters.selectedTag.length > 0) {
      filteredGameSheet = filteredGameSheet.filter(
        game => filters.selectedTag.includes(game.tag));
    }

    return filteredGameSheet;
  }

  filterGameSheet(): void {
    combineLatest([
      this.dataStoreService.getGameSheet$(), // Observable for game data
      this.dataStoreService.getWarbandSheet$(), // Observable for warband data
      this.dataStoreService.getDeckSheet$(), // Observable for deck data
      this.dataStoreService.getFilters$(), // Observable for filters
    ])
      .pipe(
        filter(([gameSheet, warbandSheet]) => gameSheet !== null && warbandSheet !== null),
        map(([gameSheet, warbandSheet, deckSheet, filters]) => {
          // Apply filters to the gameSheet
          const legalWarbands: string[] = warbandSheet!.map(warband => warband.legality === 'TRUE' ? warband.name : '');
          const legalDecks: string[] = deckSheet!.map(deck => deck.legality === 'TRUE' ? deck.name : '');
          const filteredGameSheet = this.getFilteredGameSheet(gameSheet!, filters, legalWarbands, legalDecks);

          // Return the calculated warband data
          return {
            ...filteredGameSheet,
          };
        })
      )
      .subscribe((filteredGameSheet: SheetData[]) => {
        // Store the calculated warband data
        console.log("filteredGameSheetData", filteredGameSheet);
        this.dataStoreService.setGameSheet(filteredGameSheet);
      });
  }

  calculateWarbandData(): void {
    combineLatest([
      this.dataStoreService.getGameSheet$(), // Observable for game data
      this.dataStoreService.getWarbandSheet$(), // Observable for warband data
      this.dataStoreService.getDeckSheet$(), // Observable for deck data
      this.dataStoreService.getFilters$(), // Observable for filters
    ])
      .pipe(
        filter(([gameSheet, warbandSheet]) => gameSheet !== null && warbandSheet !== null),
        map(([gameSheet, warbandSheet, deckSheet, filters]) => {
          // Apply filters to the gameSheet
          const legalWarbands: string[] = warbandSheet!.map(warband => warband.legality === 'TRUE' ? warband.name : '');
          const legalDecks: string[] = deckSheet!.map(deck => deck.legality === 'TRUE' ? deck.name : '');
          const filteredGameSheet = this.getFilteredGameSheet(gameSheet!, filters, legalWarbands, legalDecks);

          const totalGames = filteredGameSheet?.reduce(
            (sum, game) => sum + game.wins + game.losses + game.ties,
            0
          );

          const legalWarbandsSheet = warbandSheet!.filter(warband => filters.allowLegacyContent || warband.legality === 'TRUE');

          // Map gameSheet data to for every warband
          return legalWarbandsSheet!.map((warband) => {
            const warbandGames = filteredGameSheet!.filter((game) => game.p1Warband === warband.name);

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
      this.dataStoreService.getWarbandSheet$(), // Observable for warband data
      this.dataStoreService.getDeckSheet$(), // Observable for deck data
      this.dataStoreService.getFilters$(), // Observable for filters
    ]).pipe(
      filter(([gameSheet, deckSheet]) => gameSheet !== null && deckSheet !== null),
      map(([gameSheet, warbandSheet, deckSheet, filters]) => {
        console.log("decksheet", deckSheet)
        console.log("filters", filters)
        // Apply filters to the gameSheet
        const legalWarbands: string[] = warbandSheet!.map(warband => warband.legality === 'TRUE' ? warband.name : '');
        const legalDecks: string[] = deckSheet!.map(deck => deck.legality === 'TRUE' ? deck.name : '');
        const filteredGameSheet = this.getFilteredGameSheet(gameSheet!, filters, legalWarbands, legalDecks);

        const deckCombiMap: { [key: string]: DeckCombiData } = {};

        const getDeckCombiKey = (deck1: string, deck2: string): string => {
          return [deck1, deck2].sort().join('|'); // Sort to ensure consistent key regardless of order
        };

        filteredGameSheet!.forEach((entry) => {
          const { p1Deck1, p1Deck2, wins, losses, ties } = entry;

          // Skip if either deck is missing or unknown or Rivals
          if (!p1Deck1 || !p1Deck2 ||
            p1Deck1 === "Unknown" || p1Deck2 === "Unknown"
            || p1Deck2 === "Rivals" || entry.p2Deck2 === "Rivals") return;

          const key = getDeckCombiKey(p1Deck1, p1Deck2);

          if (!deckCombiMap[key]) {
            // Initialize the DeckCombiData for this combination with 0 values
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
              legality: deck1Data.legality === 'TRUE' && deck2Data.legality === 'TRUE' || p1Deck2 === 'Rivals',
              colorA: deck1Data.colorA || '#000000',
              colorB: deck1Data.colorB || '#000000',
              icon1: deck1Data.icon || '',
              icon2: deck2Data.icon || '',
              warbandSynergies: filteredGameSheet!.reduce((acc, data) => {
                acc[data.p1Warband] = { wins: 0, losses: 0, ties: 0 };
                return acc;
              }, {} as { [key: string]: { wins: number; losses: number; ties: number } }),
              deckCombiMatchups: filteredGameSheet!.reduce((acc, data) => {
                acc[getDeckCombiKey(data.p2Deck1, data.p2Deck2)] = {
                  name1: data.p2Deck1, name2: data.p2Deck2, wins: 0, losses: 0, ties: 0
                };
                return acc;
              }, {} as { [key: string]: { name1: string; name2: string; wins: number; losses: number; ties: number } }),
            };
          }

          // Update counts for this combination
          const deckCombiData = deckCombiMap[key];
          deckCombiData.gamesPlayed += wins + losses + ties;
          deckCombiData.gamesWon += wins;
          deckCombiData.gamesLost += losses;
          deckCombiData.gamesTied += ties;
          deckCombiData.warbandSynergies[entry.p1Warband].wins += wins;
          deckCombiData.warbandSynergies[entry.p1Warband].losses += losses;
          deckCombiData.warbandSynergies[entry.p1Warband].ties += ties;
          deckCombiData.deckCombiMatchups[getDeckCombiKey(entry.p2Deck1, entry.p2Deck2)].wins += wins;
          deckCombiData.deckCombiMatchups[getDeckCombiKey(entry.p2Deck1, entry.p2Deck2)].losses += losses;
          deckCombiData.deckCombiMatchups[getDeckCombiKey(entry.p2Deck1, entry.p2Deck2)].ties += ties;
        });

        // Calculate metaScore for each combination
        const totalGames = filteredGameSheet!.reduce((sum, entry) => sum + entry.wins + entry.losses + entry.ties, 0);
        Object.values(deckCombiMap).forEach(deckCombi => {
          deckCombi.metaScore = totalGames > 0 ? (deckCombi.gamesWon / (totalGames! / 2)) * 1000 : 0;
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
      this.dataStoreService.getWarbandSheet$(), // Observable for warband data
      this.dataStoreService.getDeckSheet$(), // Observable for deck data
      this.dataStoreService.getFilters$(), // Observable for filters
    ]).pipe(
      filter(([gameSheet, deckSheet]) => gameSheet !== null && deckSheet !== null),
      map(([gameSheet, warbandSheet, deckSheet, filters]) => {
        console.log("decksheet", deckSheet)
        // Apply filters to the gameSheet
        const legalWarbands: string[] = warbandSheet!.map(warband => warband.legality === 'TRUE' ? warband.name : '');
        const legalDecks: string[] = deckSheet!.map(deck => deck.legality === 'TRUE' ? deck.name : '');
        const filteredGameSheet = this.getFilteredGameSheet(gameSheet!, filters, legalWarbands, legalDecks);

        const totalGames = filteredGameSheet?.reduce(
          (sum, game) => sum + game.wins + game.losses + game.ties,
          0
        );

        // Map warband data to include calculated fields
        return deckSheet!.map((deck) => {
          const gamesWon = filteredGameSheet!
            .filter((game) => game.p1Deck1 === deck.name || game.p1Deck2 === deck.name)
            .reduce((sum, game) => sum + game.wins, 0);

          const gamesLost = filteredGameSheet!
            .filter((game) => game.p1Deck1 === deck.name || game.p1Deck2 === deck.name)
            .reduce((sum, game) => sum + game.losses, 0);

          const gamesTied = filteredGameSheet!
            .filter((game) => game.p1Deck1 === deck.name || game.p1Deck2 === deck.name)
            .reduce((sum, game) => sum + game.ties, 0);

          const gamesPlayed = gamesWon + gamesLost + gamesTied;
          // Calculate warband synergies and deck combinations
          const warbandSynergies = filteredGameSheet!.reduce((acc, game) => {
            if (game.p1Deck1 === deck.name || game.p1Deck2 === deck.name) {
              if (!acc[game.p1Warband]) {
                acc[game.p1Warband] = { wins: 0, losses: 0, ties: 0 };
              }
              acc[game.p1Warband].wins += game.wins;
              acc[game.p1Warband].losses += game.losses;
              acc[game.p1Warband].ties += game.ties;
            }
            return acc;
          }, {} as { [key: string]: { wins: number; losses: number; ties: number } });

          const combinations = filteredGameSheet!.reduce((acc, game) => {
            if (game.p1Deck1 === deck.name) {
              if (!acc[game.p1Deck2]) {
                acc[game.p1Deck2] = { wins: 0, losses: 0, ties: 0 };
              }
              acc[game.p1Deck2].wins += game.wins;
              acc[game.p1Deck2].losses += game.losses;
              acc[game.p1Deck2].ties += game.ties;
            }
            return acc;
          }, {} as { [key: string]: { wins: number; losses: number; ties: number } })

          return {
            ...deck,
            gamesPlayed,
            gamesWon,
            gamesLost,
            gamesTied,
            metaScore: gamesPlayed > 0 ? (gamesWon / totalGames!) * 1000 : 0,
            warbandSynergies,
            combinations
          };
        });
      })
    ).subscribe((calculatedDeckData: DeckData[]) => {
      console.log("calculatedDeckData", calculatedDeckData)
      this.dataStoreService.setDeckData$(calculatedDeckData)
    })
  }
}