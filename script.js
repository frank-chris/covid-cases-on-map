// For geoJson layers
var geojson = {}

var currentBaseLayer = "Predicted";

var currentState = "Total";

// Start and end date parameters
var startDate = new Date("03/23/2020"); 
var endDate= new Date("05/07/2020"); 

// Total number of days for the slider
var noOfDays = 75;

var todaysDate = new Date();
var daysTillToday = (todaysDate.getTime()-startDate.getTime())/(1000 * 3600 * 24);


// Set labels for slider
var startDateLabel = document.getElementById("start-date");
var endDateLabel = document.getElementById("end-date");
startDateLabel.innerHTML = calculatedDate(0).replace(/_/g, ' ');
endDateLabel.innerHTML = calculatedDate(noOfDays).replace(/_/g, ' ');

// Set current stats
var deaths = document.getElementById("deaths");
var cases = document.getElementById("cases");
var recoveries = document.getElementById("recoveries");
cases.innerHTML = totalData[0]["Confirmed_" + calculatedDate(daysTillToday-2)];
recoveries.innerHTML = totalData[0]["Recovered_" + calculatedDate(daysTillToday-2)];
deaths.innerHTML = totalData[0]["Deceased_" + calculatedDate(daysTillToday-2)];

// Slider accessed by Id and values set
var slider = document.getElementById("myRange");
slider.value = daysTillToday;
slider.min = 0;
slider.max = noOfDays;

if(L.Browser.mobile){
    var mapdiv = document.getElementById("mapid");
    mapdiv.style.width = "100%";
    var slidercontainer = document.getElementById("slider1");
    slidercontainer.style.left = "2%";
}

function getMax(prop){
    var state;
    var max = 0;
    for (state of statesData["features"]){
        if (Number(state["properties"][prop]) > max){
            max = Number(state["properties"][prop]);
        }
    }
    if(max == 0){
        max = 100;
    }
    max = Math.ceil(max/100)*100;

    return max;
}


// Function to decide colors based on data
function getColor(value, prop) {
    
    var max = getMax(prop);

    return value > max ? '#990000' :
           value > max/2  ? '#d7301f' :
           value > max/5  ? '#ef6548' :
           value > max/10  ? '#fc8d59' :
           value > max/20   ? '#fdd49e' :
           value > max/50   ? '#ffff29' :
           value > max/100   ? '#d6ff75' :
           value >= 0   ? '#78c679' :
                      '#fdfdfd';
}



