import { TestBed } from '@angular/core/testing';

import { OrderOverviewService } from './order-overview.service';

describe('OrderOverviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrderOverviewService = TestBed.get(OrderOverviewService);
    expect(service).toBeTruthy();
  });
});
