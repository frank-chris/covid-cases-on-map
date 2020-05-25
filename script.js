// For geoJson layers
var geojson = {}

var currentBaseLayer = "Total(Predicted)";

var currentState = "Delhi";

// Start date parameters
var startDate = new Date(SD); 


var todaysDate = new Date();
var daysTillToday = (todaysDate.getTime()-startDate.getTime())/(1000 * 3600 * 24);


// Set labels for slider
var startDateLabel = document.getElementById("start-date");
var endDateLabel = document.getElementById("end-date");
startDateLabel.innerHTML = calculatedDate(0).replace(/_/g, ' ');
endDateLabel.innerHTML = calculatedDate(noOfDays).replace(/_/g, ' ');


// Slider accessed by Id and values set
var slider = document.getElementById("myRange");
slider.value = daysTillToday - 2;
slider.min = 0;
slider.max = noOfDays;

if(L.Browser.mobile){
    var mapdiv = document.getElementById("mapid");
    mapdiv.style.width = "100%";
    mapdiv.style.height = "470px";
    var slidercontainer = document.getElementById("slider1");
    slidercontainer.style.left = "2%";
    slidercontainer.style.bottom = '5%';
    slidercontainer.style.width = '50%';
    var main = document.getElementById('main');
    main.style.paddingBottom = '0%';
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

function getColorTotal(value, prop1, prop2) {
    
    var max = getMax(prop1) + getMax(prop2);
    
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
function styleTotalPred(feature) {
    return {
        fillColor: getColorTotal(Number(feature.properties[(slider.value).toString()]) 
                            + Number(feature.properties["Recovered" + (slider.value).toString()]), 
                            (slider.value).toString(), "Recovered" + (slider.value).toString()),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}


function styleActivePred(feature) {
    return {
        fillColor: getColor(feature.properties[(slider.value).toString()], (slider.value).toString()),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}

function styleRecoveredPred(feature) {
    return {
        fillColor: getColor(feature.properties["Recovered" + (slider.value).toString()], "Recovered" + (slider.value).toString()),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    };
}

function styleTotal(feature) {
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
        fillColor: getColor(Number(feature.properties['Recovered_' + calculatedDate(slider.value)]) 
                            + Number(feature.properties['Deceased_' + calculatedDate(slider.value)]) ,
                             'Confirmed_' + calculatedDate(slider.value)),
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

function legendGradesTotal(prop1, prop2){

    var max = getMax(prop1) + getMax(prop2);

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
  
  let overallData = {}
  let stateData = {}
  var schema = [];
  var schema2 = [];
  
function loadChartData(){    
    overallData = {}
    stateData = {}
    var i;
    overallData["Total"] = [];
    for(i=0;i<=noOfDays;i++){
        overallData["Total"].push([chartDate(i), 
        /*Active(Predicted)*/      totalData[0][i.toString()],
        /*Active*/                 (totalData[0]["Confirmed_" + calculatedDate(i)] - totalData[0]["Recovered_" + calculatedDate(i)] - totalData[0]["Deceased_" + calculatedDate(i)]),
        /*Recovered(Predicted)*/   totalData[0]["Recovered" + i.toString()],
        /*Recovered*/              Number(totalData[0]["Recovered_" + calculatedDate(i)]) + Number(totalData[0]["Deceased_" + calculatedDate(i)]),
        /*Total(Predicted)*/       Number(totalData[0][i.toString()]) + Number(totalData[0]["Recovered" + i.toString()]),
        /*Total*/                  totalData[0]["Confirmed_" + calculatedDate(i)],
                                hightotalData[i.toString()], // HA
                                lowtotalData[i.toString()],  // LA
                                hightotalData["Recovered" + i.toString()], // HR
                                lowtotalData["Recovered" + i.toString()],  // LR
                                Number(hightotalData[i.toString()]) + Number(hightotalData["Recovered" + i.toString()]), // HT
                                Number(lowtotalData[i.toString()]) + Number(lowtotalData["Recovered" + i.toString()])    // LT
                            ]);
    }
    
    var stateDropDown = document.getElementById("myselect");
    stateDropDown.innerHTML = "<option value='India'>India</option>"
    
    var state;
    var k = 0;
    for (state of statesData["features"]){
        stateData[state.properties["name"]] = [];
    
        for(i=0;i<=noOfDays;i++){
        stateData[state.properties["name"]].push([chartDate(i),
                                                    state.properties[i.toString()],
                                                    (state.properties["Confirmed_" + calculatedDate(i)] - state.properties["Recovered_" + calculatedDate(i)] - state.properties["Deceased_" + calculatedDate(i)]),
                                                    highstatesData[state.properties["name"]][i.toString()],
                                                    lowstatesData[state.properties["name"]][i.toString()],
                                                    state.properties["Recovered" + i.toString()],
                                                    Number(state.properties["Recovered_" + calculatedDate(i)]) + Number(state.properties["Deceased_" + calculatedDate(i)]),
                                                    highstatesData[state.properties["name"]]["Recovered" + i.toString()],
                                                    lowstatesData[state.properties["name"]]["Recovered" + i.toString()],
                                                    Number(state.properties[i.toString()])+Number(state.properties["Recovered" + i.toString()]),
                                                    state.properties["Confirmed_" + calculatedDate(i)],
                                                    Number(highstatesData[state.properties["name"]][i.toString()])+Number(highstatesData[state.properties["name"]]["Recovered" + i.toString()]),
                                                    Number(lowstatesData[state.properties["name"]][i.toString()])+Number(lowstatesData[state.properties["name"]]["Recovered" + i.toString()])
                                                ]);
        
        // stateData[state.properties["name"]].push([chartDate(i), "Recovered(Pred)", state.properties["Recovered" + i.toString()]]);
        // stateData[state.properties["name"]].push([chartDate(i), "Recovered", state.properties["Recovered_" + calculatedDate(i)]]);
        // stateData[state.properties["name"]].push([chartDate(i), "Total(Pred)", Number(state.properties[i.toString()])+Number(state.properties["Recovered" + i.toString()])]);
        // stateData[state.properties["name"]].push([chartDate(i), "Total", state.properties["Confirmed_" + calculatedDate(i)]]);
        }
        k += 1;
        stateDropDown.innerHTML += "<option value='"+ state.properties["name"].toString() +"'>" + state.properties["name"].toString() + "</option>";
    }    
    schema2 = [{
        "name": "Time",
        "type": "date",
        "format": "%d-%b-%y"
        }, {
        "name": "Active(Predicted)",
        "type": "number"
        }, {
        "name": "Active",
        "type": "number"
        }, {
        "name": "Recovered(Predicted)",
        "type": "number"
        }, {
        "name": "Recovered",
        "type": "number"
        }, {
        "name": "Total(Predicted)",
        "type": "number"
        }, {
        "name": "Total",
        "type": "number"
        }, {
        "name": "HA",
        "type": "number"
        }, {
        "name": "LA",
        "type": "number"
        }, {
        "name": "HR",
        "type": "number"
        }, {
        "name": "LR",
        "type": "number"
        }, {
        "name": "HT",
        "type": "number"
        }, {
        "name": "LT",
        "type": "number"
        }
    ];
        
    schema = [{
        "name": "Time",
        "type": "date",
        "format": "%d-%b-%y"
        }, {
        "name": "Active(Predicted)",
        "type": "number"
        }, {
        "name": "Active",
        "type": "number"
        }, {
        "name": "HA",
        "type": "number"
        }, {
        "name": "LA",
        "type": "number"
        }, {
        "name": "Recovered(Predicted)",
        "type": "number"
        }, {
        "name": "Recovered",
        "type": "number"
        }, {
        "name": "HR",
        "type": "number"
        }, {
        "name": "LR",
        "type": "number"
        }, {
        "name": "Total(Predicted)",
        "type": "number"
        }, {
        "name": "Total",
        "type": "number"
        }, {
        "name": "HT",
        "type": "number"
        }, {
        "name": "LT",
        "type": "number"
        }
    ];
        dataStore = new FusionCharts.DataStore();
        dataSource = {
        chart: {palettecolors: "E41A1C,E41A1C,F781BF,4DAF4A,4DAF4A,FF7F00,A65628,A65628,984EA3,111111,999999",
                exportEnabled: "1",
                style: {
                    "background": {
                        "fill": "#FFFFFF",
                    },
                    "canvas": {
                        "fill": "#FFFFFF",
                    }
                }
        },
        caption: {
            text: currentState,
            position: "center",
            style: {
                text: {
                    "font-size": 22,
                    'font-family': "'Fira Sans', sans-serif",
                    'font-weight': 500,
                    'text-align' : "center",
                }
            }
        },
        subcaption: {
            text: '(Data Compared to National Trend Based Prediction)',
            position: 'center',
            style: {
                text:{
                'font-family': "'Fira Sans', sans-serif",
                'font-size' : 16,
                'fill' : '#666666',
                }
            }
        },
        
        yaxis: [
            {title: "Population",
            plot: [
                {
                    value:  {
                                high: "HA",
                                low: "LA"
                            },
                    name: "Active(Uncertainty)",
                    type: "area-range",
                    style: {
                        plot:{
                            "stroke-opacity": "0",
                            "fill-opacity": "0.1"
                        }
                    }
                },
                {
                    value: "Active(Predicted)",
                    type: "line"
                },
                {
                    value: "Active",
                    type: "line"
                },
                {
                    value:  {
                                high: "HR",
                                low: "LR"
                            },
                    name: "Recovered(Uncertainty)",
                    type: "area-range",
                    style: {
                        plot:{
                            "stroke-opacity": "0",
                            "fill-opacity": "0.1"
                        }
                    }
                },
                {
                    value: "Recovered(Predicted)",
                    type: "line"
                },
                {
                    value: "Recovered",
                    type: "line"
                },
                {
                    value:  {
                                high: "HT",
                                low: "LT"
                            },
                    name: "Total(Uncertainty)",
                    type: "area-range",
                    style: {
                        plot:{
                            "stroke-opacity": "0",
                            "fill-opacity": "0.1"
                        }
                    }
                },
                {
                    value: "Total(Predicted)",
                    type: "line"
                },
                {
                    value: "Total",
                    type: "line"
                }
            ],
            }
        ]
        };
    
        
    
        dataStore2 = new FusionCharts.DataStore();
        dataSource2 = {
        chart: {palettecolors: "E41A1C,E41A1C,F781BF,4DAF4A,4DAF4A,FF7F00,A65628,A65628,984EA3,111111,999999",
                exportEnabled: "1",
                style: {
                    "background": {
                        "fill": "#FFFFFF",
                    },
                    "canvas": {
                        "fill": "#FFFFFF",
                    }
                }
        },
        caption: {
            text: "India",
            position: "center",
            style: {
                text: {
                    "font-size": 22,
                    'font-family': "'Fira Sans', sans-serif",
                    'font-weight': 500,
                    'text-align' : "center",
                }
            }
        },
        // subcaption: {
        //   text: currentState
        // },
        yaxis: [
            {   title: "Population",
                plot: [
                    {
                        value:  {
                                    high: "HA",
                                    low: "LA"
                                },
                        name: "Active(Uncertainty)",
                        type: "area-range",
                        style: {
                            plot:{
                                "stroke-opacity": "0",
                                "fill-opacity": "0.1"
                            }
                        }
                    },
                    {
                        value: "Active(Predicted)",
                        type: "line"
                    },
                    {
                        value: "Active",
                        type: "line"
                    },
                    {
                        value:  {
                                    high: "HR",
                                    low: "LR"
                                },
                        name: "Recovered(Uncertainty)",
                        type: "area-range",
                        style: {
                            plot:{
                                "stroke-opacity": "0",
                                "fill-opacity": "0.1"
                            }
                        }
                    },
                    {
                        value: "Recovered(Predicted)",
                        type: "line"
                    },
                    {
                        value: "Recovered",
                        type: "line"
                    },
                    {
                        value:  {
                                    high: "HT",
                                    low: "LT"
                                },
                        name: "Total(Uncertainty)",
                        type: "area-range",
                        style: {
                            plot:{
                                "stroke-opacity": "0",
                                "fill-opacity": "0.1"
                            }
                        }
                    },
                    {
                        value: "Total(Predicted)",
                        type: "line"
                    },
                    {
                        value: "Total",
                        type: "line"
                    }
                ],
            }
        ]
        };
    
        dataSource2.data = dataStore2.createDataTable(overallData["Total"], schema2);
        
        new FusionCharts({
        type: "timeseries",
        renderAt: "chart-container",
        width: "100%",
        height: L.Browser.mobile?(window.innerHeight*2/3).toString(): (window.innerHeight - 110).toString() ,
        dataSource: dataSource2
        }).render();
        
}

    loadChartData();

  function getSelected()
  {
  var selectedSource = document.getElementById("myselect").value;
  loadChart(selectedSource);
  }
  
  
schema2 = [{
    "name": "Time",
    "type": "date",
    "format": "%d-%b-%y"
    }, {
    "name": "Active(Predicted)",
    "type": "number"
    }, {
    "name": "Active",
    "type": "number"
    }, {
    "name": "Recovered(Predicted)",
    "type": "number"
    }, {
    "name": "Recovered",
    "type": "number"
    }, {
    "name": "Total(Predicted)",
    "type": "number"
    }, {
    "name": "Total",
    "type": "number"
    }, {
    "name": "HA",
    "type": "number"
    }, {
    "name": "LA",
    "type": "number"
    }, {
    "name": "HR",
    "type": "number"
    }, {
    "name": "LR",
    "type": "number"
    }, {
    "name": "HT",
    "type": "number"
    }, {
    "name": "LT",
    "type": "number"
    }
];
    
schema = [{
    "name": "Time",
    "type": "date",
    "format": "%d-%b-%y"
    }, {
    "name": "Active(Predicted)",
    "type": "number"
    }, {
    "name": "Active",
    "type": "number"
    }, {
    "name": "HA",
    "type": "number"
    }, {
    "name": "LA",
    "type": "number"
    }, {
    "name": "Recovered(Predicted)",
    "type": "number"
    }, {
    "name": "Recovered",
    "type": "number"
    }, {
    "name": "HR",
    "type": "number"
    }, {
    "name": "LR",
    "type": "number"
    }, {
    "name": "Total(Predicted)",
    "type": "number"
    }, {
    "name": "Total",
    "type": "number"
    }, {
    "name": "HT",
    "type": "number"
    }, {
    "name": "LT",
    "type": "number"
    }
];
    
   var dataStore = new FusionCharts.DataStore();
   var dataSource = {
      chart: {palettecolors: "E41A1C,E41A1C,F781BF,4DAF4A,4DAF4A,FF7F00,A65628,A65628,984EA3,111111,999999",
              exportEnabled: "1",
              style: {
                  "background": {
                      "fill": "#FFFFFF",
                  },
                  "canvas": {
                      "fill": "#FFFFFF",
                  }
              }
    },
      caption: {
        text: currentState,
        position: "center",
        style: {
            text: {
                "font-size": 22,
                'font-family': "'Fira Sans', sans-serif",
                'font-weight': 500,
                'text-align' : "center",
            }
        }
      },
      subcaption: {
        text: '(Data Compared to National Trend Based Prediction)',
        position: 'center',
        style: {
            text:{
              'font-family': "'Fira Sans', sans-serif",
              'font-size' : 16,
              'fill' : '#666666',
            }
        }
      },
      yaxis: [
        {title: "Population",
        plot: [
            {
                value:  {
                            high: "HA",
                            low: "LA"
                        },
                name: "Active(Uncertainty)",
                type: "area-range",
                style: {
                    plot:{
                        "stroke-opacity": "0",
                        "fill-opacity": "0.1"
                    }
                }
            },
            {
                value: "Active(Predicted)",
                type: "line"
            },
            {
                value: "Active",
                type: "line"
            },
            {
                value:  {
                            high: "HR",
                            low: "LR"
                        },
                name: "Recovered(Uncertainty)",
                type: "area-range",
                style: {
                    plot:{
                        "stroke-opacity": "0",
                        "fill-opacity": "0.1"
                    }
                }
            },
            {
                value: "Recovered(Predicted)",
                type: "line"
            },
            {
                value: "Recovered",
                type: "line"
            },
            {
                value:  {
                            high: "HT",
                            low: "LT"
                        },
                name: "Total(Uncertainty)",
                type: "area-range",
                style: {
                    plot:{
                        "stroke-opacity": "0",
                        "fill-opacity": "0.1"
                    }
                }
            },
            {
                value: "Total(Predicted)",
                type: "line"
            },
            {
                value: "Total",
                type: "line"
            }
        ],
        }
      ]
    };
  
    
  
    var dataStore2 = new FusionCharts.DataStore();
    var dataSource2 = {
       chart: {palettecolors: "E41A1C,E41A1C,F781BF,4DAF4A,4DAF4A,FF7F00,A65628,A65628,984EA3,111111,999999",
               exportEnabled: "1",
               style: {
                  "background": {
                      "fill": "#FFFFFF",
                  },
                  "canvas": {
                      "fill": "#FFFFFF",
                  }
              }
     },
       caption: {
         text: "India",
         position: "center",
         style: {
            text: {
                "font-size": 22,
                'font-family': "'Fira Sans', sans-serif",
                'font-weight': 500,
                'text-align' : "center",
            }
        }
       },
       // subcaption: {
       //   text: currentState
       // },
       yaxis: [
        {   title: "Population",
            plot: [
                {
                    value:  {
                                high: "HA",
                                low: "LA"
                            },
                    name: "Active(Uncertainty)",
                    type: "area-range",
                    style: {
                        plot:{
                            "stroke-opacity": "0",
                            "fill-opacity": "0.1"
                        }
                    }
                },
                {
                    value: "Active(Predicted)",
                    type: "line"
                },
                {
                    value: "Active",
                    type: "line"
                },
                {
                    value:  {
                                high: "HR",
                                low: "LR"
                            },
                    name: "Recovered(Uncertainty)",
                    type: "area-range",
                    style: {
                        plot:{
                            "stroke-opacity": "0",
                            "fill-opacity": "0.1"
                        }
                    }
                },
                {
                    value: "Recovered(Predicted)",
                    type: "line"
                },
                {
                    value: "Recovered",
                    type: "line"
                },
                {
                    value:  {
                                high: "HT",
                                low: "LT"
                            },
                    name: "Total(Uncertainty)",
                    type: "area-range",
                    style: {
                        plot:{
                            "stroke-opacity": "0",
                            "fill-opacity": "0.1"
                        }
                    }
                },
                {
                    value: "Total(Predicted)",
                    type: "line"
                },
                {
                    value: "Total",
                    type: "line"
                }
            ],
        }
       ]
     };
   
    dataSource2.data = dataStore2.createDataTable(overallData["Total"], schema2);
     
     new FusionCharts({
       type: "timeseries",
       renderAt: "chart-container",
       width: "100%",
       height: L.Browser.mobile?(window.innerHeight*2/3).toString(): (window.innerHeight - 110).toString() ,
       dataSource: dataSource2
     }).render();
  
     function changeScript(value){
        document.getElementById('data').removeElement;
        element = document.createElement("script");
        element.src = "../"+value+"/data.js";
        element.type = "text/javascript";
        element.id = "data";
        document.getElementsByTagName("body")[0].appendChild(element);
        loadChartData();
     }

    function changeScenario(value){
        document.getElementById('data').removeElement;
        element = document.createElement("script");
        element.src = "../"+value+"/data.js";
        element.type = "text/javascript";
        element.id = "data";
        var btn = document.getElementById(value);
        btn.class = 'btn btn-secondary';
        document.getElementsByTagName("body")[0].appendChild(element);
        setTimeout(changeScript, 700, value );
        loadChartData();
        console.log(runID);
    }

    

  function loadChart(state){
    if(state == "India"){
        dataSource2.data = dataStore2.createDataTable(overallData["Total"], schema2);
     
        new FusionCharts({
        type: "timeseries",
        renderAt: "chart-container",
        width: "100%",
        height: L.Browser.mobile?(window.innerHeight*2/3).toString(): (window.innerHeight - 110).toString() ,
        dataSource: dataSource2
        }).render();
    }
    else{
        dataSource.caption.text = state;
        dataSource.data = dataStore.createDataTable(stateData[state], schema);
        
        new FusionCharts({
        type: "timeseries",
        renderAt: "chart-container",
        width: "100%",
        height: L.Browser.mobile?(window.innerHeight*2/3).toString(): (window.innerHeight - 110).toString() ,
        dataSource: dataSource
        }).render();
    }
    
  
  }
  

// Set location and zoom 
var mymap = L.map('mapid',{zoomControl: false, zoomSnap: 0.5}).setView([22.146, 79.088], 4.5);


// CartoDB Tile Layer with grayscale filter
var googleStreets = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        // minZoom: 2,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(mymap);


// GeoJson Layers
geojson["Total(Predicted)"] = L.geoJson(statesData, {
    style: styleTotalPred,
    onEachFeature: onEachFeature
}).addTo(mymap);

geojson["Active(Predicted)"] = L.geoJson(statesData, {
    style: styleActivePred,
    onEachFeature: onEachFeature
});

geojson["Recovered(Predicted)"] = L.geoJson(statesData, {
    style: styleRecoveredPred,
    onEachFeature: onEachFeature
});


geojson["Total"] = L.geoJson(statesData, {
    style: styleTotal,
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


// Title info control
var title = L.control();

title.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'title'); // Create a div with a class "info"
    this.update();
    return this._div;
};

title.update = function () {
    this._div.innerHTML = '<h3>India</h3>' 
                            + "Total(Predicted)<br> <b>" + (Number(totalData[0][slider.value.toString()]) + Number(totalData[0]["Recovered" + slider.value.toString()])).toString()
                            + "</b><br> Total<br> <b>"   + (totalData[0]["Confirmed_" + calculatedDate(slider.value)]===undefined?'-':totalData[0]["Confirmed_" + calculatedDate(slider.value)])
                            + "</b><br> Active(Predicted)<br> <b>" + parseInt(totalData[0][slider.value.toString()]).toString()
                            + "</b><br> Active<br> <b>" + (totalData[0]["Confirmed_" + calculatedDate(slider.value)]===undefined?'-':(totalData[0]["Confirmed_" + calculatedDate(slider.value)] 
                                                        - totalData[0]["Recovered_" + calculatedDate(slider.value)] 
                                                        - totalData[0]["Deceased_" + calculatedDate(slider.value)] ).toString() )
                            + ((recoveredAvailable=='y' || recoveredAvailable=='Y')?"</b><br> Recovered(Predicted)<br> <b>" + parseInt(totalData[0]["Recovered" + slider.value.toString()]).toString():'')
                            + "</b><br> Recovered<br> <b>" + (totalData[0]["Recovered_" + calculatedDate(slider.value)]===undefined?'-':Number(totalData[0]["Recovered_" + calculatedDate(slider.value)])+Number(totalData[0]["Deceased_" + calculatedDate(slider.value)]));
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
        +'<br />' + 'Total(Predicted):<br /> ' + '<b>' + ((Number(props[slider.value.toString()])+Number(props["Recovered" + slider.value.toString()])).toString()=="NaN"?'-':(Number(props[slider.value.toString()])+Number(props["Recovered" + slider.value.toString()])).toString() )+ '</b>'
        +'<br />' + 'Active(Predicted):<br /> ' + '<b>' + (parseInt(props[slider.value.toString()]).toString()=="NaN"?'-':parseInt(props[slider.value.toString()]).toString() ) +'</b>'
        + ((recoveredAvailable=='y' || recoveredAvailable=='Y')?'<br />' + 'Recovered(Predicted)<br /> ' + '<b>' + (parseInt(props["Recovered" + slider.value.toString()]).toString()=="NaN"?'-':parseInt(props["Recovered" + slider.value.toString()]).toString() ) +'</b>':'')
        +'<br />' + 'Total<br /> ' + '<b>' + (props["Confirmed_" + calculatedDate(slider.value)]===undefined?'-':props["Confirmed_" + calculatedDate(slider.value)]) +'</b>'
        +'<br />' + 'Active<br /> ' + '<b>' + (props["Confirmed_" + calculatedDate(slider.value)]===undefined?'-':
                                                    (props["Confirmed_" + calculatedDate(slider.value)] 
                                                  - props["Recovered_" + calculatedDate(slider.value)] 
                                                  - props["Deceased_" + calculatedDate(slider.value)]).toString() ) +'</b>'
        +'<br />' + 'Recovered<br /> ' + '<b>' + (props["Recovered_" + calculatedDate(slider.value)]===undefined?'-':Number(props["Recovered_" + calculatedDate(slider.value)])+Number(props["Deceased_" + calculatedDate(slider.value)])) +'</b>'
        : (L.Browser.mobile?'Touch on<br />a state':'Hover over<br />a state'));
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

    if (currentBaseLayer == "Active(Predicted)"){
        grades = legendGrades((slider.value).toString());
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, (slider.value).toString()) + '"></i> ' +
                grades[i].toString() + (grades[i + 1] ? '&ndash;' + grades[i + 1].toString() + '<br>' : '+');
        }
    }

    else if (currentBaseLayer == "Total(Predicted)"){
        grades = legendGradesTotal((slider.value).toString(), "Recovered" + (slider.value).toString());
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColorTotal(grades[i] + 1, (slider.value).toString(), "Recovered" + (slider.value).toString()) + '"></i> ' +
                grades[i].toString() + (grades[i + 1] ? '&ndash;' + grades[i + 1].toString() + '<br>' : '+');
        }
    }


    else if(currentBaseLayer == "Recovered(Predicted)"){
        grades = legendGrades("Recovered" + (slider.value).toString());
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, "Recovered" + (slider.value).toString()) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    }

    else if(currentBaseLayer == "Total" || currentBaseLayer == "Active" || currentBaseLayer=='Recovered' ){
        grades = legendGrades("Confirmed_" + calculatedDate(slider.value));
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, "Confirmed_" + calculatedDate(slider.value)) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    }

    else{
        grades = legendGradesTotal((slider.value).toString(), "Recovered" + (slider.value).toString());
        labels = [];

        this._div.innerHTML = "";
        for (var i = 0; i < grades.length; i++) {
            this._div.innerHTML +=
                '<i style="background:' + getColorTotal(grades[i] + 1, (slider.value).toString(), "Recovered" + (slider.value).toString()) + '"></i> ' +
                grades[i].toString() + (grades[i + 1] ? '&ndash;' + grades[i + 1].toString() + '<br>' : '+');
        }
    }
    
}


