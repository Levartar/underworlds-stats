import { TestBed } from '@angular/core/testing';

import { WarbandDataCalculationsService } from './warband-data-calculations.service';

describe('WarbandDataCalculationsService', () => {
  let service: WarbandDataCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarbandDataCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
