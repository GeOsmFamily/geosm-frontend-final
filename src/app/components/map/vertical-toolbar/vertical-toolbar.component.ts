import { StorageServiceService } from './../../../services/storage/storage-service.service';
import { Component, Input, OnInit } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { Map, Point } from 'src/app/modules/ol';
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

  userMovedMap: boolean = false;

  historyMapPosition: Array<{
    coordinates: [number, number];
    zoom: number;
  }> = [];

  indexHstoryMapPosition = 0;

  constructor(public storageService: StorageServiceService) {
    this.environment = environment;
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
}
