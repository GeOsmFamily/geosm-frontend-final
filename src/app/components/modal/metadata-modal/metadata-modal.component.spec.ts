import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataModalComponent } from './metadata-modal.component';

describe('MetadataModalComponent', () => {
  let component: MetadataModalComponent;
  let fixture: ComponentFixture<MetadataModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetadataModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
