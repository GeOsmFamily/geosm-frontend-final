import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonSheetComponent } from './button-sheet.component';

describe('ButtonSheetComponent', () => {
  let component: ButtonSheetComponent;
  let fixture: ComponentFixture<ButtonSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
