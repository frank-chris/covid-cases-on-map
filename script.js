// For geoJson layer
var geojson;

// Start and end date parameters
var startDate = new Date("03/14/2020"); 
var endDate= new Date("05/07/2020"); 

// Total number of days for the slider
var noOfDays = (endDate.getTime() - startDate.getTime())/ (1000 * 3600 * 24);

// Set labels for slider
var startDateLabel = document.getElementById("start-date");
var endDateLabel = document.getElementById("end-date");
startDateLabel.innerHTML = startDate.toString().replace("00:00:00 GMT+0530 (India Standard Time)","");
endDateLabel.innerHTML = endDate.toString().replace("00:00:00 GMT+0530 (India Standard Time)","");;

// Slider accessed by Id and values set
var slider = document.getElementById("myRange");
slider.value = noOfDays;
slider.min = 0;
slider.max = noOfDays;

// Function to decide colors based on data
function getColor(value) {
    return value > 1000 ? '#800026' :
           value > 500  ? '#BD0026' :
           value > 200  ? '#E31A1C' :
           value > 100  ? '#FC4E2A' :
           value > 50   ? '#FD8D3C' :
           value > 20   ? '#FEB24C' :
           value > 10   ? '#FED976' :
                      '#FFEDA0';
}

// Function to set style for geoJson layer
function style(feature) {
    return {
        fillColor: getColor(feature.properties['Confirmed_' + calculatedDate(slider.value)]),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}

// Event listener function to highlight a feature when mouse hovers on it
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 4,
        color: '#552631',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

// Event listener function to reset highlight when mouse moves out of a feature
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

// Event listener function to zoom to a feature when clicked on it
function zoomToFeature(e) {
    mymap.fitBounds(e.target.getBounds());
}

// Function to add the event listeners to each of the
// features using onEachFeature of geoJson layer
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Set location and zoom 
var mymap = L.map('mapid').setView([22.146, 79.088], 4);

// Tile Layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);


// GeoJson Layer
geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(mymap);

// Info control
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // Create a div with a class "info"
    this.update();
    return this._div;
};

// Method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>'+ calculatedDate(slider.value).replace(/_/g, ' ') + '</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + 'Confirmed: ' + props['Confirmed_' + calculatedDate(slider.value)]
        +'<br />' + 'Recovered: ' + props['Recovered_' + calculatedDate(slider.value)] 
        +'<br />' + 'Deceased: ' + props['Deceased_' + calculatedDate(slider.value)] 
        : 'Hover over a state');
};

// Add to info control to the map
info.addTo(mymap);

// Legend Control
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

    
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

// Add legend to map
legend.addTo(mymap);

// Function to return shortened month name
// Output of the JavaScript date function 'getMonth()' is passed as argument
function getMonthName(month){
    return month == 0  ? 'Jan' :
           month == 1  ? 'Feb' :
           month == 2  ? 'Mar' :
           month == 3  ? 'Apr' :
           month == 4  ? 'May' :
           month == 5  ? 'Jun' :
           month == 6  ? 'Jul' :
           month == 7  ? 'Aug' :
           month == 8  ? 'Sep' :
           month == 9  ? 'Oct' :
           month == 10 ? 'Nov' :
           month == 11 ? 'Dec' :
                      'Error: Invalid Argument';
}

// Function to pad a zero on the left for single digit dates
// Output of the JavaScript date function 'getDate()' is passed as argument
function getPaddedDate(date){
    if (date >= 10){
        return date.toString();
    }
    else{
        return "0" + date.toString();
    }
}

// Function to calculate date from the slider value
function calculatedDate(value){
    var reqDate = new Date(startDate.getTime() + value * (1000 * 3600 * 24));

    return (getPaddedDate(reqDate.getDate()) + "_"
            + getMonthName(reqDate.getMonth()) + "_"
            + reqDate.getFullYear().toString().substring(2)).toString();

}


// Update info control and geoJson layer(on dragging slider)
slider.oninput = function() {
  info.update();
  geojson.resetStyle(); // not working as I thought, trying to fix  
}

