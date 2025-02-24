import { TestBed } from '@angular/core/testing';

import { AppInjectibleService } from './app-injectible.service';

describe('AppInjectibleService', () => {
  let service: AppInjectibleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppInjectibleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
