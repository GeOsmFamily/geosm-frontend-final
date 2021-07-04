import { ShareServiceService } from './../../services/share/share-service.service';
import { VerticalPageSecondaireComponent } from './vertical-page-left/vertical-page-secondaire/vertical-page-secondaire.component';
import { ComponentHelper } from 'src/app/helpers/componentHelper';
import { StorageServiceService } from './../../services/storage/storage-service.service';
import { Component, NgZone, OnInit, QueryList, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavContainer } from '@angular/material/sidenav';
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
import { LayersInMap } from 'src/app/interfaces/layersInMapInterface';
import { ActivatedRoute } from '@angular/router';
import { DataFromClickOnMapInterface } from 'src/app/interfaces/dataClickInterface';
import { RightMenuClickComponent } from './right-menu-click/right-menu-click.component';

const scaleControl = new ScaleLine();
var attribution = new Attribution({ collapsible: false });

var view = new View({
  center: [0, 0],
  zoom: 0,
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

  modeMapillary;

  modeCompare = false;

  @ViewChild(MatSidenavContainer, { static: true })
  sidenavContainer: MatSidenavContainer | undefined;

  @ViewChild(VerticalPageSecondaireComponent, { static: true })
  verticalPagePrincipalComponent: VerticalPageSecondaireComponent | undefined;

  @ViewChild(RightMenuClickComponent, { static: true })
  rightMenuClick: RightMenuClickComponent | undefined;

  layersInToc: Array<LayersInMap> = [];

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
    public componentHelper: ComponentHelper,
    public shareService: ShareServiceService,
    private activatedRoute: ActivatedRoute,
    public zone: NgZone
  ) {
    this.notifier = notifierService;
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
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
          6
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

        this.handleMapParamsUrl();
        this.mapClicked();
        map.updateSize();
        var drawers: QueryList<MatDrawer> = this.sidenavContainer?._drawers!;
        drawers.forEach((drawer) => {
          drawer.openedChange.subscribe(() => {
            map.updateSize();
          });
        });
      }
    });

    map.getLayers().on('propertychange', (ObjectEvent) => {
      let mapHelper = new MapHelper();

      this.layersInToc = mapHelper.getAllLayersInToc();

      if (this.layersInToc.length == 2 && !this.getRightMenu('toc')!.active) {
        this.openRightMenu('toc');
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

  getBadgeLayers(name: string): number {
    if (name == 'toc') {
      return this.layersInToc.length;
    }
    return undefined!;
  }

  handleMapParamsUrl() {
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log(params);
      if (params['layers']) {
        var layers = params['layers'].split(';');
        this.shareService.addLayersFromUrl(layers);
      }
      if (params['feature']) {
        var parametersShared = params['feature'].split(';');
        this.shareService.displayFeatureShared(parametersShared);
      }
      if (params['share'] && params['path']) {
        var parametersShared = params['share'].split(';');
        var parametersPath = params['path'].split(';');
        this.shareService.displayLocationShared(
          parametersShared,
          parametersPath
        );
      }
    });
  }

  mapClicked() {
    map.on('singleclick', (evt) => {
      console.log(evt);
      function compare(a, b) {
        if (a.getZIndex() < b.getZIndex()) {
          return 1;
        }
        if (a.getZIndex() > b.getZIndex()) {
          return -1;
        }
        return 0;
      }

      this.zone.run(() => {
        let mapHelper = new MapHelper();

        mapHelper.mapHasCliked(evt, (data: DataFromClickOnMapInterface) => {
          if (data.type == 'raster') {
            var layers = data.data.layers.sort(compare);
            var layerTopZindex = layers.length > 0 ? layers[0] : undefined;

            if (layerTopZindex) {
              var descriptionSheetCapabilities = layerTopZindex.get(
                'descriptionSheetCapabilities'
              );
              this.componentHelper.openDescriptiveSheet(
                descriptionSheetCapabilities,
                mapHelper.constructAlyerInMap(layerTopZindex),
                //@ts-ignore
                data.data.coord
              );
            }
          } else if (data.type == 'vector') {
            var layers = data.data.layers.sort(compare);
            var layerTopZindex = layers.length > 0 ? layers[0] : undefined;

            if (layerTopZindex) {
              var descriptionSheetCapabilities = layerTopZindex.get(
                'descriptionSheetCapabilities'
              );
              this.componentHelper.openDescriptiveSheet(
                descriptionSheetCapabilities,
                mapHelper.constructAlyerInMap(layerTopZindex),
                //@ts-ignore
                data.data.coord,
                data.data.feature?.getGeometry(),
                data.data.feature?.getProperties()
              );
            }
          }
        });
      });
    });
  }
}
