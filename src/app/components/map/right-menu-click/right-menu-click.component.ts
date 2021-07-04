import { CommentModalComponent } from './../../modal/comment-modal/comment-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ComponentHelper } from './../../../helpers/componentHelper';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ShContextMenuComponent } from 'ng2-right-click-menu';
import { Coordinate } from 'ol/coordinate';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { Map, Overlay } from 'src/app/modules/ol';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';
import { NotifierService } from 'angular-notifier';
import { transform } from 'ol/proj';
import { ApiServiceService } from 'src/app/services/api/api-service.service';
import { Geosignets } from 'src/app/utils/geoSignets';
import { GeosignetComponent } from '../../geosignet/geosignet/geosignet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { GeosignetInterface } from 'src/app/interfaces/geosignetsInterfaces';
import { ListGeosignetComponent } from '../../geosignet/list-geosignet/list-geosignet.component';

@Component({
  selector: 'app-right-menu-click',
  templateUrl: './right-menu-click.component.html',
  styleUrls: ['./right-menu-click.component.scss'],
})
export class RightMenuClickComponent implements OnInit {
  private readonly notifier: NotifierService;
  @ViewChild(ShContextMenuComponent, { static: true })
  menu: ShContextMenuComponent | undefined;

  @Input() map: Map | undefined;

  listItems = Array();

  coordinatesContextMenu: Coordinate | undefined;

  zoomContextMenu: number | undefined;

  environment: any;
  caracteristicsPoint = { display: false };
  url_share: any;

  @Input() dialog: MatDialog | undefined;

  constructor(
    public translate: TranslateService,
    public componentHelper: ComponentHelper,
    notifierService: NotifierService,
    public apiService: ApiServiceService,
    public _bottomSheet: MatBottomSheet
  ) {
    this.environment = environment;
    this.notifier = notifierService;
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

        /* this.listItems[1] = {
          name: res.partager,
          icon: 2,
          click: 'this.shareLocation',
        };*/

        this.listItems[1] = {
          name: res.commenter,
          icon: 3,
          click: 'this.openModalComment',
        };

        this.listItems[2] = {
          name: res.ajouter_geosignet,
          icon: 4,
          click: 'this.addGeoSignets',
        };

        this.listItems[3] = {
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

  getInfoOnPoint() {
    $('#spinner_loading').show();

    var coord = this.coordinatesContextMenu;

    $('#coord_caracteristics').show();

    this.componentHelper.openCaracteristic({
      properties: this.caracteristicsPoint,
      geometry: coord,
      map: this.map!,
      url_share: this.url_share,
      notif: this.notifier,
    });

    var coord_caracteri = new Overlay({
      position: coord,
      element: document.getElementById('coord_caracteristics')!,
    });

    this.map?.addOverlay(coord_caracteri);

    $('#coord_caracteristics').on('mousemove', (evt) => {
      $('#coord_caracteristics .fa-times').show();

      $('#coord_caracteristics .fa-dot-circle').hide();
    });

    $('#coord_caracteristics').on('mouseout', (evt) => {
      $('#coord_caracteristics .fa-times').hide();

      $('#coord_caracteristics .fa-dot-circle').show();
    });

    var coord_4326 = transform(coord!, 'EPSG:3857', 'EPSG:4326');

    this.caracteristicsPoint['adresse'] = false;
    this.caracteristicsPoint['position'] = false;

    this.caracteristicsPoint['coord'] =
      coord_4326[0].toFixed(4) + ' , ' + coord_4326[1].toFixed(4);

    $.post(
      this.environment.url_prefix + 'getLimite',
      { coord: coord_4326 },
      (data) => {
        this.caracteristicsPoint['limites_adm'] = [];
        if (typeof data == 'object') {
          for (const key in data) {
            if (data.hasOwnProperty(key) && data[key]) {
              this.caracteristicsPoint['limites_adm'].push({
                nom: key,
                valeur: data[key],
              });
            }
          }
        }

        $('#spinner_loading').hide();

        this.caracteristicsPoint['display'] = true;

        console.log(this.caracteristicsPoint);
      }
    );

    var geocodeOsm =
      'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
      coord_4326[1] +
      '&lon=' +
      coord_4326[0] +
      '&zoom=18&addressdetails=1';
    this.caracteristicsPoint['lieu_dit'] = false;
    $.get(geocodeOsm, (data) => {
      console.log(data);
      var name = data.display_name.split(',')[0];
      var osm_url =
        'https://www.openstreetmap.org/' + data.osm_type + '/' + data.osm_id;
      this.caracteristicsPoint['lieu_dit'] = name;
      this.caracteristicsPoint['url_osm'] = osm_url;
    });
  }

  close_caracteristique() {
    this.caracteristicsPoint['display'] = false;
    $('#coord_caracteristics').hide();
  }

  openModalComment() {
    const dialogRef = this.dialog?.open(CommentModalComponent, {
      minWidth: '350px',
    });

    dialogRef?.afterClosed().subscribe((data_result) => {
      if (data_result && data_result['statut']) {
        var result = data_result['data'];
        $('#spinner_loading').show();

        var donne = {
          data: Array(),
          coordinates: this.coordinatesContextMenu,
          table: 'comments',
          shema: 'public',
          geom: 'Point',
        };

        donne.data[0] = {
          ind: 'nom',
          val: result.nom,
        };

        donne.data[1] = {
          ind: 'email',
          val: result.email,
        };

        donne.data[2] = {
          ind: 'description',
          val: result.description,
        };

        donne.data[3] = {
          ind: 'date',
          val: new Date(),
        };
        console.log(result, donne);

        this.apiService
          .post_requete('addEntite', donne)
          .then((data: Object[]) => {
            $('#spinner_loading').hide();
            console.log(data);

            this.translate.get('notifications').subscribe((res: any) => {
              this.notifier.notify('default', res.comment_added);
            });
          });
      }
    });
  }

  addGeoSignets() {
    this.componentHelper.openModalAddGeosignet([], (nameGeoSignet: string) => {
      if (nameGeoSignet) {
        new Geosignets().addGeoSignet({
          nom: nameGeoSignet,
          coord: this.coordinatesContextMenu!,
          zoom: this.zoomContextMenu!,
        });
      }
    });
  }

  openModalAddGeosignet(size: Array<string> | [], callBack: Function) {
    var proprietes = {
      disableClose: false,
      minWidth: 400,
    };

    if (size.length > 0) {
      proprietes['width'] = size[0];
      proprietes['height'] = size[1];
    }
    const modal = this.dialog?.open(GeosignetComponent, proprietes);

    modal?.afterClosed().subscribe(async (result: string) => {
      callBack(result);
    });
  }

  listGeoSignets() {
    var allGeoSignets: GeosignetInterface[] =
      new Geosignets().getAllGeosignets();
    this._bottomSheet.open(ListGeosignetComponent, {
      data: allGeoSignets,
    });
  }
}
