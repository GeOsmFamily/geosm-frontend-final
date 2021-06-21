import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupeThematiqueComponent } from './groupe-thematique.component';

describe('GroupeThematiqueComponent', () => {
  let component: GroupeThematiqueComponent;
  let fixture: ComponentFixture<GroupeThematiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupeThematiqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupeThematiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
