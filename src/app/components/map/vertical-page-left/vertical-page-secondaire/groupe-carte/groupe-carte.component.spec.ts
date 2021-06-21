import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupeCarteComponent } from './groupe-carte.component';

describe('GroupeCarteComponent', () => {
  let component: GroupeCarteComponent;
  let fixture: ComponentFixture<GroupeCarteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupeCarteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupeCarteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
