# Visualization of COVID-19 cases in India

A chloropleth map built using Leaflet. 

## Instructions 

#### 1. Clone this repository    
`git clone https://github.com/frank-chris/covid-cases-on-map.git`

#### 2. Open the index.html file using a browser

## Implementation Details   

1. GeoJSON data for the states and union terroritories of India was downloaded from [here](https://github.com/datameet/maps)
   (Downloaded the files and used [mapshaper](https://mapshaper.org/) to convert to GeoJSON)

2. CSV data for state-wise daily Covid-19 cases in India was downloaded from [here](https://api.covid19india.org/csv/latest/state_wise_daily.csv)

3. The python script named pyscript.py was used to combine the GeoJSON data and CSV data and save it in a JavaScript file. 

4. This file is then used by the webpage for displaying the chloropleth map using [Leaflet.js](https://leafletjs.com/examples/choropleth/)

## Issues
The colors of the features on the GeoJSON layer do not change simultaneously with dragging the time-slider. It changes to the correct color on hovering above the feature.


## References

1. [Interactive Choropleth Map using Leaflet.js](https://leafletjs.com/examples/choropleth/)

