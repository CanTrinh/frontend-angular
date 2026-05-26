import { TestBed } from '@angular/core/testing';

import { NotificactionService } from './notificaction.service';

describe('NotificactionService', () => {
  let service: NotificactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
