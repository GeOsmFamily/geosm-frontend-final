import { Component, Input, ViewChild } from '@angular/core';
import { Map } from 'src/app/modules/ol';
import { DrawComponent } from './draw/draw.component';

@Component({
  selector: 'app-map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss'],
})
export class MapToolsComponent {
  @Input() map: Map | undefined;

  @ViewChild(DrawComponent) drawComp: DrawComponent | undefined;

  constructor() {}

  expansionClose(type: string) {
    if (type == 'measure') {
      // this.measureComp.removeMeasureToApps();
    } else if (type == 'draw') {
      this.drawComp?.desactivateAllAddTool();
      this.drawComp?.desactivateAllModificationTool();
    }
  }
}
