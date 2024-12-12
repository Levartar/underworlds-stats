import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarbandDataDialogComponent } from './warband-data-dialog.component';

describe('WarbandDataDialogComponent', () => {
  let component: WarbandDataDialogComponent;
  let fixture: ComponentFixture<WarbandDataDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarbandDataDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WarbandDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
