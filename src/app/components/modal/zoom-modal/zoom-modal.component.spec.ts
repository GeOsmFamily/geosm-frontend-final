import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomModalComponent } from './zoom-modal.component';

describe('ZoomModalComponent', () => {
  let component: ZoomModalComponent;
  let fixture: ComponentFixture<ZoomModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZoomModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoomModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
