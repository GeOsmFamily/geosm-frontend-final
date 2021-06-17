import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalPageSecondaireComponent } from './vertical-page-secondaire.component';

describe('VerticalPageSecondaireComponent', () => {
  let component: VerticalPageSecondaireComponent;
  let fixture: ComponentFixture<VerticalPageSecondaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerticalPageSecondaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerticalPageSecondaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
