import { TestBed } from '@angular/core/testing';

import { GeosmLayersService } from './geosm-layers.service';

describe('GeosmLayersService', () => {
  let service: GeosmLayersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeosmLayersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
