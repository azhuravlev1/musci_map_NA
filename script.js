// Global variable to track the currently selected layer
var selectedLayer = null;

// Define the different style states
var defaultStyle = {
  color: "#000",      // border color
  weight: 1,          // border thickness
  fillColor: "#fff",  // fill color (won't show because opacity is 0)
  fillOpacity: 0      // fully transparent fill (only borders visible)
};

var hoverStyle = {
  fillColor: "#ADD8E6", // light blue on hover
  fillOpacity: 0.3
};

var selectedStyle = {
  color: "#000",
  weight: 2,          // thicker border when selected
  fillColor: "blue",  // blue fill for selected state
  fillOpacity: 0.5
};

// Initialize the Leaflet map with a white background (no tile layer)
var map = L.map('map').setView([55, -100], 3);

// Load your GeoJSON data
fetch('data/us_canada.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJson(data, {
      style: defaultStyle,
      onEachFeature: onEachFeature
    }).addTo(map);
  })
  .catch(err => {
    console.error('GeoJSON error:', err);
    alert('Failed to load GeoJSON data. Check console.');
  });

// Set up event handlers for each feature
function onEachFeature(feature, layer) {
  // Initialize a flag to keep track of selection state
  layer.selected = false;

  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: onFeatureClick
  });
}

// When the mouse is over a feature, if it is not selected, highlight it
function highlightFeature(e) {
  var layer = e.target;
  if (!layer.selected) {
    layer.setStyle(hoverStyle);
  }
}

// When the mouse leaves the feature, if it is not selected, revert to default style
function resetHighlight(e) {
  var layer = e.target;
  if (!layer.selected) {
    layer.setStyle(defaultStyle);
  }
}

// On click, toggle the selected state and open/close a popup
function onFeatureClick(e) {
  var layer = e.target;
  
  // If another layer is already selected, deselect it first
  if (selectedLayer && selectedLayer !== layer) {
    selectedLayer.setStyle(defaultStyle);
    selectedLayer.selected = false;
    selectedLayer.closePopup();
  }
  
  // Toggle selection state
  if (!layer.selected) {
    layer.selected = true;
    layer.setStyle(selectedStyle);
    selectedLayer = layer;
    
    // Bind and open a popup (empty for now, to be updated later with a Spotify widget)
    layer.bindPopup('<div style="min-width:150px; min-height:50px;">Popup Content</div>', { closeButton: true }).openPopup();
  } else {
    // If already selected, deselect it
    layer.setStyle(defaultStyle);
    layer.selected = false;
    layer.closePopup();
    selectedLayer = null;
  }
}

// When the popup is closed (via the built-in close button), deselect the state
map.on('popupclose', function(e) {
  var layer = e.popup._source;
  layer.setStyle(defaultStyle);
  layer.selected = false;
  if (selectedLayer === layer) {
    selectedLayer = null;
  }
});
