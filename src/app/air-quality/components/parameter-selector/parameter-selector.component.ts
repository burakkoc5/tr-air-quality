import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirQualityParameter } from '../../../core/models/air-quality.models';

@Component({
  selector: 'app-parameter-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parameter-selector.component.html',
  styleUrls: ['./parameter-selector.component.scss']
})
export class ParameterSelectorComponent {
  @Output() parameterChange = new EventEmitter<AirQualityParameter>();
  selectedParameter: AirQualityParameter = 'pm25';

  parameters = [
    { value: 'pm25' as AirQualityParameter, label: 'PM2.5' },
    { value: 'pm10' as AirQualityParameter, label: 'PM10' },
    { value: 'co' as AirQualityParameter, label: 'CO' },
    { value: 'no2' as AirQualityParameter, label: 'NO₂' },
    { value: 'o3' as AirQualityParameter, label: 'O₃' },
    { value: 'temperature' as AirQualityParameter, label: 'Sıcaklık' },
    { value: 'humidity' as AirQualityParameter, label: 'Nem' }
  ];

  onParameterChange(value: AirQualityParameter) {
    this.selectedParameter = value;
    this.parameterChange.emit(value);
  }
} 