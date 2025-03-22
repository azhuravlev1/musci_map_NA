const map = L.map('map').setView([50, -100], 3);

// Set minimalist white tiles (or no tiles at all)
L.tileLayer('', {
  attribution: ''
}).addTo(map);

// Load your GeoJSON data
fetch('data/north-america.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJson(data, {
      style: feature => ({
        color: '#000',
        weight: feature.properties.ADMIN === 'Canada' || feature.properties.ADMIN === 'United States of America' ? 2 : 1,
        fillColor: '#fff',
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          showSpotifyPopup(layer, feature);
        });
      }
    }).addTo(map);
  });

// Function to show Spotify Popup
function showSpotifyPopup(layer, feature) {
  const regionName = feature.properties.NAME || feature.properties.name;

  // You can use an object or file to easily update playlists later
  const spotifyUrls = {
    'Ontario': 'YOUR_SPOTIFY_URL_FOR_ONTARIO',
    'California': 'YOUR_SPOTIFY_URL_FOR_CALIFORNIA',
    // ... more regions
  };

  const spotifyUrl = spotifyUrls[regionName];

  if (spotifyUrl) {
    const embedHtml = `
      <iframe style="border-radius:12px" 
              src="${spotifyUrl}" 
              width="300" height="152" frameBorder="0" 
              allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
      </iframe>
    `;

    layer.bindPopup(embedHtml).openPopup();
  } else {
    layer.bindPopup(`No playlist for ${regionName} yet!`).openPopup();
  }
}
