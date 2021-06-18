import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import * as $ from 'jquery';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { RightMenuInterface } from 'src/app/interfaces/rightMenuInterface';
import {
  Attribution,
  ScaleLine,
  View,
  Map,
  TileLayer,
  OSM,
} from 'src/app/modules/ol';

const scaleControl = new ScaleLine();
var attribution = new Attribution({ collapsible: false });

var view = new View({
  center: [0, 0],
  zoom: 4,
  minZoom: 6,
});

export const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: view,
});

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  @ViewChild(MatSidenavContainer, { static: true })
  sidenavContainer: MatSidenavContainer | undefined;

  layersInToc = [];

  ritghtMenus: Array<RightMenuInterface> = [
    {
      name: 'toc',
      active: false,
      enable: true,
      tooltip: 'toolpit_toc',
      title: 'table_of_contents',
    },
    {
      name: 'edition',
      active: false,
      enable: true,
      tooltip: 'toolpit_tools',
      title: 'tools',
    },
    {
      name: 'legend',
      active: false,
      enable: true,
      tooltip: 'toolpit_legend',
      title: 'legend',
    },
    {
      name: 'routing',
      active: false,
      enable: true,
      tooltip: 'toolpit_map_routing',
      title: 'map_routing',
    },
    {
      name: 'download',
      active: false,
      enable: true,
      tooltip: 'toolpit_download_data',
      title: 'download_data',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    setInterval(() => {
      $('.loading-apps').hide();
    }, 3000);

    map.setTarget('map');
    map.updateSize();
    map.addControl(MapHelper.scaleControl('scaleline', 'scale-map'));
    map.addControl(MapHelper.mousePositionControl('mouse-position-map'));
  }

  getRightMenuActive(): RightMenuInterface | undefined {
    for (let index = 0; index < this.ritghtMenus.length; index++) {
      if (this.ritghtMenus[index].active) {
        return this.ritghtMenus[index];
      }
    }
    return undefined;
  }

  getRightMenu(name: string): RightMenuInterface | undefined {
    for (let index = 0; index < this.ritghtMenus.length; index++) {
      const element = this.ritghtMenus[index];
      if (element.name == name) {
        return element;
      }
    }
    return undefined;
  }

  openRightMenu(name: string) {
    var menu = this.getRightMenu(name);

    if (menu?.active) {
      this.sidenavContainer?.end?.close();
      for (let index = 0; index < this.ritghtMenus.length; index++) {
        const element = this.ritghtMenus[index];
        element.active = false;
      }
    } else {
      this.sidenavContainer?.end?.open();
      for (let index = 0; index < this.ritghtMenus.length; index++) {
        const element = this.ritghtMenus[index];
        element.active = false;
      }
      menu!.active = true;
    }
  }
}
