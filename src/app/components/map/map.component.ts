import { VerticalPageSecondaireComponent } from './vertical-page-left/vertical-page-secondaire/vertical-page-secondaire.component';
import { ComponentHelper } from 'src/app/helpers/componentHelper';
import { StorageServiceService } from './../../services/storage/storage-service.service';
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
  LayerGroup,
} from 'src/app/modules/ol';
import { NotifierService } from 'angular-notifier';
import bboxPolygon from '@turf/bbox-polygon';
import intersect from '@turf/intersect';
import { toWgs84 } from '@turf/projection';
import { MatDialog } from '@angular/material/dialog';

const scaleControl = new ScaleLine();
var attribution = new Attribution({ collapsible: false });

var view = new View({
  center: [0, 0],
  zoom: 4,
  minZoom: 6,
});

export const map = new Map({
  layers: [
    new LayerGroup({
      //@ts-ignore
      nom: 'group-layer-shadow',
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
  private readonly notifier: NotifierService;

  @ViewChild(MatSidenavContainer, { static: true })
  sidenavContainer: MatSidenavContainer | undefined;

  @ViewChild(VerticalPageSecondaireComponent, { static: true })
  verticalPagePrincipalComponent: VerticalPageSecondaireComponent | undefined;

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

  constructor(
    public storageService: StorageServiceService,
    notifierService: NotifierService,
    public dialog: MatDialog,
    public componentHelper: ComponentHelper
  ) {
    this.notifier = notifierService;
  }

  ngAfterViewInit() {
    this.componentHelper.setComponent(
      'VerticalPageSecondaireComponent',
      this.verticalPagePrincipalComponent
    );
  }

  ngOnInit(): void {
    this.storageService.loadProjectData().then(
      (response) => {
        $('.loading-apps').hide();
        new MapHelper().fit_view(
          this.storageService.getExtentOfProject(true),
          13
        );
        this.notifier.notify('success', 'Téléchargement terminé');
      },
      (error) => {
        $('.loading-apps').hide();
        this.notifier.notify('error', 'Erreur lors du Téléchargement');
      }
    );

    map.setTarget('map');
    map.updateSize();
    map.addControl(MapHelper.scaleControl('scaleline', 'scale-map'));
    map.addControl(MapHelper.mousePositionControl('mouse-position-map'));

    this.storageService.states.subscribe((value) => {
      if (value.loadProjectData) {
        map.on('moveend', () => {
          var bbox_cam = bboxPolygon(
            this.storageService.getConfigProjet().bbox
          );
          var bbox_view = bboxPolygon(map.getView().calculateExtent());

          var bool = intersect(toWgs84(bbox_view), toWgs84(bbox_cam));

          if (!bool) {
            map.getView().fit(this.storageService.getConfigProjet().bbox, {
              size: map.getSize(),
              duration: 1000,
            });
          }
        });
        /* map.addLayer(
          MapHelper.constructShadowLayer(
            this.storageService.getConfigProjet().roiGeojson
          )
        );*/
      }
    });
  }

  getMap(): Map {
    return map;
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

  close_setCoordOverlay() {
    $('#setCoordOverlay').hide();
  }
}
