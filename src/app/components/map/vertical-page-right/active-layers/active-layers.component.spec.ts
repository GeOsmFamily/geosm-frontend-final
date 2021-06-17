import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveLayersComponent } from './active-layers.component';

describe('ActiveLayersComponent', () => {
  let component: ActiveLayersComponent;
  let fixture: ComponentFixture<ActiveLayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveLayersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
