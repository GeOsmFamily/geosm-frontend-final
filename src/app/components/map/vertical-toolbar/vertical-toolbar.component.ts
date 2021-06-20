import { StorageServiceService } from './../../../services/storage/storage-service.service';
import { Component, Input, OnInit } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { Map, Overlay, Point } from 'src/app/modules/ol';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ZoomModalComponent } from '../../modal/zoom-modal/zoom-modal.component';
import { transform } from 'ol/proj';
import bboxPolygon from '@turf/bbox-polygon';
import booleanContains from '@turf/boolean-contains';
import { point } from '@turf/helpers';
import * as $ from 'jquery';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-vertical-toolbar',
  templateUrl: './vertical-toolbar.component.html',
  styleUrls: ['./vertical-toolbar.component.scss'],
})
export class VerticalToolbarComponent implements OnInit {
  environment;
  private readonly notifier: NotifierService;

  @Input() sidenavContainer: MatSidenavContainer | undefined;

  @Input() map: Map | undefined;

  @Input() dialog: MatDialog | undefined;

  userMovedMap: boolean = false;

  historyMapPosition: Array<{
    coordinates: [number, number];
    zoom: number;
  }> = [];

  indexHstoryMapPosition = 0;

  constructor(
    public storageService: StorageServiceService,
    notifierService: NotifierService
  ) {
    this.environment = environment;
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    this.storageService.states.subscribe((value) => {
      if (value.loadProjectData) {
        this.map?.on('movestart', () => {
          if (!this.userMovedMap) {
            this.historyMapPosition = [
              {
                coordinates: [
                  this.map?.getView().getCenter()![0]!,
                  this.map?.getView().getCenter()![1]!,
                ],
                zoom: this.map?.getView().getZoom()!,
              },
            ];
            this.indexHstoryMapPosition = 0;
          }
        });

        this.map?.on('moveend', () => {
          if (!this.userMovedMap) {
            this.historyMapPosition[1] = {
              coordinates: [
                this.map?.getView().getCenter()![0]!,
                this.map?.getView().getCenter()![1]!,
              ],
              zoom: this.map?.getView().getZoom()!,
            };
            this.indexHstoryMapPosition = 0;
          }
        });
      }
    });
  }

  getBackgroundColorOfTheToogleSlidenav(): string {
    return '#fff';
  }

  globalView() {
    new MapHelper().fit_view(this.storageService.getExtentOfProject(true), 13);
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
      this.map?.getView().setZoom(this.map?.getView().getZoom()! + 1);
    } else {
      this.map?.getView().setZoom(this.map?.getView().getZoom()! - 1);
    }
  }

  rollBack() {
    if (
      this.historyMapPosition.length > 0 &&
      this.indexHstoryMapPosition == 0
    ) {
      this.userMovedMap = true;
      this.indexHstoryMapPosition = 1;
      new MapHelper().fit_view(
        new Point(this.historyMapPosition[0].coordinates),
        this.historyMapPosition[0].zoom
      );
      setTimeout(() => {
        this.userMovedMap = false;
      }, 2000);
    }
  }

  rollFront() {
    if (
      this.historyMapPosition.length > 0 &&
      this.indexHstoryMapPosition == 1
    ) {
      this.userMovedMap = true;
      this.indexHstoryMapPosition = 0;
      new MapHelper().fit_view(
        new Point(this.historyMapPosition[1].coordinates),
        this.historyMapPosition[1].zoom
      );
      setTimeout(() => {
        this.userMovedMap = false;
      }, 2000);
    }
  }

  zoomTo() {
    const dialogRef = this.dialog?.open(ZoomModalComponent, {
      width: '400px',
      data: { type: 'zoomto' },
    });

    dialogRef?.afterClosed().subscribe((modal_result) => {
      if (modal_result.statut) {
        var result = modal_result['data'];

        if (result.projection == 'WGS84') {
          var coord_wgs84 = Array();
          coord_wgs84[0] = parseFloat(result.longitude);
          coord_wgs84[1] = parseFloat(result.latitude);
          var coord = transform(
            [coord_wgs84[0], coord_wgs84[1]],
            'EPSG:4326',
            'EPSG:3857'
          );

          console.log(coord);

          var point_geojson = point(coord);
          var bbox_cam = bboxPolygon(
            this.storageService.getConfigProjet().bbox
          );

          var bool = booleanContains(bbox_cam, point_geojson);

          if (bool) {
            var mapHelper = new MapHelper();
            mapHelper.fit_view(new Point(coord), 17);

            $('#setCoordOverlay').show();
            var setCoordOverlay = new Overlay({
              position: coord,
              element: document.getElementById('setCoordOverlay')!,
            });

            this.map?.addOverlay(setCoordOverlay);

            $('#setCoordOverlay').on('mousemove', (evt) => {
              $('#setCoordOverlay em').show();
            });

            $('#setCoordOverlay').on('mouseout', (evt) => {
              $('#setCoordOverlay em').hide();
            });
          } else {
            this.notifier.notify(
              'warning',
              'Désolé mais vos coordonées sont hors du pays'
            );
          }
        }
      }
    });
  }
}
