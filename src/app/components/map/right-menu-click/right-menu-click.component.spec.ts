import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightMenuClickComponent } from './right-menu-click.component';

describe('RightMenuClickComponent', () => {
  let component: RightMenuClickComponent;
  let fixture: ComponentFixture<RightMenuClickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RightMenuClickComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RightMenuClickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
