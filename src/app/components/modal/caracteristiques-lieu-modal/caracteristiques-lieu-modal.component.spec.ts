import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaracteristiquesLieuModalComponent } from './caracteristiques-lieu-modal.component';

describe('CaracteristiquesLieuModalComponent', () => {
  let component: CaracteristiquesLieuModalComponent;
  let fixture: ComponentFixture<CaracteristiquesLieuModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaracteristiquesLieuModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaracteristiquesLieuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
