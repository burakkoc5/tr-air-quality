# Air Quality Frontend

A modern web application built with Angular that visualizes air quality data across different cities using interactive maps. The application provides real-time air quality monitoring with an intuitive user interface and dynamic data visualization.

## Features

- 🗺️ Interactive map interface using Leaflet
- 📊 Real-time air quality data visualization
- 🎨 Dynamic styling based on air quality parameters
- 📱 Responsive design for both desktop and mobile devices
- 🔄 Real-time data updates
- 🎯 Parameter-specific visualization (PM2.5, Temperature, Humidity)
- 🏷️ City labels with zoom-dependent visibility
- 💡 Interactive tooltips with detailed information

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (comes with Node.js)
- Angular CLI (v19.2.0 or higher)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd air-quality-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200/`

## Project Structure

```
src/
├── app/
│   ├── air-quality/           # Air quality feature module
│   │   ├── components/        # Air quality related components
│   │   └── services/         # Data and styling services
│   ├── core/                 # Core module with models
│   └── shared/              # Shared components and utilities
├── assets/                  # Static assets
└── environments/           # Environment configurations
```

## Available Scripts

- `npm start` - Starts the development server
- `npm run build` - Builds the application for production
- `npm test` - Runs unit tests
- `npm run watch` - Builds and watches for changes

## Dependencies

- Angular (v19.2.0)
- Leaflet for map visualization
- @turf/turf for geospatial calculations
- Angular Material for UI components
- RxJS for reactive programming

## Features in Detail

### Map Visualization
- Interactive map powered by Leaflet
- City boundaries displayed as polygons
- Color-coded regions based on air quality parameters
- Dynamic city labels that appear at appropriate zoom levels

### Air Quality Parameters
- PM2.5 measurements
- Temperature readings
- Humidity levels
- Real-time data updates

### User Interface
- Parameter selector for different measurements
- Map legend showing quality levels
- Interactive tooltips with detailed information
- Responsive design for all screen sizes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Angular
- Map visualization powered by Leaflet
- Geospatial calculations using Turf.js
- UI components from Angular Material
