import { Injectable } from '@angular/core';
import { PathOptions } from 'leaflet';
import { AirQualityParameter } from '../../core/models/air-quality.models';

interface ParameterThresholds {
  good: number;
  fair: number;
  moderate: number;
  poor: number;
  veryPoor: number;
}

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  private readonly defaultStyle = {
    fillColor: '#808080',
    weight: 1,
    opacity: 1,
    color: '#666666',
    fillOpacity: 0.7
  };

  private readonly thresholds: { [key: string]: ParameterThresholds } = {
    pm25: { 
      good: 10,
      fair: 25,
      moderate: 50,
      poor: 75,
      veryPoor: Infinity
    },
    pm10: { 
      good: 20,
      fair: 50,
      moderate: 100,
      poor: 200,
      veryPoor: Infinity
    },
    co: { 
      good: 4400,
      fair: 9400,
      moderate: 12400,
      poor: 15400,
      veryPoor: Infinity
    },
    no2: { 
      good: 40,
      fair: 70,
      moderate: 150,
      poor: 200,
      veryPoor: Infinity
    },
    o3: { 
      good: 60,
      fair: 100,
      moderate: 140,
      poor: 180,
      veryPoor: Infinity
    },
    temperature: {
      good: 21,
      fair: 27,
      moderate: 11,
      poor: 33,
      veryPoor: 0
    },
    humidity: {
      good: 40,
      fair: 50,
      moderate: 60,
      poor: 70,
      veryPoor: Infinity
    }
  };

  getPolygonStyle(value: number | null, parameter: string): { [key: string]: any } {
    if (value === null) {
      return {
        fillColor: '#808080',
        weight: 1,
        opacity: 1,
        color: '#666666',
        fillOpacity: 0.7
      };
    }

    const threshold = this.thresholds[parameter];
    if (!threshold) return this.defaultStyle;

    let color: string;
    
    if (parameter === 'temperature') {
      if (value <= threshold.veryPoor) {
        color = '#4169E1';  // Royal Blue for very cold
      } else if (value <= threshold.moderate) {
        color = '#87CEEB';  // Sky Blue for cool
      } else if (value <= threshold.good) {
        color = '#90EE90';  // Light Green for comfortable cool
      } else if (value <= threshold.fair) {
        color = '#00e400';  // Green for most comfortable
      } else if (value <= threshold.poor) {
        color = '#ffff00';  // Yellow for warm
      } else {
        color = '#ff0000';  // Red for very hot
      }
    } else {
      // For other parameters, use the standard color scale
      if (value <= threshold.good) {
        color = '#00e400';  // Green
      } else if (value <= threshold.fair) {
        color = '#ffff00';  // Yellow
      } else if (value <= threshold.moderate) {
        color = '#ff7e00';  // Orange
      } else if (value <= threshold.poor) {
        color = '#ff0000';  // Red
      } else {
        color = '#8f3f97';  // Purple
      }
    }

    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: '#666666',
      fillOpacity: 0.7
    };
  }

  private getColorForValue(value: number, parameter: string): string {
    const threshold = this.thresholds[parameter];
    if (!threshold) return '#808080';

    if (value <= threshold.good) {
      return '#00e400'; // Good - Green
    } else if (value <= threshold.fair) {
      return '#ffff00'; // Fair - Yellow
    } else if (value <= threshold.moderate) {
      return '#ff7e00'; // Moderate - Orange
    } else if (value <= threshold.poor) {
      return '#ff0000'; // Poor - Red
    } else {
      return '#8f3f97'; // Very Poor - Purple
    }
  }

  getQualityLabel(value: number, parameter: string): string {
    const threshold = this.thresholds[parameter];
    if (!threshold) return 'Bilinmiyor';

    if (parameter === 'temperature') {
      if (value <= threshold.veryPoor) {
        return '❄️ Kötü';  // Very cold (≤0°C)
      } else if (value <= threshold.moderate) {
        return '🧥 Orta';  // Cool (1-10°C)
      } else if (value <= threshold.good) {
        return '😊 İyi';   // Comfortable cool (11-20°C)
      } else if (value <= threshold.fair) {
        return '😎 Çok İyi'; // Most comfortable (21-26°C)
      } else if (value <= threshold.poor) {
        return '🌡️ Orta';  // Warm (27-32°C)
      } else {
        return '🔥 Kötü';  // Very hot (≥33°C)
      }
    }

    // For other parameters, use the standard logic
    if (value <= threshold.good) {
      return 'İyi';
    } else if (value <= threshold.fair) {
      return 'Yeterli';
    } else if (value <= threshold.moderate) {
      return 'Orta';
    } else if (value <= threshold.poor) {
      return 'Kötü';
    } else {
      return 'Çok Kötü';
    }
  }
} 