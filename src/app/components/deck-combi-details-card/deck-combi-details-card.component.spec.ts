import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckCombiDetailsCardComponent } from './deck-combi-details-card.component';

describe('DeckCombiDetailsCardComponent', () => {
  let component: DeckCombiDetailsCardComponent;
  let fixture: ComponentFixture<DeckCombiDetailsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckCombiDetailsCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeckCombiDetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
