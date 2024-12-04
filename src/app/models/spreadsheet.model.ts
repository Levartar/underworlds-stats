// src/app/models/parsed-row.model.ts
export interface ParsedRow {
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
  }
  