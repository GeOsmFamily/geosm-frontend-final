/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PrintService } from './print.service';

describe('Service: Print', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrintService]
    });
  });

  it('should ...', inject([PrintService], (service: PrintService) => {
    expect(service).toBeTruthy();
  }));
});
