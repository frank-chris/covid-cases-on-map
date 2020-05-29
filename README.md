# Visualization of COVID-19 cases in India

A chloropleth map built using Leaflet. 

## Usage

1. Clone the repo
2. Create a folder with a name unique to the run     
3. Add .data files to the created folder   
4. Run 'pyscript.py' as follows:  

    `python pyscript.py run_folder_name MM/DD/YYYY`

     for example, if the folder name is May30_run1 and you want to set March 23, 2020 as the start date, use   

     `python pyscript.py May30_run1 03/23/2020`   

5. Now copy the index.html file from another such folder(e.g. May21_sd=0.5) and paste in the newly created folder.
6. Add the link to **run_folder_name/index.html** to the table in index.html file in the repo.

## Requirements  

1. Following python packages:   
    pandas    0.24.2     
    numpy     1.15.0   
    json      2.0.9   
    os   
    sys   
    sklearn   0.22.2.post1     
    requests  2.18.4  (only for update_state_wise_daily.py)    
    git       3.1.2   (only for update_state_wise_daily.py)  
    
    
## References

1. [Interactive Choropleth Map using Leaflet.js](https://leafletjs.com/examples/choropleth/)
2. ['Home' button Leaflet map](https://gis.stackexchange.com/questions/127286/home-button-leaflet-map)

