import { Component, Input, OnInit } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { Map } from 'src/app/modules/ol';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-vertical-toolbar',
  templateUrl: './vertical-toolbar.component.html',
  styleUrls: ['./vertical-toolbar.component.scss'],
})
export class VerticalToolbarComponent implements OnInit {
  environment;

  @Input() sidenavContainer: MatSidenavContainer | undefined;

  @Input() map: Map | undefined;

  constructor() {
    this.environment = environment;
  }

  ngOnInit(): void {}

  getBackgroundColorOfTheToogleSlidenav(): string {
    return '#fff';
  }

  /**
   * Get the color of the icon in  the div toogle sidenav left
   */
  getColorOfTheToogleSlidenav(): string {
    return environment.primaryColor;
  }

  /**
   * Close/open left sidenav
   */
  toogleLeftSidenav() {
    if (this.sidenavContainer?.start?.opened) {
      this.sidenavContainer.start.close();
    } else {
      this.sidenavContainer?.start?.open();
    }
  }

  zoom(type: 'plus' | 'minus') {
    if (type == 'plus') {
      this.map!.getView().setZoom(this.map!.getView().getZoom()! + 1);
    } else {
      this.map!.getView().setZoom(this.map!.getView().getZoom()! - 1);
    }
  }
}
