import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.scss'],
})
export class SocialShareComponent implements OnInit {
  url: string | undefined;
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { url: string }) {}

  ngOnInit(): void {
    this.url = this.data.url;
  }
}