// Function to set style for geoJson layer
function style(feature) {
    return {
        fillColor: getColor(feature.properties[(slider.value).toString()], (slider.value).toString()),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}

function stylePredictedRecovered(feature) {
    return {
        fillColor: getColor(feature.properties["Recovered" + (slider.value).toString()], "Recovered" + (slider.value).toString()),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}

function styleNucleation(feature) {
    return {
        fillColor: getColor(feature.properties["Nucleation" + (slider.value).toString()], "Nucleation" + (slider.value).toString()),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}

function styleConfirmed(feature) {
    return {
        fillColor: getColor(feature.properties['Confirmed_' + calculatedDate(slider.value)], 'Confirmed_' + calculatedDate(slider.value)),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}

function styleActive(feature) {
    return {
        fillColor: getColor(  feature.properties['Confirmed_' + calculatedDate(slider.value)] 
                            - feature.properties['Recovered_' + calculatedDate(slider.value)]
                            - feature.properties['Deceased_' + calculatedDate(slider.value)] ,
                             'Confirmed_' + calculatedDate(slider.value)),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}

function styleRecovered(feature) {
    return {
        fillColor: getColor(feature.properties['Recovered_' + calculatedDate(slider.value)], 'Recovered_' + calculatedDate(slider.value)),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}

function styleDeceased(feature) {
    return {
        fillColor: getColor(feature.properties['Deceased_' + calculatedDate(slider.value)], 'Deceased_' + calculatedDate(slider.value)),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}


function legendGrades(prop){
    
    var max = getMax(prop);

    return [0, max/100, max/50, max/20, max/10, max/5, max/2, max];
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
    geojson[currentBaseLayer].resetStyle(e.target);
    info.update();
}


// Event listener function to zoom to a feature when clicked on it
function zoomToFeature(e) {
    mymap.fitBounds(e.target.getBounds());
    loadChart(e.target.feature.properties.name);
}

// Function to add the event listeners to each of the
// features using onEachFeature of geoJson layer
function onEachFeature(feature, layer) {
    if(L.Browser.mobile){
        layer.on({
            mousedown: highlightFeature,
            mouseup: resetHighlight,
            dblclick: zoomToFeature
        });
    }
    else{
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }
}



// Set location and zoom 
var mymap = L.map('mapid',{zoomControl: false}).setView([22.146, 79.088], 5);

// Map Filter
let myFilter = [
    'saturation:140%',
    'brightness:95%'
];

// http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}
// Google Streets Tile Layer with grayscale filter
var googleStreets = L.tileLayer.colorFilter('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        // minZoom: 2,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        // attribution: 'Map Data &copy; <a href="https://www.google.com/maps/">2020 Google Maps</a>',
        filter: myFilter
    }).addTo(mymap);


// GeoJson Layer
geojson["Predicted"] = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(mymap);

geojson["Nucleation"] = L.geoJson(statesData, {
    style: styleNucleation,
    onEachFeature: onEachFeature
});


geojson["PredictedRecovered"] = L.geoJson(statesData, {
    style: stylePredictedRecovered,
    onEachFeature: onEachFeature
});


geojson["Confirmed"] = L.geoJson(statesData, {
    style: styleConfirmed,
    onEachFeature: onEachFeature
});

geojson["Active"] = L.geoJson(statesData, {
    style: styleActive,
    onEachFeature: onEachFeature
});

geojson["Recovered"] = L.geoJson(statesData, {
    style: styleRecovered,
    onEachFeature: onEachFeature
});

geojson["Deceased"] = L.geoJson(statesData, {
    style: styleDeceased,
    onEachFeature: onEachFeature
});


// Title info control
var title = L.control();

title.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'title'); // Create a div with a class "info"
    this.update();
    return this._div;
};

title.update = function () {
    this._div.innerHTML = '<h3>'+ runID + '</h3>' 
                            + "Total predicted<br> cases: <b>" + totalData[0][slider.value.toString()]
                            + "</b><br> Total(Nucleation)<br> cases: <b>" + totalData[0]["Nucleation" + slider.value.toString()]
                            + ((recoveredAvailable=='y' || recoveredAvailable=='Y')?"</b><br> Recovered(Pred)<br> cases: <b>" + totalData[0]["Recovered" + slider.value.toString()]:'')
                            + "</b><br> Total confirmed<br> cases: <b>" 
                            + totalData[0]["Confirmed_" + calculatedDate(slider.value)]
                            + "</b><br> Total active<br> cases: <b>" 
                            + (totalData[0]["Confirmed_" + calculatedDate(slider.value)] 
                                    - totalData[0]["Recovered_" + calculatedDate(slider.value)] 
                                    - totalData[0]["Deceased_" + calculatedDate(slider.value)] ).toString()
                            + "</b><br> Total recovered<br> cases: <b>" 
                            + totalData[0]["Recovered_" + calculatedDate(slider.value)]
                            + "</b><br> Total deceased<br> cases: <b>" 
                            + totalData[0]["Deceased_" + calculatedDate(slider.value)];
};

title.setPosition('topleft');

title.addTo(mymap);

// Info control
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // Create a div with a class "info"
    this.update();
    return this._div;
};

// Method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h3>'+ calculatedDate(slider.value).replace(/_/g, ' ') + '</h3>' +  (props ?
        '<b>' + props.name +'</b>'
        +'<br />' + 'Predicted<br />Cases: ' + '<b>' + props[slider.value.toString()] +'</b>'
        +'<br />' + 'Nucleation<br />Cases: ' + '<b>' + props["Nucleation" + slider.value.toString()] +'</b>'
        + ((recoveredAvailable=='y' || recoveredAvailable=='Y')?'<br />' + 'Recovered(Pred)<br />Cases: ' + '<b>' + props["Recovered" + slider.value.toString()] +'</b>':'')
        +'<br />' + 'Confirmed<br />Cases: ' + '<b>' + props["Confirmed_" + calculatedDate(slider.value)] +'</b>'
        +'<br />' + 'Active<br />Cases: ' + '<b>' + (props["Confirmed_" + calculatedDate(slider.value)] 
                                                  - props["Recovered_" + calculatedDate(slider.value)] 
                                                  - props["Deceased_" + calculatedDate(slider.value)]).toString() +'</b>'
        +'<br />' + 'Recovered<br />Cases: ' + '<b>' + props["Recovered_" + calculatedDate(slider.value)] +'</b>'
        +'<br />' + 'Deceased<br />Cases: ' + '<b>' + props["Deceased_" + calculatedDate(slider.value)] +'</b>'
        : 'Hover over<br />a state');
};

// Add to info control to the map
info.addTo(mymap);


// Legend Control
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    this._div = L.DomUtil.create('div', 'info legend');
    this.update();
    return this._div;
};

