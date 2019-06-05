import { TestBed } from '@angular/core/testing';

import { StockOverviewService } from './stock-overview.service';

describe('StockOverviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StockOverviewService = TestBed.get(StockOverviewService);
    expect(service).toBeTruthy();
  });
});
