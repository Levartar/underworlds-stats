import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckMetaComponent } from './deck-meta.component';

describe('DeckMetaComponent', () => {
  let component: DeckMetaComponent;
  let fixture: ComponentFixture<DeckMetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckMetaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeckMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
