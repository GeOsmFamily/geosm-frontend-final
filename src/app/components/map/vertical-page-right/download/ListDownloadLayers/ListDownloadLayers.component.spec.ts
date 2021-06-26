/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListDownloadLayersComponent } from './ListDownloadLayers.component';

describe('ListDownloadLayersComponent', () => {
  let component: ListDownloadLayersComponent;
  let fixture: ComponentFixture<ListDownloadLayersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListDownloadLayersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDownloadLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
