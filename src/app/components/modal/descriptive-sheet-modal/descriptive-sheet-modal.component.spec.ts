import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptiveSheetModalComponent } from './descriptive-sheet-modal.component';

describe('DescriptiveSheetModalComponent', () => {
  let component: DescriptiveSheetModalComponent;
  let fixture: ComponentFixture<DescriptiveSheetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DescriptiveSheetModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptiveSheetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
