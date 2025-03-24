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

const selectedStyleCanada = {
  color: "#000",
  weight: 2,
  fillColor: "#e60026", // deeper red
  fillOpacity: 0.6
};

const selectedStyleUSA = {
  color: "#000",
  weight: 2,
  fillColor: "blue",
  fillOpacity: 0.6
};

const selectedStyleDefault = {
  color: "#000",
  weight: 2,
  fillColor: "#999", // neutral gray
  fillOpacity: 0.6
};



const hoverStyleCanada = {
  fillColor: "#ffcccc",  // light red
  fillOpacity: 0.4,
  color: "#000",
  weight: 1
};

const hoverStyleUSA = {
  fillColor: "#cce5ff",  // light blue
  fillOpacity: 0.4,
  color: "#000",
  weight: 1
};

const hoverStyleDefault = {
  fillColor: "#e6e6e6",  // neutral grey for other countries
  fillOpacity: 0.4,
  color: "#000",
  weight: 1
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
  const adminCountry = feature.properties.admin || feature.properties.ADMIN;
  const hasPlaylist = !!spotifyPlaylists[regionName];
  
  let labelClass = 'label-no-playlist';
  if (hasPlaylist && adminCountry === "Canada") {
    labelClass = 'label-has-playlist-canada';
  } else if (hasPlaylist && adminCountry === "United States of America") {
    labelClass = 'label-has-playlist-usa';
  }
  
  layer.bindTooltip(regionName, {
    permanent: true,
    direction: 'center',
    className: labelClass
  });

  layer.selected = false;

  // console.log(regionName, "hasPlaylist:", hasPlaylist);
  // console.log(
  //   "Region:", feature.properties.name || feature.properties.NAME,
  //   "| Country Field:", feature.properties.admin || feature.properties.ADMIN
  // );


  // Hover + Click
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: onFeatureClick
  });
}

function highlightFeature(e) {
  const layer = e.target;
  if (layer.selected) return;

  const adminCountry = layer.feature.properties.admin || layer.feature.properties.ADMIN;

  if (adminCountry === "Canada") {
    layer.setStyle(hoverStyleCanada);
  } else if (adminCountry === "United States of America") {
    layer.setStyle(hoverStyleUSA);
  } else {
    layer.setStyle(hoverStyleDefault);
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
  const adminCountry = layer.feature.properties.admin || layer.feature.properties.ADMIN;

  if (selectedLayer && selectedLayer !== layer) {
    selectedLayer.setStyle(defaultStyle);
    selectedLayer.selected = false;
    selectedLayer.closePopup();
  }

  if (!layer.selected) {
    layer.selected = true;
    if (adminCountry === "Canada") {
      layer.setStyle(selectedStyleCanada);
    } else if (adminCountry === "United States of America") {
      layer.setStyle(selectedStyleUSA);
    } else {
      layer.setStyle(selectedStyleDefault);
    }

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
