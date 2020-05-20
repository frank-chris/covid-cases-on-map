# Script to combine GeoJSON data of Indian States 
# with CSV data of Covid cases and save as a JavaScript file, 
# which will be used in by the webpage

import pandas as pd
import numpy as np
import json
import os
import sys

def modify(value):
    return "Nucleation" + str(value)

def modify_ratios(value):
    return "Ratios" + str(value)

def modify_recovered(value):
    return "Recovered" + str(value)

def modify_daily(value):
    return "DN" + str(value)

def replace_hyphen(value):
    return str(value).replace('-','_')

def cumulative(df):
    for column in df.columns:
        df[column] = df[column].cumsum()

    return df

def daily(df):
    for column in df.columns:
        temp = df[column].sub(df[column].shift())
        temp.iloc[0] = df[column].iloc[0]
        df[column] = temp
    return df

def get_ST_NM(state):
    '''
    Returns ST_NM (state name) of the argument(which is a feature)
    Used in sorting the list of features in the GeoJSON file
    based on ST_NM(state_name) of the feature.     
    '''
    return state["properties"]["ST_NM"]

def statename(statecode):
    '''
    Returns state name from state code   
    '''
    if statecode == "AP":
        return "Andhra Pradesh"
    elif statecode == "AN":
        return "Andaman and Nicobar Islands"
    elif statecode == "AR":
        return "Arunachal Pradesh"
    elif statecode == "AS":
        return "Assam"
    elif statecode == "BR":
        return "Bihar"
    elif statecode == "CH":
        return "Chandigarh"
    elif statecode == "CT":
        return "Chhattisgarh"
    elif statecode == "DD":
        return "Dadra and Nagar Haveli and Daman and Diu"
    elif statecode == "DL":
        return "Delhi"
    elif statecode == "GA":
        return "Goa"
    elif statecode == "GJ":
        return "Gujarat"
    elif statecode == "HR":
        return "Haryana"
    elif statecode == "HP":
        return "Himachal Pradesh"
    elif statecode == "JH":
        return "Jharkhand"
    elif statecode == "JK":
        return "Jammu and Kashmir"
    elif statecode == "KA":
        return "Karnataka"
    elif statecode == "KL":
        return "Kerala"
    elif statecode == "LA":
        return "Ladakh"
    elif statecode == "LD":
        return "Lakshadweep"
    elif statecode == "MP":
        return "Madhya Pradesh"
    elif statecode == "MH":
        return "Maharashtra"
    elif statecode == "MN":
        return "Manipur"
    elif statecode == "ML":
        return "Meghalaya"
    elif statecode == "MZ":
        return "Mizoram"
    elif statecode == "NL":
        return "Nagaland"
    elif statecode == "OR":
        return "Odisha"
    elif statecode == "PB":
        return "Punjab"
    elif statecode == "PY":
        return "Puducherry"
    elif statecode == "RJ":
        return "Rajasthan"
    elif statecode == "SK":
        return "Sikkim"
    elif statecode == "TN":
        return "Tamil Nadu"
    elif statecode == "TG":
        return "Telengana"
    elif statecode == "TR":
        return "Tripura"
    elif statecode == "UP":
        return "Uttar Pradesh"
    elif statecode == "UT":
        return "Uttarakhand"
    elif statecode == "WB":
        return "West Bengal"
    else:
        return statecode

run_id = str(sys.argv[1])

start_date = str(sys.argv[2])

files = os.listdir(run_id+'/')

if 'CovidRecovered.data' in files:
    covid_recovered_availability = 'y'
    print("\nCovidRecovered.data found.\n")
else:
    covid_recovered_availability = 'n'
    print("\nCovidRecovered.data not found, and hence will not be used.\n")

# Read population data 
predicted_state_wise = pd.read_csv(run_id + "/" + "CovidPopulation.data", delimiter=" ", header=1)

no_of_days = len(predicted_state_wise.index)-1

# Read nucleation data
nucleation = pd.read_csv(run_id + "/" + "CovidNucleation.data", delimiter=" ", header=1)

predicted_state_wise["Day"] = predicted_state_wise["Day"].round(0).astype(int)

nucleation["Day"] = nucleation["Day"].round(0).astype(int)

nucleation["Day"] = nucleation["Day"].apply(modify)

daily_predicted = predicted_state_wise.copy()
daily_predicted["Day"] = daily_predicted["Day"].apply(modify_daily)
daily_predicted.set_index("Day", inplace = True) 
daily_predicted = daily(daily_predicted)

nucleation.set_index("Day", inplace = True) 
predicted_state_wise.set_index("Day", inplace = True) 
frames = [predicted_state_wise, daily_predicted, nucleation]

if covid_recovered_availability == 'y' or covid_recovered_availability == 'Y':
    # Read CovidRecovered.data
    recovered = pd.read_csv(run_id + "/" + "CovidRecovered.data", delimiter=" ", header=1)
    recovered["Day"] = recovered["Day"].round(0).astype(int)
    recovered["Day"] = recovered["Day"].apply(modify_recovered)
    daily_recovered = recovered.copy()
    daily_recovered["Day"] = daily_recovered["Day"].apply(modify_daily)
    daily_recovered.set_index("Day", inplace = True) 
    recovered.set_index("Day", inplace = True) 
    recovered = cumulative(recovered)
    frames.append(daily_recovered)
    frames.append(recovered)

predicted_state_wise = pd.concat(frames)

# List of day numbers
day_list = list(predicted_state_wise.index)



# States for which data doesn't exist in predictions
predicted_state_wise["DD"] = np.nan
predicted_state_wise["ML"] = np.nan
predicted_state_wise["MZ"] = np.nan
predicted_state_wise["NL"] = np.nan

