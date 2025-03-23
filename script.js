let map = L.map('map').setView([55, -100], 3);
let selectedLayer = null;
let spotifyPlaylists = {};

// Styling rules
const defaultStyle = {
  color: "#000",
  weight: 1,
  fillColor: "#fff",
  fillOpacity: 0
};

const hoverStyle = {
  fillColor: "#ADD8E6",
  fillOpacity: 0.3
};

const selectedStyle = {
  color: "#000",
  weight: 2,
  fillColor: "blue",
  fillOpacity: 0.5
};

// Load the Spotify playlist mapping first
fetch('playlists/spotifyPlaylists.json')
  .then(response => response.json())
  .then(data => {
    spotifyPlaylists = data;
    console.log("Loaded playlist mapping:", spotifyPlaylists);


    // Once loaded, load the map
    fetch('data/us_canada.geojson')
      .then(response => response.json())
      .then(geoData => {
        L.geoJson(geoData, {
          style: defaultStyle,
          onEachFeature: onEachFeature
        }).addTo(map);
      })
      .catch(err => console.error("GeoJSON load error:", err));
  })
  .catch(err => console.error("Playlist JSON load error:", err));

function onEachFeature(feature, layer) {
  const regionName = feature.properties.name || feature.properties.NAME;
  const hasPlaylist = !!spotifyPlaylists[regionName];

  layer.selected = false;

  // Permanent label (tooltip)
  layer.bindTooltip(regionName, {
    permanent: true,
    direction: 'center',
    className: hasPlaylist ? 'label-has-playlist' : 'label-no-playlist'
  });
  console.log(regionName, "hasPlaylist:", hasPlaylist);


  // Hover + Click
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: onFeatureClick
  });
}

function highlightFeature(e) {
  const layer = e.target;
  if (!layer.selected) {
    layer.setStyle(hoverStyle);
  }
}

function resetHighlight(e) {
  const layer = e.target;
  if (!layer.selected) {
    layer.setStyle(defaultStyle);
  }
}

function onFeatureClick(e) {
  const layer = e.target;
  const regionName = layer.feature.properties.name || layer.feature.properties.NAME;

  if (selectedLayer && selectedLayer !== layer) {
    selectedLayer.setStyle(defaultStyle);
    selectedLayer.selected = false;
    selectedLayer.closePopup();
  }

  if (!layer.selected) {
    layer.selected = true;
    layer.setStyle(selectedStyle);
    selectedLayer = layer;

    const embedUrl = spotifyPlaylists[regionName] || "";
    const popupContent = embedUrl
      ? `<iframe style="border-radius:12px" src="${embedUrl}" width="300" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`
      : `<div>No playlist available for ${regionName}.</div>`;

    layer.bindPopup(popupContent, { closeButton: true }).openPopup();
  } else {
    layer.setStyle(defaultStyle);
    layer.selected = false;
    layer.closePopup();
    selectedLayer = null;
  }
}

// Reset selection when popup is closed
map.on('popupclose', function(e) {
  const layer = e.popup._source;
  layer.setStyle(defaultStyle);
  layer.selected = false;
  if (selectedLayer === layer) {
    selectedLayer = null;
  }
});
