import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalPagePrincipalComponent } from './vertical-page-principal.component';

describe('VerticalPagePrincipalComponent', () => {
  let component: VerticalPagePrincipalComponent;
  let fixture: ComponentFixture<VerticalPagePrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerticalPagePrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerticalPagePrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
