import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarbandDataComponent } from './warband-data.component';

describe('WarbandDataComponent', () => {
  let component: WarbandDataComponent;
  let fixture: ComponentFixture<WarbandDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarbandDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WarbandDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
