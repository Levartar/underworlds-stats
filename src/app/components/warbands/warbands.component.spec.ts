import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarbandsComponent } from './warbands.component';

describe('WarbandsComponent', () => {
  let component: WarbandsComponent;
  let fixture: ComponentFixture<WarbandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarbandsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WarbandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
