import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalToolbarComponent } from './vertical-toolbar.component';

describe('VerticalToolbarComponent', () => {
  let component: VerticalToolbarComponent;
  let fixture: ComponentFixture<VerticalToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerticalToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerticalToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