legend.update = function (currentBaseLayer){
    var grades;
    var labels;

    if (currentBaseLayer == "Predicted"){
        grades = legendGrades((slider.value).toString());
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, (slider.value).toString()) + '"></i> ' +
                grades[i].toString() + (grades[i + 1] ? '&ndash;' + grades[i + 1].toString() + '<br>' : '+');
        }
    }


    else if(currentBaseLayer == "Nucleation"){
        grades = legendGrades("Nucleation" + (slider.value).toString());
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, "Nucleation" + (slider.value).toString()) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    }

    else if(currentBaseLayer == "Recovered(Pred)"){
        grades = legendGrades("Recovered" + (slider.value).toString());
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, "Recovered" + (slider.value).toString()) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    }

    else if(currentBaseLayer == "Confirmed" || currentBaseLayer == "Active" ){
        grades = legendGrades("Confirmed_" + calculatedDate(slider.value));
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, "Confirmed_" + calculatedDate(slider.value)) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    }


    else if(currentBaseLayer == "Recovered"){
        grades = legendGrades("Recovered_" + calculatedDate(slider.value));
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, "Recovered_" + calculatedDate(slider.value)) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    }

    else if(currentBaseLayer == "Deceased"){
        grades = legendGrades("Deceased_" + calculatedDate(slider.value));
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, "Deceased_" + calculatedDate(slider.value)) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    }

    else{
        grades = legendGrades((slider.value).toString());
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, (slider.value).toString()) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    }
    
}


// Add legend to map
legend.addTo(mymap);



var baseMaps = {
    "Predicted": geojson["Predicted"],
    "Nucleation": geojson["Nucleation"],
    "Recovered(Pred)":geojson["PredictedRecovered"],
    "Confirmed": geojson["Confirmed"],
    "Active": geojson["Active"],
    "Recovered": geojson["Recovered"],
    "Deceased" : geojson["Deceased"]
};



var layerControl = L.control.layers(baseMaps).addTo(mymap);

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
  title.update();
  geojson["Predicted"].resetStyle();
  geojson["Confirmed"].resetStyle();
  geojson["PredictedRecovered"].resetStyle();
  geojson["Active"].resetStyle();
  geojson["Recovered"].resetStyle(); 
  geojson["Deceased"].resetStyle();
  geojson["Nucleation"].resetStyle();
  legend.update(currentBaseLayer);
}



mymap.on("baselayerchange", function(e){
    currentBaseLayer = e.name;
    console.log(e.name);
    legend.update(currentBaseLayer);
 })