# Rename all columns with actual state names
for column in predicted_state_wise:
    predicted_state_wise.rename(columns={column : statename(column)}, inplace=True)


# Sort columns based on column name
predicted_state_wise.sort_index(axis=1, inplace= True)


# Read state_wise_daily.csv 
state_wise_daily = pd.read_csv('state_wise_daily.csv')

# List of dates in actual data
dates_actual = [date.replace('-', '_') for date in state_wise_daily["Date"].unique()]

# Combine the columns Status and Date to form a column named Daily_Status
state_wise_daily['Daily_Status'] = state_wise_daily["Status"] + "-" + state_wise_daily["Date"]

# Delete the columns Status and Date
del state_wise_daily['Date']
del state_wise_daily['Status']

# Replace all hyphens to underscores in the column Daily_Status
state_wise_daily['Daily_Status'] = state_wise_daily['Daily_Status'].apply(replace_hyphen)


# Combine 'Dadra and Nagar Haveli(DN)' and 'Daman and Diu(DD)' to form a single column DD
state_wise_daily["DD"] = state_wise_daily["DD"] + state_wise_daily["DN"]

# Delete DN(Dadra and Nagar Haveli)
del state_wise_daily["DN"]

# Rename column TT as Total
state_wise_daily.rename(columns={"TT" : "Total"}, inplace=True)

# Non-cumulative state-wise daily data
non_cumulative = state_wise_daily.copy()

non_cumulative["Daily_Status"] = non_cumulative["Daily_Status"].apply(modify_ratios)

# A list of elements from Daily_Status
date_status_list = list(state_wise_daily["Daily_Status"]) + list(non_cumulative["Daily_Status"])


# Set the column Daily_Status as the index of the DataFrame 
state_wise_daily.set_index("Daily_Status", inplace = True) 

non_cumulative.set_index("Daily_Status", inplace = True) 

# Make state_wise_daily data cumulative
for column in state_wise_daily:
    for i in range(1,len(dates_actual)):
        state_wise_daily.loc["Confirmed_"+dates_actual[i], column] += state_wise_daily.loc["Confirmed_"+dates_actual[i-1], column]

for column in state_wise_daily:
    for i in range(1,len(dates_actual)):
        state_wise_daily.loc["Recovered_"+dates_actual[i], column] += state_wise_daily.loc["Recovered_"+dates_actual[i-1], column]

for column in state_wise_daily:
    for i in range(1,len(dates_actual)):
        state_wise_daily.loc["Deceased_"+dates_actual[i], column] += state_wise_daily.loc["Deceased_"+dates_actual[i-1], column]

doubling_rate = state_wise_daily.copy()
doubling_rate = doubling_rate[ pd.Series([x.startswith("Confirmed") for x in doubling_rate.index ], index=list(doubling_rate.index)) ]

state_wise_daily = pd.concat([state_wise_daily, non_cumulative])

# Rename all columns with actual state names in state_wise_daily
for column in state_wise_daily:
    state_wise_daily.rename(columns={column : statename(column)}, inplace=True)
    doubling_rate.rename(columns={column : statename(column)}, inplace=True)

# Sort columns based on column name
state_wise_daily.sort_index(axis=1, inplace= True)
doubling_rate.sort_index(axis=1, inplace= True)

rates = pd.DataFrame(index=doubling_rate.index, columns = doubling_rate.columns)
rates.fillna(0, inplace=True)

for column in rates.columns:
    for index in rates.index:
        delta = []
        for i in doubling_rate[column][:index]:
            delta.append(abs(doubling_rate.loc[index, column]/2 - i))
        minimum = min(delta)
        rates.loc[index, column] = len(delta) - 1 - delta.index(minimum)

# Save the total data of all states(Total) in another dictionary,
# since it will not be combined with GeoJSON data
total_properties_list = [{"name":"Total"}]
for day_number in day_list:
    total_properties_list[0][str(day_number)] = str(predicted_state_wise.loc[day_number, "Total"])
for date_status in date_status_list:
    total_properties_list[0][date_status] = str(state_wise_daily.loc[date_status, "Total"])
for index in rates.index:
    total_properties_list[0]["DR" + index] = str(rates.loc[index, "Total"])

# Delete the column corresponding to total data of all states(TT) 
del state_wise_daily["Total"]

del rates["Total"]

# Delete the column corresponding to total data of all states 
del predicted_state_wise["Total"]

# List of empty dicts which will be filled with the data from CSV file 
# and combined with the GeoJSON data
state_wise_properties_list = [{} for i in range(36)]

# Fill the list of dicts with data read from the CSV file
for i, column in enumerate(predicted_state_wise):
    state_wise_properties_list[i]["name"] = column 
    for day_number in day_list:
        state_wise_properties_list[i][str(day_number)] = str(predicted_state_wise.loc[day_number, column])
    for date_status in date_status_list:
        state_wise_properties_list[i][date_status] = str(state_wise_daily.loc[date_status, column])
    for index in rates.index:
        state_wise_properties_list[i]["DR" + index] = str(rates.loc[index, column])

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
with open(run_id + "/data.js", 'w') as file:
    file.write("var statesData = " + states_data + ";"+"var totalData = " + str(total_properties_list) + ";"+"var runID = '" + str(run_id) +"';"+"var recoveredAvailable = '" + str(covid_recovered_availability) +"';"+"var noOfDays = '" + str(no_of_days) +"';"+"var SD = '" + str(start_date) +"';")

print("\nData written into " + run_id + "/data.js")

f.close()

