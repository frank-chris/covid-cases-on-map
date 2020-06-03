
var currentDistrict = "Bengaluru Rural";

var stateDropDown = document.getElementById("myselect");
var stateDropDown2 = document.getElementById("myselect2");
var stateDropDown3 = document.getElementById("myselect3");
var district;
for (district of Object.keys(data)){
    stateDropDown.innerHTML += "<option value='"+ district +"'>" + district + "</option>";
    stateDropDown2.innerHTML += "<option value='"+ district +"'>" + district + "</option>";
    stateDropDown3.innerHTML += "<option value='"+ district +"'>" + district + "</option>";
}

function getSelected(){
    var selectedSource = document.getElementById("myselect").value;
    loadChart(selectedSource);
}

function getSelected2(){
  var selectedSource = document.getElementById("myselect2").value;
  loadChart2(selectedSource);
}

function getSelected3(){
  var selectedSource = document.getElementById("myselect3").value;
  loadChart3(selectedSource);
}

let schema = [{
    "name": "Time",
    "type": "date",
    "format": "%Y-%m-%d"
  }, {
    "name": "Type",
    "type": "string"
  }, {
    "name": "Value",
    "type": "number"
  }]
  
  
 var dataStore = new FusionCharts.DataStore();
 var dataSource = {
    chart: {palettecolors: "E41A1C,FF7F00,984EA3,4DAF4A,A65628,F781BF,111111,999999,0069D9",
            exportEnabled: "1",
            
  },
    caption: {
      text: currentDistrict
    },
    // subcaption: {
    //   text: currentDistrict
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

  dataSource.data = dataStore.createDataTable(data[currentDistrict], schema);
  
  new FusionCharts({
    type: "timeseries",
    renderAt: "chart-container",
    width: "100%",
    height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
    dataSource: dataSource
  }).render();

  function loadChart(district){
    if(district){
        district = district;
    }
    else{
        district = "Total";
    }
    dataSource.caption.text = district;
    dataSource.data = dataStore.createDataTable(data[district], schema);
    
    new FusionCharts({
      type: "timeseries",
      renderAt: "chart-container",
      width: "100%",
      height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
      dataSource: dataSource
    }).render();
  
  }

  var dataStore2 = new FusionCharts.DataStore();
 var dataSource2 = {
    chart: {palettecolors: "E41A1C,FF7F00,984EA3,4DAF4A,A65628,F781BF,111111,999999,0069D9",
            exportEnabled: "1",
            
  },
    caption: {
      text: currentDistrict
    },
    // subcaption: {
    //   text: currentDistrict
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
  console.log(diagnosticsData);
  dataSource2.data = dataStore2.createDataTable(diagnosticsData[currentDistrict], schema);

  new FusionCharts({
    type: "timeseries",
    renderAt: "diagnostics",
    width: "100%",
    height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
    dataSource: dataSource2
  }).render();


  function loadChart2(district){
    if(district){
        district = district;
    }
    else{
        district = "Total";
    }
    dataSource2.caption.text = district;
    dataSource2.data = dataStore2.createDataTable(diagnosticsData[district], schema);
    
    new FusionCharts({
      type: "timeseries",
      renderAt: "diagnostics",
      width: "100%",
      height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
      dataSource: dataSource2
    }).render();
  
  }

  var dataStore3 = new FusionCharts.DataStore();
 var dataSource3 = {
    chart: {palettecolors: "E41A1C,FF7F00,984EA3,4DAF4A,A65628,F781BF,111111,999999,0069D9",
            exportEnabled: "1",
            
  },
    caption: {
      text: currentDistrict
    },
    // subcaption: {
    //   text: currentDistrict
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

  dataSource3.data = dataStore3.createDataTable(dailyData[currentDistrict], schema);
  
  new FusionCharts({
    type: "timeseries",
    renderAt: "daily-numbers",
    width: "100%",
    height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
    dataSource: dataSource3
  }).render();


  function loadChart3(district){
    if(district){
        district = district;
    }
    else{
        district = "Total";
    }
    dataSource3.caption.text = district;
    dataSource3.data = dataStore3.createDataTable(dailyData[district], schema);
    
    new FusionCharts({
      type: "timeseries",
      renderAt: "daily-numbers",
      width: "100%",
      height: L.Browser.mobile?(window.innerHeight/2).toString(): (window.innerHeight - 140).toString() ,
      dataSource: dataSource3
    }).render();
  
  }