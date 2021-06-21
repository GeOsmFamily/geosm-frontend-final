import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeThematiqueComponent } from './liste-thematique.component';

describe('ListeThematiqueComponent', () => {
  let component: ListeThematiqueComponent;
  let fixture: ComponentFixture<ListeThematiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeThematiqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeThematiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
