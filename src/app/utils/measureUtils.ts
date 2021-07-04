export class MeasureUtil {
  getFormattedArea(
    unit: 'sqm' | 'sqft' | 'sqkm' | 'sqmi' | 'hectar' = 'sqm',
    area = 0
  ): number {
    switch (unit) {
      case 'sqm':
        return area;
      case 'sqft':
        return this._sqmTosqft(area);
      case 'sqkm':
        return this._sqmTosqkm(area);
      case 'sqmi':
        return this._sqmTosqmi(area);
      case 'hectar':
        return this._sqmToHectar(area);
      default:
        return area;
    }
  }

  _sqmTosqft(area) {
    return area * 10.7639;
  }

  _sqmTosqkm(area) {
    return area * 0.000001;
  }

  _sqmTosqmi(area) {
    return area * 0.000000386102159;
  }

  _sqmToHectar(area) {
    return area * 0.0001;
  }
}
