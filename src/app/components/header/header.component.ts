import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ComponentHelper } from 'src/app/helpers/componentHelper';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  environment: any;
  constructor(
    public translate: TranslateService,
    public componentHelper: ComponentHelper
  ) {
    this.environment = environment;
    translate.addLangs(environment.avaible_language);
    translate.setDefaultLang(environment.default_language);
  }

  ngOnInit(): void {
    this.translate.use(environment.default_language);
  }

  //Evenement de changement de langue du géoportail
  change_language(lang) {
    if (lang['value']) {
      this.translate.use(lang['value']);
    }
  }

  openModalInfo() {
    this.componentHelper.openModalInfo([]);
  }
}
