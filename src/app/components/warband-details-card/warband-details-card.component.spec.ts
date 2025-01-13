import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarbandDetailsCardComponent } from './warband-details-card.component';

describe('WarbandDetailsCardComponent', () => {
  let component: WarbandDetailsCardComponent;
  let fixture: ComponentFixture<WarbandDetailsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarbandDetailsCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WarbandDetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
