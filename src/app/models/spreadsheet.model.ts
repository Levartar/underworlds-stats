// src/app/models/parsed-row.model.ts
export interface SheetData {
  //[key: string]: string; // Use dynamic keys if necessary
  date: string; // "Date" - ISO string or a simple string format
  p1Warband: string; // "P1 Warband"
  p1Deck1: string; // "P1 Deck1"
  p1Deck2: string; // "P1 Deck2"
  wins: number; // "Wins"
  losses: number; // "Losses"
  ties: number; // "Ties"
  p2Warband: string; // "P2 Warband"
  p2Deck1: string; // "P2 Deck1"
  p2Deck2: string; // "P2 Deck2"
  tag: string | null; // "Tag" - this seems optional
  gW: number; // "G-W"
  gL: number; // "G-L"
  gT: number; // "G-T"
  color: string | null; //color
  icon: string | null; //Icon
  legality: boolean | null //legality
  mirror: boolean //mirror
}

// src/app/models/parsed-row.model.ts
export interface SheetWarband {
  //[key: string]: string; // Use dynamic keys if necessary
  name: string; // "name"
  legality: string; // "legality" true or false if tournament legal
  colorA: string; // primary color in hexcode
  colorB: string; // secondary color in hexcode
  icon: string; // string link to icon
}

export interface SheetDeck {
  //[key: string]: string; // Use dynamic keys if necessary
  name: string; // "name"
  legality: string; // "legality" true or false if tournament legal
  colorA: string; // primary color in hexcode
  colorB: string; // secondary color in hexcode
  icon: string; // string link to icon
}

export interface WarbandData {
  //[key: string]: string; // Use dynamic keys if necessary
  name: string; // "name"
  metaScore: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesTied: number;
  legality: string; // "legality" true or false if tournament legal
  colorA: string; // primary color in hexcode
  colorB: string; // secondary color in hexcode
  icon: string; // string link to icon
  // Deck synergies with a composite key "deck1|deck2" where deck1 <= deck2
  deckSynergies: {
    [key: string]: { 
      //deck1: string;
      //deck2: string;
      wins: number; 
      losses: number; 
      ties: number };
  };
  // Matchups indexed by opponentName
  matchups: {
    [opponentName: string]: { 
      wins: number; 
      losses: number; 
      ties: number;
      //opponentDeckCombiKey: string; 
    };
  };
}

export interface DeckData {
  //[key: string]: string; // Use dynamic keys if necessary
  name: string; // "name"
  metaScore: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesTied: number;
  legality: string; // "legality" true or false if tournament legal
  colorA: string; // primary color in hexcode
  colorB: string; // secondary color in hexcode
  icon: string; // string link to icon
}

export interface DeckCombiData {
  //[key: string]: string; // Use dynamic keys if necessary
  name1: string; // "name"
  name2: string;
  metaScore: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesTied: number;
  legality: string; // "legality" true or false if tournament legal
  colorA: string; // primary color in hexcode
  colorB: string; // secondary color in hexcode
  icon: string; // string link to icon
}

export interface Filters {
  mirrorMatches: boolean | null;
  allowIllegalWarbands: boolean | null
  timeFrame: { start: Date, end: Date } | null;
  metas: string | null;
  selectedTag: string | null;
  dataThreshold: number | null;
}
