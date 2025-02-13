import { Injectable } from '@angular/core';
import { WarbandData } from '../models/spreadsheet.model';

interface winrateByWarbandChartData {
  name: string, winrate: number,
  iconLink: string, metaScore: number, gamesPlayed: number, legality: boolean,
  bestSynergy: { deckCombiName: string, winrate: number, gamesWithDeckCombi:number },
  bestMatchup: { opponentName: string, winrate: number, bestGames:number },
  worstMatchup: { opponentName: string, winrate: number, worstGames:number },
}[]

  

@Injectable({
  providedIn: 'root'
})
export class CardDataCalculationsService {
  constructor() { }

  static processWarbandsforChartData(data:WarbandData[], 
    minGamesThreshhold:number=5):winrateByWarbandChartData[]
  {
    return data.slice().map((wb) => {
      // Calculate the best synergy
      const bestSynergy = Object.entries(wb.deckSynergies)
          .map(([deckCombiName, stats]) => {
            const gamesWithDeckCombi = stats.wins + stats.losses + stats.ties;
            const winrate = gamesWithDeckCombi > 0 ? (stats.wins / gamesWithDeckCombi) * 100 : 0;
            return { deckCombiName, winrate, gamesWithDeckCombi };
          })
          .reduce(
            (best, current) => (current.winrate > best.winrate && 
              current.gamesWithDeckCombi>=minGamesThreshhold ? current : best),
            { deckCombiName: "", winrate: 0, gamesWithDeckCombi:0 }
          );

        // Calculate the best matchup
        const bestMatchup = Object.entries(wb.matchups)
          .map(([opponentName, stats]) => {
            const bestGames = stats.wins + stats.losses + stats.ties;
            const winrate = bestGames > 0 ? (stats.wins / bestGames) * 100 : 0;
            return { opponentName, winrate, bestGames };
          })
          .reduce(
            (best, current) => (current.winrate > best.winrate && 
              current.bestGames>=minGamesThreshhold ? current : best),
            { opponentName: "", winrate: 0, bestGames: 0 }
          );

        // Calculate the worst matchup
        const worstMatchup = Object.entries(wb.matchups)
          .map(([opponentName, stats]) => {
            const worstGames = stats.wins + stats.losses + stats.ties;
            const winrate = worstGames > 0 ? (stats.wins / worstGames) * 100 : 0;
            return { opponentName, winrate, worstGames };
          })
          .reduce(
            (worst, current) => (current.winrate < worst.winrate &&
              current.worstGames>=minGamesThreshhold ? current : worst),
            { opponentName: "", winrate: 100, worstGames:0 }
          );

      // Push to chart data
      return{
        name: wb.name,
        winrate: wb.gamesPlayed > 0 ? (wb.gamesWon / wb.gamesPlayed) * 100 : 0,
        iconLink: wb.icon,
        metaScore: wb.metaScore,
        gamesPlayed: wb.gamesPlayed,
        legality: wb.legality == "TRUE",
        bestSynergy,
        bestMatchup,
        worstMatchup,
      };
    });
  }
}
