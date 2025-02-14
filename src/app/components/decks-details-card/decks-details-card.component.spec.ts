import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecksDetailsCardComponent } from './decks-details-card.component';

describe('DecksDetailsCardComponent', () => {
  let component: DecksDetailsCardComponent;
  let fixture: ComponentFixture<DecksDetailsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecksDetailsCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DecksDetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
