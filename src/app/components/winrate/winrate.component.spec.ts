import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinrateComponent } from './winrate.component';

describe('WinrateComponent', () => {
  let component: WinrateComponent;
  let fixture: ComponentFixture<WinrateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinrateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WinrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
