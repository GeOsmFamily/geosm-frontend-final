import { async } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Analytics } from 'src/app/interfaces/analyticsInterface';
import * as $ from 'jquery';
import { Views } from 'src/app/interfaces/viewsInterface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private analyticCollection: AngularFirestoreCollection<Analytics>;
  private viewsCollection: AngularFirestoreCollection<Views>;
  analytics: Observable<Analytics[]> | undefined;
  data: Views | undefined;
  count;

  constructor(private firestore: AngularFirestore) {
    this.analyticCollection = firestore.collection<Analytics>('kpi');
    this.viewsCollection = firestore.collection<Views>('views');
  }

  addAnalytics(analytics: Analytics) {
    analytics.timestamp = Date.now();
    $.post(
      environment.url_prefix + 'getcountry',
      {
        ip: analytics.ip,
      },
      (data) => {
        sessionStorage.setItem('country', data['country']);
        console.log(data['country']);
      }
    );
    analytics.country = sessionStorage.getItem('country')!;
    this.analyticCollection
      .doc(environment.nom.toLowerCase())
      .collection(analytics.type.toLowerCase())
      .add(analytics);
  }

  countView() {
    this.firestore
      .collection<Views>('views')
      .doc(environment.nom.toLowerCase())
      .get()
      .subscribe((doc) => {
        this.data = doc.data();
        this.count = this.data?.count;
        if (doc.exists) {
          this.viewsCollection.doc(environment.nom.toLowerCase()).update({
            count: this.count + 1,
            country: environment.nom.toLowerCase(),
          });
        } else {
          this.viewsCollection
            .doc(environment.nom.toLowerCase())
            .set({ count: 1, country: environment.nom.toLowerCase() });
        }
      });
  }
}
