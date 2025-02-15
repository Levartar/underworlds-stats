import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckCombiWinratesComponent } from './deck-combi-winrates.component';

describe('DeckCombiWinratesComponent', () => {
  let component: DeckCombiWinratesComponent;
  let fixture: ComponentFixture<DeckCombiWinratesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckCombiWinratesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeckCombiWinratesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
