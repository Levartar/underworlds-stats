import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniDoughnutChartComponent } from './mini-doughnut-chart.component';

describe('MiniDoughnutChartComponent', () => {
  let component: MiniDoughnutChartComponent;
  let fixture: ComponentFixture<MiniDoughnutChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniDoughnutChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiniDoughnutChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
