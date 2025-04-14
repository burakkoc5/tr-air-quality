import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirQualityParameter } from '../../../core/models/air-quality.models';

@Component({
  selector: 'app-map-legend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-legend.component.html',
  styleUrls: ['./map-legend.component.scss']
})
export class MapLegendComponent {
  @Input() parameter: AirQualityParameter = 'pm25';

  getLegendTitle(): string {
    const titles: Record<AirQualityParameter, string> = {
      pm25: 'PM2.5 (µg/m³)',
      pm10: 'PM10 (µg/m³)',
      co: 'CO (µg/m³)',
      no2: 'NO₂ (µg/m³)',
      o3: 'O₃ (µg/m³)',
      temperature: 'Sıcaklık (°C)',
      humidity: 'Nem (%)'
    };
    return titles[this.parameter] || 'Hava Kalitesi';
  }

  getQualityLevels() {
    if (this.parameter === 'temperature') {
      return [
        { color: '#4169E1', label: 'Kötü (≤0°C)' },
        { color: '#87CEEB', label: 'Orta (1-10°C)' },
        { color: '#90EE90', label: 'İyi (11-20°C)' },
        { color: '#00e400', label: 'Çok İyi (21-26°C)' },
        { color: '#ffff00', label: 'Orta (27-32°C)' },
        { color: '#ff0000', label: 'Kötü (≥33°C)' },
        { color: '#808080', label: 'Veri Yok' }
      ];
    }
    
    return [
      { color: '#00e400', label: 'İyi' },
      { color: '#ffff00', label: 'Yeterli' },
      { color: '#ff7e00', label: 'Orta' },
      { color: '#ff0000', label: 'Kötü' },
      { color: '#8f3f97', label: 'Çok Kötü' },
      { color: '#808080', label: 'Veri Yok' }
    ];
  }

  getParameterInfo(): string {
    const info: Record<AirQualityParameter, { title: string, description: string }> = {
      no2: {
        title: '🚗 NO₂ (Azot Dioksit)',
        description: `
          <div class="info-section">
            <strong>Nedir?</strong> Egzoz gazlarından, özellikle trafikteki araçlardan çıkan zararlı bir gaz.
          </div>
          <div class="info-section">
            <strong>Neden Önemli?</strong> Akciğerleri tahriş eder, özellikle çocuklar ve yaşlılar daha hassastır.
          </div>
          <div class="info-section">
            <strong>Nereden Gelir?</strong> Araç egzozları, fabrika bacaları.
          </div>`
      },
      pm10: {
        title: '🌪️ PM10 (Partikül Madde 10 mikron altı)',
        description: `
          <div class="info-section">
            <strong>Nedir?</strong> Havada uçuşan çok küçük toz, duman ve diğer parçacıklar.
          </div>
          <div class="info-section">
            <strong>Neden Önemli?</strong> Bu parçacıklar burnumuzdan geçip solunum yollarımıza ulaşabilir.
          </div>
          <div class="info-section">
            <strong>Nereden Gelir?</strong> İnşaatlar, toprak, egzoz gazları, sanayi.
          </div>`
      },
      pm25: {
        title: '🌫️ PM2.5 (Partikül Madde 2.5 mikron altı)',
        description: `
          <div class="info-section">
            <strong>Nedir?</strong> PM10'dan bile küçük parçacıklardır. O kadar küçüktür ki doğrudan akciğerlere ve hatta kana karışabilir.
          </div>
          <div class="info-section">
            <strong>Neden Önemli?</strong> En tehlikeli hava kirleticilerden biridir. Kalp ve akciğer hastalıklarına yol açabilir.
          </div>
          <div class="info-section">
            <strong>Nereden Gelir?</strong> Sigara dumanı, egzozlar, fabrika dumanı, orman yangınları.
          </div>`
      },
      o3: {
        title: '🌞 O₃ (Ozon - Yüzey Seviyesinde)',
        description: `
          <div class="info-section">
            <strong>Nedir?</strong> Atmosferin üst katmanındaki ozon bizi güneşten korur ama yere yakın ozon solunabilir bir gazdır ve zararlıdır.
          </div>
          <div class="info-section">
            <strong>Neden Önemli?</strong> Gözleri yakabilir, boğazı tahriş edebilir, solunumu zorlaştırabilir.
          </div>
          <div class="info-section">
            <strong>Nereden Gelir?</strong> Güneş ışığı ve araç egzozu gibi gazların kimyasal tepkimesiyle oluşur.
          </div>`
      },
      co: {
        title: '🔥 CO (Karbonmonoksit)',
        description: `
          <div class="info-section">
            <strong>Nedir?</strong> Renksiz, kokusuz ama son derece zehirli bir gazdır.
          </div>
          <div class="info-section">
            <strong>Neden Önemli?</strong> Yüksek seviyelerde solunduğunda bayılma ve hatta ölüm riski taşır.
          </div>
          <div class="info-section">
            <strong>Nereden Gelir?</strong> Yanlış çalışan sobalar, araç egzozları, yangınlar.
          </div>`
      },
      temperature: {
        title: '🌡️ Sıcaklık',
        description: `
          <div class="info-section">
            <strong>Nedir?</strong> Havanın ısı derecesini gösteren meteorolojik bir parametredir.
          </div>
          <div class="info-section">
            <strong>Neden Önemli?</strong> Yüksek sıcaklıklar sağlık sorunlarına, düşük sıcaklıklar ise donma riskine yol açabilir.
          </div>
          <div class="info-section">
            <strong>Nasıl Etkilenir?</strong> Güneş ışınları, nem oranı, rüzgar ve coğrafi koşullardan etkilenir.
          </div>`
      },
      humidity: {
        title: '💧 Nem',
        description: `
          <div class="info-section">
            <strong>Nedir?</strong> Havadaki su buharı miktarının yüzdesel oranıdır.
          </div>
          <div class="info-section">
            <strong>Neden Önemli?</strong> Yüksek nem bunaltıcı hissettirirken, düşük nem solunum yolu rahatsızlıklarına neden olabilir.
          </div>
          <div class="info-section">
            <strong>Nasıl Etkilenir?</strong> Sıcaklık, yağış, rüzgar ve coğrafi koşullardan etkilenir.
          </div>`
      }
    };

    const currentInfo = info[this.parameter];
    return `
      <div class="info-title">${currentInfo.title}</div>
      ${currentInfo.description}
    `;
  }
} 