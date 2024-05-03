import { TestBed } from '@angular/core/testing';

import { FunctorService } from './functor.service';

describe('FunctorService', () => {
  let service: FunctorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FunctorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
