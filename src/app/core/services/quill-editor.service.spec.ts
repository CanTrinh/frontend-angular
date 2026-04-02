import { TestBed } from '@angular/core/testing';

import { QuillEditorService } from './quill-editor.service';

describe('QuillEditorService', () => {
  let service: QuillEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuillEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
