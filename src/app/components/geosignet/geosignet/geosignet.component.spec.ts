import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeosignetComponent } from './geosignet.component';

describe('GeosignetComponent', () => {
  let component: GeosignetComponent;
  let fixture: ComponentFixture<GeosignetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeosignetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeosignetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
