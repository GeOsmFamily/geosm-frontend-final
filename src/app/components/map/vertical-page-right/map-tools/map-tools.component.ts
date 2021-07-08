import { Component, Input, ViewChild } from '@angular/core';
import { Map } from 'src/app/modules/ol';
import { DrawComponent } from './draw/draw.component';
import { MeasureComponent } from './measure/measure.component';

@Component({
  selector: 'app-map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss'],
})
export class MapToolsComponent {
  @Input() map: Map | undefined;

  @Input() modeComment;

  @ViewChild(DrawComponent) drawComp: DrawComponent | undefined;

  @ViewChild(MeasureComponent) measureComp: MeasureComponent | undefined;

  constructor() {}

  expansionClose(type: string) {
    if (type == 'measure') {
      this.measureComp?.removeMeasureToApps();
    } else if (type == 'draw') {
      this.drawComp?.desactivateAllAddTool();
      this.drawComp?.desactivateAllModificationTool();
    }
  }
}
