import { TestBed } from '@angular/core/testing';

import { SanitizeUrlService } from './sanitize-url.service';

describe('SanitizeUrlService', () => {
  let service: SanitizeUrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SanitizeUrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
