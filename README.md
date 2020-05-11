# Visualization of COVID-19 cases in India

A chloropleth map built using Leaflet. 

## Instructions 

#### 1. Clone this repository    
`git clone https://github.com/frank-chris/covid-cases-on-map.git`

#### 2. Open the index.html file using a browser

## Implementation Details - Attempt 2   

1. GeoJSON data for the states and union terroritories of India was downloaded from [here](https://github.com/datameet/maps)
   (Downloaded the files and used [mapshaper](https://mapshaper.org/) to convert to GeoJSON)

2. CSV data for state-wise daily Covid-19 cases in India was downloaded from [here](https://api.covid19india.org/csv/latest/state_wise_daily.csv)

3. The python script named pyscript.py was used to combine the GeoJSON data(States_GeoJSON.json), .data file(CovidPopulation_May2_run3.data) and CSV data(state_wise_daily.csv) and save it in a JavaScript file(predicted_data.js)

4. This JavaScript file(predicted_data.js) is then used by the webpage for displaying the chloropleth map using [Leaflet.js](https://leafletjs.com/examples/choropleth/)

5. The JavaScript code written is in **script.js** and custom CSS is in **style.css**


## Implementation Details - Attempt 1   

1. GeoJSON data for the states and union terroritories of India was downloaded from [here](https://github.com/datameet/maps)
   (Downloaded the files and used [mapshaper](https://mapshaper.org/) to convert to GeoJSON)

2. CSV data for state-wise daily Covid-19 cases in India was downloaded from [here](https://api.covid19india.org/csv/latest/state_wise_daily.csv)

3. The python script named pyscript.py was used to combine the GeoJSON data and CSV data and save it in a JavaScript file. 

4. This file is then used by the webpage for displaying the chloropleth map using [Leaflet.js](https://leafletjs.com/examples/choropleth/)

## Issues

### Currently working on

1. JavaScript code in **predicted_data.js** needs refactoring. 

### Fixed   
1. The colors of the features on the GeoJSON layer do not change simultaneously with dragging the time-slider. It changes to the correct color on hovering above the feature. I am currently trying to fix this. **Was fixed by using Leaflet 1.6.0 instead of Leaflet 0.7.x** 

2. I have used state and union territory codes instead of names(KL instead of Kerala), I'll change it to names soon. **Fixed**

3. Use Google Maps **Done**

4. Changed layout and zoom. 

5. Colorbar formatting and choice of colors. **Changed to a scheme from green to orange to red. Formatting of color bar is fine on my browsers(Firefox, Chrome and Edge).** 

6. Add radio buttons to choose among predicted, confirmed, recovered and deceased. **Added**

7. Start date is March 23 **Done**

8. Use preliminary model results **Done**

9. The color axis needs to change with underlying data. Currently March 14 is all yellow, the difference among states is not visible. **Fixed, but might need tweaks**


## References

1. [Interactive Choropleth Map using Leaflet.js](https://leafletjs.com/examples/choropleth/)
2. ['Home' button Leaflet map](https://gis.stackexchange.com/questions/127286/home-button-leaflet-map)