// Custom zoom control bar with a Zoom to Home button
L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topleft',
        zoomInText: '<big>+</big>',
        zoomInTitle: 'Zoom In',
        zoomOutText: '<big>-</big>',
        zoomOutTitle: 'Zoom Out',
        zoomHomeText: '<i class="fa fa-home"></i>',
        zoomHomeTitle: 'Zoom Home'
    },

    onAdd: function (map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
        controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
        controlName + '-home', container, this._zoomHome);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
        controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function (map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function (e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function (e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function (e) {
        this._map.setView([22.146, 79.088], 5);
    },

    _createButton: function (html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});

// add zoom control bar to the map
var zoomBar = new L.Control.zoomHome();
zoomBar.addTo(mymap);



// Function to return shortened month name
// Output of the JavaScript date function 'getMonth()' is passed as argument
function monthName(month){
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
function paddedDate(date){
  if (date >= 10){
      return date.toString();
  }
  else{
      return "0" + date.toString();
  }
}

// Function to calculate date
function chartDate(value){
  var reqDate = new Date(startDate.getTime() + value * (1000 * 3600 * 24));

  return (paddedDate(reqDate.getDate()) + "-"
          + monthName(reqDate.getMonth()) + "-"
          + reqDate.getFullYear().toString().substring(2)).toString();

}



let data = {}
let diagnosticsData = {}
let dailyData = {}

var i;
data["Total"] = [];
diagnosticsData["Total"] = []
dailyData["Total"] = []
for(i=0;i<=75;i++){
  data["Total"].push([chartDate(i), "Active(Pred)", totalData[0][i.toString()]]);
  data["Total"].push([chartDate(i), "Recovered(Pred)", totalData[0]["Recovered" + i.toString()]]);
  data["Total"].push([chartDate(i), "Active(Pred)+Recovered(Pred)", Number(totalData[0][i.toString()]) + Number(totalData[0]["Recovered" + i.toString()])]);
  data["Total"].push([chartDate(i), "Confirmed", totalData[0]["Confirmed_" + calculatedDate(i)]]);
  data["Total"].push([chartDate(i), "Active", totalData[0]["Confirmed_" + calculatedDate(i)] - totalData[0]["Recovered_" + calculatedDate(i)] - totalData[0]["Deceased_" + calculatedDate(i)]]);
  data["Total"].push([chartDate(i), "Recovered", totalData[0]["Recovered_" + calculatedDate(i)]]);
  data["Total"].push([chartDate(i), "Deceased", totalData[0]["Deceased_" + calculatedDate(i)]]);
  data["Total"].push([chartDate(i), "Recovered+Deceased", Number(totalData[0]["Recovered_" + calculatedDate(i)]) + Number(totalData[0]["Deceased_" + calculatedDate(i)])]);
  diagnosticsData["Total"].push([chartDate(i), "Ratio-1", Number(totalData[0]["RatiosConfirmed_" + calculatedDate(i)])/(Number(totalData[0]["Confirmed_" + calculatedDate(i)]) - Number(totalData[0]["Recovered_" + calculatedDate(i)]) - Number(totalData[0]["Deceased_" + calculatedDate(i)]) )]);  
  diagnosticsData["Total"].push([chartDate(i), "Product-1", Number(totalData[0]["RatiosConfirmed_" + calculatedDate(i)])*Number(totalData[0][i.toString()])/(Number(totalData[0]["Confirmed_" + calculatedDate(i)]) - Number(totalData[0]["Recovered_" + calculatedDate(i)]) - Number(totalData[0]["Deceased_" + calculatedDate(i)]) )]);  
  diagnosticsData["Total"].push([chartDate(i), "Ratio-2", Number(totalData[0]["Recovered_" + calculatedDate(i)])/Number(totalData[0]["Confirmed_" + calculatedDate(i)]) ]);
  diagnosticsData["Total"].push([chartDate(i), "Doubling Time", totalData[0]["DRConfirmed_" + calculatedDate(i)]]);  
  diagnosticsData["Total"].push([chartDate(i), "Ratio-3", Number(totalData[0]["RatiosDeceased_" + calculatedDate(i)])/(Number(totalData[0]["Confirmed_" + calculatedDate(i)]) - Number(totalData[0]["Recovered_" + calculatedDate(i)]) - Number(totalData[0]["Deceased_" + calculatedDate(i)]) )]); 
  diagnosticsData["Total"].push([chartDate(i), "Ratio-4", Number(totalData[0]["RatiosRecovered_" + calculatedDate(i)])/(Number(totalData[0]["Confirmed_" + calculatedDate(i)]) - Number(totalData[0]["Recovered_" + calculatedDate(i)]) - Number(totalData[0]["Deceased_" + calculatedDate(i)]) )]); 
  dailyData["Total"].push([chartDate(i), "Active(Pred)", totalData[0]["DN"+i.toString()]]);
  dailyData["Total"].push([chartDate(i), "Recovered(Pred)", totalData[0]["DNRecovered" + i.toString()]]);
  dailyData["Total"].push([chartDate(i), "Active(Pred)+Recovered(Pred)", Number(totalData[0]["DN"+i.toString()])+Number(totalData[0]["DNRecovered" + i.toString()])]);
  dailyData["Total"].push([chartDate(i), "Nucleation", totalData[0]["Nucleation" + i.toString()]]);
  dailyData["Total"].push([chartDate(i), "Confirmed", totalData[0]["RatiosConfirmed_" + calculatedDate(i)]]);  
  dailyData["Total"].push([chartDate(i), "Active", totalData[0]["RatiosConfirmed_" + calculatedDate(i)] - totalData[0]["RatiosRecovered_" + calculatedDate(i)] - totalData[0]["RatiosDeceased_" + calculatedDate(i)]]);  
  dailyData["Total"].push([chartDate(i), "Recovered", totalData[0]["RatiosRecovered_" + calculatedDate(i)]]);  
  dailyData["Total"].push([chartDate(i), "Deceased", totalData[0]["RatiosDeceased_" + calculatedDate(i)]]);  
}

var stateDropDown = document.getElementById("myselect");
var stateDropDown2 = document.getElementById("myselect2");
var stateDropDown3 = document.getElementById("myselect3");

var state;
for (state of statesData["features"]){
  data[state.properties["name"]] = [];
  diagnosticsData[state.properties["name"]] = [];
  dailyData[state.properties["name"]] = [];
  for(i=0;i<=75;i++){
    data[state.properties["name"]].push([chartDate(i), "Active(Pred)", state.properties[i.toString()]]);
    data[state.properties["name"]].push([chartDate(i), "Recovered(Pred)", state.properties["Recovered" + i.toString()]]);
    data[state.properties["name"]].push([chartDate(i), "Active(Pred)+Recovered(Pred)", Number(state.properties[i.toString()])+Number(state.properties["Recovered" + i.toString()])]);
    data[state.properties["name"]].push([chartDate(i), "Confirmed", state.properties["Confirmed_" + calculatedDate(i)]]);
    data[state.properties["name"]].push([chartDate(i), "Active", state.properties["Confirmed_" + calculatedDate(i)] - state.properties["Recovered_" + calculatedDate(i)] - state.properties["Deceased_" + calculatedDate(i)]]);
    data[state.properties["name"]].push([chartDate(i), "Recovered", state.properties["Recovered_" + calculatedDate(i)]]);
    data[state.properties["name"]].push([chartDate(i), "Deceased", state.properties["Deceased_" + calculatedDate(i)]]);
    data[state.properties["name"]].push([chartDate(i), "Recovered+Deceased", Number(state.properties["Recovered_" + calculatedDate(i)])+Number(state.properties["Deceased_" + calculatedDate(i)])]);
    diagnosticsData[state.properties["name"]].push([chartDate(i), "Ratio-1", Number(state.properties["RatiosConfirmed_" + calculatedDate(i)])/(Number(state.properties["Confirmed_" + calculatedDate(i)]) - Number(state.properties["Recovered_" + calculatedDate(i)]) - Number(state.properties["Deceased_" + calculatedDate(i)]) )]);
    diagnosticsData[state.properties["name"]].push([chartDate(i), "Product-1", Number(state.properties["RatiosConfirmed_" + calculatedDate(i)])*Number(state.properties[i.toString()])/(Number(state.properties["Confirmed_" + calculatedDate(i)]) - Number(state.properties["Recovered_" + calculatedDate(i)]) - Number(state.properties["Deceased_" + calculatedDate(i)]) )]);
    diagnosticsData[state.properties["name"]].push([chartDate(i), "Ratio-2", Number(state.properties["Recovered_" + calculatedDate(i)])/Number(state.properties["Confirmed_" + calculatedDate(i)])]);
    diagnosticsData[state.properties["name"]].push([chartDate(i), "Doubling Time", state.properties["DRConfirmed_" + calculatedDate(i)]]);
    diagnosticsData[state.properties["name"]].push([chartDate(i), "Ratio-3", Number(state.properties["RatiosDeceased_" + calculatedDate(i)])/(Number(state.properties["Confirmed_" + calculatedDate(i)]) - Number(state.properties["Recovered_" + calculatedDate(i)]) - Number(state.properties["Deceased_" + calculatedDate(i)]) )]);
    diagnosticsData[state.properties["name"]].push([chartDate(i), "Ratio-4", Number(state.properties["RatiosRecovered_" + calculatedDate(i)])/(Number(state.properties["Confirmed_" + calculatedDate(i)]) - Number(state.properties["Recovered_" + calculatedDate(i)]) - Number(state.properties["Deceased_" + calculatedDate(i)]) )]);
    dailyData[state.properties["name"]].push([chartDate(i), "Active(Pred)", state.properties["DN"+i.toString()]]);
    dailyData[state.properties["name"]].push([chartDate(i), "Recovered(Pred)", state.properties["DNRecovered" + i.toString()]]);
    dailyData[state.properties["name"]].push([chartDate(i), "Active(Pred)+Recovered(Pred)", Number(state.properties["DN"+i.toString()]) + Number(state.properties["DNRecovered" + i.toString()])]);
    dailyData[state.properties["name"]].push([chartDate(i), "Nucleation", state.properties["Nucleation" + i.toString()]]);
    dailyData[state.properties["name"]].push([chartDate(i), "Confirmed", state.properties["RatiosConfirmed_" + calculatedDate(i)]]);
    dailyData[state.properties["name"]].push([chartDate(i), "Active", state.properties["RatiosConfirmed_" + calculatedDate(i)] - state.properties["RatiosRecovered_" + calculatedDate(i)] - state.properties["RatiosDeceased_" + calculatedDate(i)]]);
    dailyData[state.properties["name"]].push([chartDate(i), "Recovered", state.properties["RatiosRecovered_" + calculatedDate(i)]]);
    dailyData[state.properties["name"]].push([chartDate(i), "Deceased", state.properties["RatiosDeceased_" + calculatedDate(i)]]);
    }
  stateDropDown.innerHTML += "<option value='"+ state.properties["name"].toString() +"'>" + state.properties["name"].toString() + "</option>";
  stateDropDown2.innerHTML += "<option value='"+ state.properties["name"].toString() +"'>" + state.properties["name"].toString() + "</option>";
  stateDropDown3.innerHTML += "<option value='"+ state.properties["name"].toString() +"'>" + state.properties["name"].toString() + "</option>";
}

function getSelected()
{
var selectedSource = document.getElementById("myselect").value;
loadChart(selectedSource);
}

function getSelected2()
{
var selectedSource = document.getElementById("myselect2").value;
loadChart2(selectedSource);
}

function getSelected3()
{
var selectedSource = document.getElementById("myselect3").value;
loadChart3(selectedSource);
}


let schema = [{
    "name": "Time",
    "type": "date",
    "format": "%d-%b-%y"
  }, {
    "name": "Type",
    "type": "string"
  }, {
    "name": "Value",
    "type": "number"
  }]
  
  
 var dataStore = new FusionCharts.DataStore();
 var dataSource = {
    chart: {palettecolors: "E41A1C,4DAF4A,984EA3,FF7F00,A65628,F781BF,111111,999999",
            exportEnabled: "1",
            
  },
    caption: {
      text: currentState
    },
    // subcaption: {
    //   text: currentState
    // },
    series: "Type",
    yaxis: [
      {
        plot: "Cases",
        title: "Cases",
        // format: {
        //   prefix: ""
        // }
      }
    ]
  };

  dataSource.data = dataStore.createDataTable(data[currentState], schema);
  
  new FusionCharts({
    type: "timeseries",
    renderAt: "chart-container",
    width: "100%",
    height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
    dataSource: dataSource
  }).render();

  var dataStore2 = new FusionCharts.DataStore();
  var dataSource2 = {
     chart: {palettecolors: "E41A1C,4DAF4A,984EA3,FF7F00,A65628,F781BF,111111,999999",
             exportEnabled: "1",
             style: {
                "background": {
                    "fill": "#f6f6f6",
                },
                "canvas": {
                    "fill": "#f6f6f6",
                }
            }
   },
     caption: {
       text: currentState
     },
     // subcaption: {
     //   text: currentState
     // },
     series: "Type",
     yaxis: [
       {
         plot: "",
         title: "",
         // format: {
         //   prefix: ""
         // }
       }
     ]
   };
 
   dataSource2.data = dataStore2.createDataTable(diagnosticsData[currentState], schema);
   
   new FusionCharts({
     type: "timeseries",
     renderAt: "diagnostics",
     width: "100%",
     height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
     dataSource: dataSource2
   }).render();


   
  var dataStore3 = new FusionCharts.DataStore();
  var dataSource3 = {
     chart: {palettecolors: "E41A1C,4DAF4A,984EA3,FF7F00,A65628,F781BF,111111,999999",
             exportEnabled: "1",
             
   },
     caption: {
       text: currentState
     },
     // subcaption: {
     //   text: currentState
     // },
     series: "Type",
     yaxis: [
       {
         plot: "",
         title: "",
         // format: {
         //   prefix: ""
         // }
       }
     ]
   };
 
   dataSource3.data = dataStore3.createDataTable(dailyData[currentState], schema);
   
   new FusionCharts({
     type: "timeseries",
     renderAt: "daily-numbers",
     width: "100%",
     height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
     dataSource: dataSource3
   }).render();
  
function loadChart(state){
  if(state){
      state = state;
  }
  else{
      state = "Total";
  }
  dataSource.caption.text = state;
  dataSource.data = dataStore.createDataTable(data[state], schema);
  
  new FusionCharts({
    type: "timeseries",
    renderAt: "chart-container",
    width: "100%",
    height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
    dataSource: dataSource
  }).render();

}

function loadChart2(state){
    if(state){
        state = state;
    }
    else{
        state = "Total";
    }
    dataSource2.caption.text = state;
    dataSource2.data = dataStore2.createDataTable(diagnosticsData[state], schema);
    
    new FusionCharts({
      type: "timeseries",
      renderAt: "diagnostics",
      width: "100%",
      height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
      dataSource: dataSource2
    }).render();
  
  }
  
  
function loadChart3(state){
    if(state){
        state = state;
    }
    else{
        state = "Total";
    }
    dataSource3.caption.text = state;
    dataSource3.data = dataStore3.createDataTable(dailyData[state], schema);
    
    new FusionCharts({
      type: "timeseries",
      renderAt: "daily-numbers",
      width: "100%",
      height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
      dataSource: dataSource3
    }).render();
  
  }
  
  