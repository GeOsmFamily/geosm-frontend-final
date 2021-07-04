import { Component, Inject, OnInit } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { GeosignetInterface } from 'src/app/interfaces/geosignetsInterfaces';
import { Geosignets } from 'src/app/utils/geoSignets';

@Component({
  selector: 'app-list-geosignet',
  templateUrl: './list-geosignet.component.html',
  styleUrls: ['./list-geosignet.component.scss'],
})
export class ListGeosignetComponent implements OnInit {
  signets: GeosignetInterface[] = [];
  typeButton;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<ListGeosignetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: GeosignetInterface[]
  ) {}

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    console.log(event);
  }

  ngOnInit(): void {
    this.signets = this.data;
  }

  select(id) {
    new Geosignets().goToAGeosignet(id);
    this.bottomSheetRef.dismiss();
  }
}
