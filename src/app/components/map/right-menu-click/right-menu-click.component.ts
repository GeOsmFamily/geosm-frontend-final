import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ShContextMenuComponent } from 'ng2-right-click-menu';
import { Coordinate } from 'ol/coordinate';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { Map } from 'src/app/modules/ol';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-right-menu-click',
  templateUrl: './right-menu-click.component.html',
  styleUrls: ['./right-menu-click.component.scss'],
})
export class RightMenuClickComponent implements OnInit {
  @ViewChild(ShContextMenuComponent, { static: true })
  menu: ShContextMenuComponent | undefined;

  @Input() map: Map | undefined;

  listItems = Array();

  coordinatesContextMenu: Coordinate | undefined;

  zoomContextMenu: number | undefined;

  environment: any;

  constructor(public translate: TranslateService) {
    this.environment = environment;
  }

  ngOnInit(): void {
    this.initialiseContextMenu();
  }

  initialiseContextMenu() {
    this.translate
      .get('menu_contextuel', { value: 'caracteristique' })
      .subscribe((res: any) => {
        this.listItems[0] = {
          name: res.caracteristique,
          icon: 1,
          click: 'this.getInfoOnPoint',
        };

        this.listItems[1] = {
          name: res.partager,
          icon: 2,
          click: 'this.shareLocation',
        };

        this.listItems[2] = {
          name: res.commenter,
          icon: 3,
          click: 'this.openModalComment',
        };

        this.listItems[3] = {
          name: res.ajouter_geosignet,
          icon: 4,
          click: 'this.addGeoSignets',
        };

        this.listItems[4] = {
          name: res.voir_geosignet,
          icon: 5,
          click: 'this.listGeoSignets',
        };
      });
  }

  callFunction(index) {
    var func = this.listItems[index]['click'];

    eval(func + '();');
  }

  setRightClickPixel(event: any) {
    var coord = new MapHelper().map?.getCoordinateFromPixel([
      event.layerX,
      event.layerY,
    ]);
    this.coordinatesContextMenu = coord;
    this.zoomContextMenu = new MapHelper().map?.getView().getZoom();
  }
}
