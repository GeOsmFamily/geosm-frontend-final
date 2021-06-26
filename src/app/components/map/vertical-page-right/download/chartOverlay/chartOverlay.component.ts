import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Chart } from 'src/app/modules/chart';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-chartOverlay',
  templateUrl: './chartOverlay.component.html',
  styleUrls: ['./chartOverlay.component.scss'],
})
export class ChartOverlayComponent {
  @Input() chartConnfiguration: any;

  @Input() idChart: any;

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() close = new EventEmitter<any>();

  @Output() listFiles = new EventEmitter<any>();

  myChart;

  constructor() {}

  ngAfterViewInit(): void {
    console.log(
      this.idChart,
      this.chartConnfiguration,
      'ChartOverlayComponent'
    );
    if (this.idChart && this.chartConnfiguration) {
      this.initialiseChart();
    }
  }

  initialiseChart() {
    this.myChart = new Chart(this.idChart, this.chartConnfiguration);
    setTimeout(() => {
      document.getElementById('chart-export-download-img')!['href'] =
        this.myChart.toBase64Image();
    }, 1500);
  }

  closeChart() {
    this.close.emit(this.idChart);
  }

  listFilesToDownload() {
    this.listFiles.emit(this.idChart);
  }
}
