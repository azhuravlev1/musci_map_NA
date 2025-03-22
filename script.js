// initialize Leaflet map
const map = L.map('map').setView([55, -100], 3);

// Add OpenStreetMap tiles temporarily for debugging
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch and load GeoJSON data
fetch('data/us_canada.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJson(data, {
      style: {
        color: '#000',
        weight: 1,
        fillColor: '#fff',
        fillOpacity: 0.5
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          alert(`You clicked on: ${feature.properties.name}`);
        });
      }
    }).addTo(map);
  })
  .catch(err => {
    console.error('GeoJSON error:', err);
    alert('Failed to load GeoJSON data. Check console.');
  });
