import { TestBed } from '@angular/core/testing';

import { IpServiceService } from './ip-service.service';

describe('IpServiceService', () => {
  let service: IpServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
