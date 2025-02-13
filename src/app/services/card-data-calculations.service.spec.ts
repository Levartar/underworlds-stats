import { TestBed } from '@angular/core/testing';

import { CardDataCalculationsService } from './card-data-calculations.service';

describe('CardDataCalculationsService', () => {
  let service: CardDataCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardDataCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
