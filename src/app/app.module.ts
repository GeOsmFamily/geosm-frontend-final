import { ShareServiceService } from './services/share/share-service.service';
import { GeosmLayersService } from './services/geosm/geosm-layers.service';
import { ApiServiceService } from './services/api/api-service.service';
import { StorageServiceService } from './services/storage/storage-service.service';
import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgpSortModule } from 'ngp-sort-pipe';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './components/header/header.component';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MaterialModule } from './modules/material';
import { MapComponent } from './components/map/map.component';
import { VerticalPagePrincipalComponent } from './components/map/vertical-page-left/vertical-page-principal/vertical-page-principal.component';
import { VerticalPageSecondaireComponent } from './components/map/vertical-page-left/vertical-page-secondaire/vertical-page-secondaire.component';
import { VerticalToolbarComponent } from './components/map/vertical-toolbar/vertical-toolbar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActiveLayersComponent } from './components/map/vertical-page-right/active-layers/active-layers.component';
import { MapToolsComponent } from './components/map/vertical-page-right/map-tools/map-tools.component';
import { LegendsComponent } from './components/map/vertical-page-right/legends/legends.component';
import { RoutingComponent } from './components/map/vertical-page-right/routing/routing.component';
import { DownloadComponent } from './components/map/vertical-page-right/download/download.component';
import { setAppInjector } from './helpers/injectorHelper';
import { NotifierModule } from 'angular-notifier';
import { InfoModalComponent } from './components/modal/info-modal/info-modal.component';
import { ZoomModalComponent } from './components/modal/zoom-modal/zoom-modal.component';
import { ButtonSheetComponent } from './components/button-sheet/button-sheet/button-sheet.component';
import { GroupeCarteComponent } from './components/map/vertical-page-left/vertical-page-secondaire/groupe-carte/groupe-carte.component';
import { CarteThematiqueComponent } from './components/map/vertical-page-left/vertical-page-secondaire/groupe-carte/carte-thematique/carte-thematique.component';
import { BibliothequeCarteComponent } from './components/map/vertical-page-left/vertical-page-principal/bibliotheque-carte/bibliotheque-carte.component';
import { GroupeThematiqueComponent } from './components/map/vertical-page-left/vertical-page-principal/groupe-thematique/groupe-thematique.component';
import { ListeThematiqueComponent } from './components/map/vertical-page-left/vertical-page-secondaire/liste-thematique/liste-thematique/liste-thematique.component';
import { CoucheThematiqueComponent } from './components/map/vertical-page-left/vertical-page-secondaire/liste-thematique/liste-thematique/couche-thematique/couche-thematique.component';
import { MetadataModalComponent } from './components/modal/metadata-modal/metadata-modal.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { DescriptiveSheetModalComponent } from './components/modal/descriptive-sheet-modal/descriptive-sheet-modal.component';
import { SocialShareComponent } from './components/social-share/social-share.component';

import { ShareButtonsConfig } from 'ngx-sharebuttons';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ColorPickerModule } from 'ngx-color-picker';
import { RightMenuClickComponent } from './components/map/right-menu-click/right-menu-click.component';
import { ShContextMenuModule } from 'ng2-right-click-menu';
import { DrawComponent } from './components/map/vertical-page-right/map-tools/draw/draw.component';
import { MeasureComponent } from './components/map/vertical-page-right/map-tools/measure/measure.component';
import { PrintComponent } from './components/map/vertical-page-right/map-tools/print/print.component';
import { ChartOverlayComponent } from './components/map/vertical-page-right/download/chartOverlay/chartOverlay.component';
import { ListDownloadLayersComponent } from './components/map/vertical-page-right/download/ListDownloadLayers/ListDownloadLayers.component';
import { SearchComponent } from './components/header/search/search.component';
import { OsmSheetComponent } from './components/modal/descriptive-sheet-modal/osm-sheet/osm-sheet.component';
import { PrintService } from './services/print/print.service';
import { CaracteristiquesLieuModalComponent } from './components/modal/caracteristiques-lieu-modal/caracteristiques-lieu-modal.component';
import { CommentModalComponent } from './components/modal/comment-modal/comment-modal.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { GeosignetComponent } from './components/geosignet/geosignet/geosignet.component';
import { ListGeosignetComponent } from './components/geosignet/list-geosignet/list-geosignet.component';
import { CommentComponent } from './components/map/vertical-page-right/map-tools/comment/comment.component';

const customConfig: ShareButtonsConfig = {
  include: ['copy', 'facebook', 'twitter', 'linkedin', 'messenger', 'whatsapp'],
  exclude: ['tumblr', 'stumble', 'vk'],
  theme: 'circles-dark',
  gaTracking: true,
  twitterAccount: 'twitterUsername',
};

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new MultiTranslateHttpLoader(httpClient, [
    { prefix: './assets/i18n/', suffix: '.json' },
  ]);
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MapComponent,
    VerticalPagePrincipalComponent,
    VerticalPageSecondaireComponent,
    VerticalToolbarComponent,
    ActiveLayersComponent,
    MapToolsComponent,
    LegendsComponent,
    RoutingComponent,
    DownloadComponent,
    ZoomModalComponent,
    ButtonSheetComponent,
    InfoModalComponent,
    GroupeCarteComponent,
    CarteThematiqueComponent,
    BibliothequeCarteComponent,
    GroupeThematiqueComponent,
    ListeThematiqueComponent,
    CoucheThematiqueComponent,
    MetadataModalComponent,
    DescriptiveSheetModalComponent,
    SocialShareComponent,
    DrawComponent,
    MeasureComponent,
    PrintComponent,
    ChartOverlayComponent,
    ListDownloadLayersComponent,
    SearchComponent,
    OsmSheetComponent,
    RightMenuClickComponent,
    CaracteristiquesLieuModalComponent,
    CommentModalComponent,
    GeosignetComponent,
    ListGeosignetComponent,
    CommentComponent,
  ],
  imports: [
    NgpSortModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ShareButtonsModule.withConfig(customConfig),
    FlexLayoutModule,
    ShareIconsModule,
    ReactiveFormsModule,
    ColorPickerModule,
    ShContextMenuModule,
    CKEditorModule,
    NotifierModule.withConfig({
      position: {
        horizontal: {
          position: 'right',
          distance: 12,
        },

        vertical: {
          position: 'top',
          distance: 12,
          gap: 10,
        },
      },
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    FontAwesomeModule,
  ],
  providers: [
    StorageServiceService,
    ApiServiceService,
    GeosmLayersService,
    ShareServiceService,
    PrintService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [MetadataModalComponent],
})
export class AppModule {
  constructor(injector: Injector) {
    setAppInjector(injector);
  }
}
