import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  printMapObjet = {
    titre: '',
    description: '',
  };
  logo: string | undefined;
  constructor() {}

  createPDFObject(
    imgData,
    type,
    format,
    compress,
    WGS84,
    getmetricscal: any,
    titre,
    description
  ) {
    try {
      var lMargin = 15;
      var rMargin = 15;
      var pdfInMM = 550;
      var d = new Date();
      var month = d.getMonth() + 1;
      var dd = d.getDate();
      var doc = new jsPDF('p', 'pt', 'a4', false);
      console.log(doc);
      doc.setFontSize(15);
      doc.setDrawColor(0);
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 595.28, 841.89, 'F');
      if (titre != '') {
        doc.text('Titre de la carte : ' + titre + '', 35, 170);
      } else {
        doc.text(
          'Carte du GéoPortail - GeOsm - ' + environment.nom.toUpperCase(),
          35,
          170
        );
      }
      doc.setFontSize(25);
      doc.setTextColor(28, 172, 119);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(
        '' + d.getDate() + '/' + month + '/' + d.getFullYear() + '',
        465,
        55
      );
      console.log(imgData);
      doc.addImage(imgData['png1'], 20, 20, 100, 40);
      doc.addImage(
        imgData['png0'],
        format,
        20,
        200,
        550,
        350,
        undefined,
        compress
      );
      doc.rect(20, 120, 550, 500, 'D');
      doc.setFontSize(10);
      doc.text('Centroïde de la carte en WGS84', 400, 570);
      doc.text('Longitude : ' + WGS84[0].toFixed(4), 400, 585);
      doc.text('Laltitude : ' + WGS84[1].toFixed(4), 400, 600);
      doc.text('Échelle :1/' + getmetricscal.toFixed(0), 60, 570);
      doc.rect(20, 650, 550, 100, 'D');
      doc.setFontSize(9);
      if (description != '') {
        var lines = doc.splitTextToSize(
          '' + description + '',
          pdfInMM - lMargin - rMargin
        );
        doc.text(lines, 29, 670);
      }

      doc.text(
        'Copyright © ' + d.getFullYear() + ', ' + environment.url_frontend,
        25,
        800
      );
      doc.save(
        titre +
          '_' +
          d.getDate() +
          '_' +
          (d.getMonth() + 1) +
          '_' +
          d.getFullYear() +
          '_.pdf'
      );
      $('#loading_print').hide();
    } catch (e) {
      $('#loading_print').hide();
      console.log(e);
      alert('Un problème est survenu lors de la création de votre carte');
    }
  }
}
