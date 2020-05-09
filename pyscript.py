# Script to combine GeoJSON data of Indian States 
# with CSV data of Covid cases and save as a JavaScript file, 
# which will be used in by the webpage

import json
import pandas as pd

def get_ST_NM(state):
    '''
    Returns ST_NM (state name) of the argument(which is a feature)
    Used in sorting the list of features in the GeoJSON file
    based on ST_NM(state_name) of the feature.     
    '''
    return state["properties"]["ST_NM"]

# Read state_wise_daily.csv 
state_wise_daily = pd.read_csv('state_wise_daily.csv')

# Combine the columns Status and Date to form a column named Daily_Status
state_wise_daily['Daily_Status'] = state_wise_daily["Status"] + "-" + state_wise_daily["Date"]

# Delete the columns Status and Date
del state_wise_daily['Date']
del state_wise_daily['Status']

# Replace all hyphens to underscores in the column Daily_Status
for i in range(len(state_wise_daily['Daily_Status'])):
    state_wise_daily['Daily_Status'][i] = state_wise_daily['Daily_Status'][i].replace('-', '_')

# Combine 'Dadra and Nagar Haveli(DN)' and 'Daman and Diu(DD)' to form a single column DD
state_wise_daily["DD"] = state_wise_daily["DD"] + state_wise_daily["DN"]

# Delete DN(Dadra and Nagar Haveli)
del state_wise_daily["DN"]

# A list of elements from Daily_Status
date_status_list = state_wise_daily["Daily_Status"]

# Set the column Daily_Status as the index of the DataFrame 
state_wise_daily.set_index("Daily_Status", inplace = True) 

# Save the total data of all states(TT) in another dictionary,
# since it will not be combined with GeoJSON data
total_properties_list = [{"name":"TT"}]
for date_status in date_status_list:
    total_properties_list[0][date_status] = str(state_wise_daily.loc[date_status, "TT"])

# Delete the column corresponding to total data of all states(TT) 
del state_wise_daily["TT"]

# List of empty dicts which will be filled with the data from CSV file 
# and combined with the GeoJSON data
state_wise_properties_list = [{} for i in range(36)]

# Fill the list of dicts with data read from the CSV file
for i, column in enumerate(state_wise_daily):
    state_wise_properties_list[i]["name"] = column 
    for date_status in date_status_list:
        state_wise_properties_list[i][date_status] = str(state_wise_daily.loc[date_status, column])

# Open GeoJSON file
f = open('States_GeoJSON.json') 
loaded_json = json.load(f)

# Sort the list of features based on ST_NM, 
# which is state name like 'Arunachal Pradesh', 'Andhra Pradesh' etc. 
loaded_json["features"].sort(key=get_ST_NM)


# Copy data from the list of dicts to the loaded_json dict
for state_number in range(36):
    loaded_json["features"][state_number]["properties"] = state_wise_properties_list[state_number]
    
# Convert loaded_json dict to str
states_data = str(loaded_json) 

# Save the data in a JavaScript file
with open("data.js", 'w') as file:
    file.write("var statesData = " + states_data + ";")

print("\nData written into file named data.js")

f.close()

