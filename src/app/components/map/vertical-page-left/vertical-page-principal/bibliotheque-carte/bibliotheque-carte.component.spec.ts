import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BibliothequeCarteComponent } from './bibliotheque-carte.component';

describe('BibliothequeCarteComponent', () => {
  let component: BibliothequeCarteComponent;
  let fixture: ComponentFixture<BibliothequeCarteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BibliothequeCarteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BibliothequeCarteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