// Add legend to map
legend.addTo(mymap);



var baseMaps = {
    "Total(Predicted)": geojson["Total(Predicted)"],
    "Active(Predicted)": geojson["Active(Predicted)"],
    "Recovered(Predicted)":geojson["Recovered(Predicted)"],
    "Total": geojson["Total"],
    "Active": geojson["Active"],
    "Recovered": geojson["Recovered"],
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
  geojson["Total(Predicted)"].resetStyle();
  geojson["Active(Predicted)"].resetStyle();
  geojson["Recovered(Predicted)"].resetStyle();
  geojson["Total"].resetStyle();
  geojson["Active"].resetStyle();
  geojson["Recovered"].resetStyle(); 
  legend.update(currentBaseLayer);
}



mymap.on("baselayerchange", function(e){
    currentBaseLayer = e.name;
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
        zoomHomeText: '<small><i class="material-icons">home</i></small>',
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
        this._map.setView([22.146, 79.088], 4.5);
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

function myFunction() {
    var dots = document.getElementById("dots");
    var moreText = document.getElementById("more");
    var btnText = document.getElementById("myBtn");

    if (dots.style.display === "none") {
    dots.style.display = "block";
    btnText.innerHTML = "Read more"; 
    moreText.style.display = "none";
    } 
    else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less"; 
    moreText.style.display = "block";
    }
}