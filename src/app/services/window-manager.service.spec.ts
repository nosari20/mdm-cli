import { TestBed } from '@angular/core/testing';

import { WindowManagerService } from './window-manager.service';

describe('WindowManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WindowManagerService = TestBed.get(WindowManagerService);
    expect(service).toBeTruthy();
  });
});
