import { Component, Input, OnInit } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-vertical-toolbar',
  templateUrl: './vertical-toolbar.component.html',
  styleUrls: ['./vertical-toolbar.component.scss'],
})
export class VerticalToolbarComponent implements OnInit {
  environment;

  @Input() sidenavContainer: MatSidenavContainer | undefined;

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

  /**
   * Zoom or de zoom
   * @param type 'plus'|'minus'
   */
  zoom(type: 'plus' | 'minus') {}
}
