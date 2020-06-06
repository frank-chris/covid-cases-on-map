# Script to combine GeoJSON data of Indian States 
# with CSV data of Covid cases and save as a JavaScript file, 
# which will be used in by the webpage

import pandas as pd
import numpy as np
import json
import os
import sys
from sklearn.linear_model import LinearRegression
import math

def modify(value):
    return "Nucleation" + str(value)

def modify_ratios(value):
    return "Ratios" + str(value)

def modify_recovered(value):
    return "Recovered" + str(value)

def modify_deceased(value):
    return "Deceased" + str(value)

def modify_daily(value):
    return "DN" + str(value)

def modify_rmse(value):
    return 'RMSE' + str(value)

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

if 'CovidDeaths.data' in files:
    covid_deaths_availability = 'y'
    print("\nCovidDeaths.data found.\n")
else:
    covid_deaths_availability = 'n'
    print("\nCovidDeaths.data not found, and hence will not be used.\n")


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

# Read state_wise_daily.csv 
state_wise_daily = pd.read_csv('state_wise_daily.csv')

confirmed = state_wise_daily.copy()
confirmed = confirmed[ pd.Series([x.startswith("Confirmed") for x in confirmed['Status'] ], index=list(confirmed.index)) ]
confirmed = confirmed.iloc[9:]
confirmed["index"]=[i for i in range(len(confirmed.index))]
confirmed.set_index("index", inplace = True)
confirmed["DD"] = confirmed["DD"] + confirmed["DN"]
del confirmed["DN"]
del confirmed['Date']
del confirmed['Status']
del confirmed['UN']
confirmed.rename(columns={'TT' : 'Total'}, inplace=True)

recovered_df = state_wise_daily.copy()
recovered_df = recovered_df[ pd.Series([x.startswith("Recovered") for x in recovered_df['Status'] ], index=list(recovered_df.index)) ]
recovered_df = recovered_df.iloc[9:]
recovered_df["index"]=[i for i in range(len(recovered_df.index))]
recovered_df.set_index("index", inplace = True)
recovered_df["DD"] = recovered_df["DD"] + recovered_df["DN"]
del recovered_df["DN"]
del recovered_df['Date']
del recovered_df['Status']
del recovered_df['UN']
recovered_df.rename(columns={'TT' : 'Total'}, inplace=True)

deceased_df = state_wise_daily.copy()
deceased_df = deceased_df[ pd.Series([x.startswith("Deceased") for x in deceased_df['Status'] ], index=list(deceased_df.index)) ]
deceased_df = deceased_df.iloc[9:]
deceased_df["index"]=[i for i in range(len(deceased_df.index))]
deceased_df.set_index("index", inplace = True)
deceased_df["DD"] = deceased_df["DD"] + deceased_df["DN"]
del deceased_df["DN"]
del deceased_df['Date']
del deceased_df['Status']
del deceased_df['UN']
deceased_df.rename(columns={'TT' : 'Total'}, inplace=True)

active_df = confirmed - recovered_df - deceased_df
active_rmse = daily_predicted.copy()
active_rmse = active_rmse.iloc[:len(active_df.index)]
active_rmse["index"]=[i for i in range(len(active_rmse.index))]
active_rmse.set_index("index", inplace = True)


for state in active_rmse.columns:
    for index in active_rmse.index:
       active_rmse.loc[index, state] = (active_rmse.loc[index, state] - active_df.loc[index, state])*(active_rmse.loc[index, state] - active_df.loc[index, state])

active_rmse = cumulative(active_rmse)

for state in active_rmse.columns:
    for index in active_rmse.index:
       active_rmse.loc[index, state] = active_rmse.loc[index, state]/(index+1)

active_rmse['index'] = [i for i in range(len(active_rmse.index))]
active_rmse['index'] = active_rmse['index'].apply(modify_rmse)
active_rmse.set_index("index", inplace = True)

active_rmse = active_rmse.transform('sqrt')


frames.append(active_rmse)

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
    recovered_rmse = daily_recovered.copy()
    recovered_rmse = recovered_rmse.iloc[:len(recovered_df.index)]
    recovered_rmse["index"]=[i for i in range(len(recovered_rmse.index))]
    recovered_rmse.set_index("index", inplace = True)

    for state in recovered_rmse.columns:
        for index in recovered_rmse.index:
            recovered_rmse.loc[index, state] = (recovered_rmse.loc[index, state] - recovered_df.loc[index, state])*(recovered_rmse.loc[index, state] - recovered_df.loc[index, state])

    recovered_rmse = cumulative(recovered_rmse)

    for state in recovered_rmse.columns:
        for index in recovered_rmse.index:
            recovered_rmse.loc[index, state] = recovered_rmse.loc[index, state]/(index+1)

    recovered_rmse['index'] = [i for i in range(len(recovered_rmse.index))]
    recovered_rmse['index'] = recovered_rmse['index'].apply(modify_recovered)
    recovered_rmse['index'] = recovered_rmse['index'].apply(modify_rmse)
    recovered_rmse.set_index("index", inplace = True)
    recovered_rmse = recovered_rmse.transform('sqrt')

    frames.append(recovered_rmse)
    frames.append(daily_recovered)
    frames.append(recovered)

if covid_deaths_availability == 'y' or covid_deaths_availability == 'Y':
    # Read CovidDeaths.data
    deaths = pd.read_csv(run_id + "/" + "CovidDeaths.data", delimiter=" ", header=1)
    deaths["Day"] = deaths["Day"].round(0).astype(int)
    deaths["Day"] = deaths["Day"].apply(modify_deceased)
    daily_deaths = deaths.copy()
    daily_deaths["Day"] = daily_deaths["Day"].apply(modify_daily)
    daily_deaths.set_index("Day", inplace = True) 
    deaths.set_index("Day", inplace = True) 
    deaths = cumulative(deaths)
    deceased_rmse = daily_deaths.copy()
    deceased_rmse = deceased_rmse.iloc[:len(deceased_df.index)]
    deceased_rmse["index"]=[i for i in range(len(deceased_rmse.index))]
    deceased_rmse.set_index("index", inplace = True)

    for state in deceased_rmse.columns:
        for index in deceased_rmse.index:
            deceased_rmse.loc[index, state] = (deceased_rmse.loc[index, state] - deceased_df.loc[index, state])*(deceased_rmse.loc[index, state] - deceased_df.loc[index, state])

    deceased_rmse = cumulative(deceased_rmse)

    for state in deceased_rmse.columns:
        for index in deceased_rmse.index:
            deceased_rmse.loc[index, state] = deceased_rmse.loc[index, state]/(index+1)

    deceased_rmse['index'] = [i for i in range(len(deceased_rmse.index))]
    deceased_rmse['index'] = deceased_rmse['index'].apply(modify_deceased)
    deceased_rmse['index'] = deceased_rmse['index'].apply(modify_rmse)
    deceased_rmse.set_index("index", inplace = True)
    deceased_rmse = deceased_rmse.transform('sqrt')

    frames.append(deceased_rmse)
    frames.append(daily_deaths)
    frames.append(deaths)

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


# List of dates in actual data
dates_actual = [date.replace('-', '_') for date in state_wise_daily["Date"].unique()]

# Combine the columns Status and Date to form a column named Daily_Status
state_wise_daily['Daily_Status'] = state_wise_daily["Status"] + "-" + state_wise_daily["Date"]

# Delete the columns Status and Date
del state_wise_daily['Date']
del state_wise_daily['Status']
del state_wise_daily['UN']
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

ratio_3_numerator = state_wise_daily[ pd.Series([x.startswith("Deceased") for x in state_wise_daily['Daily_Status'] ], index=list(state_wise_daily.index)) ].copy()
ratio_4_numerator = state_wise_daily[ pd.Series([x.startswith("Recovered") for x in state_wise_daily['Daily_Status'] ], index=list(state_wise_daily.index)) ].copy()

dates_for_index = [ x.replace("Deceased_", "") for x in list(ratio_3_numerator["Daily_Status"])]
temp_1 = state_wise_daily[ pd.Series([x.startswith("Deceased") for x in state_wise_daily['Daily_Status'] ], index=list(state_wise_daily.index)) ].copy()
temp_2 = state_wise_daily[ pd.Series([x.startswith("Confirmed") for x in state_wise_daily['Daily_Status'] ], index=list(state_wise_daily.index)) ].copy()
temp_3 = state_wise_daily[ pd.Series([x.startswith("Recovered") for x in state_wise_daily['Daily_Status'] ], index=list(state_wise_daily.index)) ].copy()
del ratio_3_numerator['Daily_Status']
del ratio_4_numerator['Daily_Status']
del temp_1['Daily_Status']
del temp_2['Daily_Status']
del temp_3['Daily_Status']

ratio_3_numerator['index'] = [i for i in range(len(ratio_3_numerator.index))]
ratio_3_numerator.set_index("index", inplace = True)
ratio_4_numerator['index'] = [i for i in range(len(ratio_4_numerator.index))]
ratio_4_numerator.set_index("index", inplace = True)
temp_1['index'] = [i for i in range(len(temp_1.index))]
temp_1.set_index("index", inplace = True)
temp_2['index'] = [i for i in range(len(temp_2.index))]
temp_2.set_index("index", inplace = True)
temp_3['index'] = [i for i in range(len(temp_3.index))]
temp_3.set_index("index", inplace = True)

temp_1 = cumulative(temp_1)
temp_2 = cumulative(temp_2)
temp_3 = cumulative(temp_3)

ratio_3_denominator = temp_2 - temp_1 - temp_3

ratio_3 = ratio_3_numerator/ratio_3_denominator
ratio_4 = ratio_4_numerator/ratio_3_denominator

ratio_3.replace([np.inf, -np.inf], np.nan, inplace=True)
ratio_4.replace([np.inf, -np.inf], np.nan, inplace=True)
ratio_3.fillna(0, inplace=True)
ratio_4.fillna(0, inplace=True)

logistic_3 = ratio_3.copy()
logistic_4 = ratio_4.copy()

lin_coef_3 = {}
lin_coef_4 = {}
log_coef_3 = {}
log_coef_4 = {}

for state in ratio_3.columns:
    lin_coef_3[statename(state)] = []
    n = round(len(ratio_3.index)/10)
    x = ratio_3.index.values
    y = ratio_3[state].values
    for i in range(1,n):
        regressor = LinearRegression()  
        regressor.fit(x[(i-1)*10:i*10].reshape(-1,1), y[(i-1)*10:i*10].reshape(-1,1))
        lin_coef_3[statename(state)].append(['Day '+str((i-1)*10)+'-'+str(i*10)+': ', round(regressor.coef_[0][0], 7), round(regressor.intercept_[0], 7)])
        for h in range((i-1)*10, i*10):
            ratio_3.loc[h, state] = (regressor.coef_[0][0]*h) + regressor.intercept_[0]
    regressor = LinearRegression()  
    regressor.fit(x[(n-1)*10:].reshape(-1,1), y[(n-1)*10:].reshape(-1,1))
    lin_coef_3[statename(state)].append(['Day '+str((n-1)*10)+'- end: ', round(regressor.coef_[0][0], 7), round(regressor.intercept_[0], 7)])
    for h in range((n-1)*10, len(ratio_3.index)):
        ratio_3.loc[h, state] = (regressor.coef_[0][0]*h) + regressor.intercept_[0]

for state in ratio_4.columns:
    lin_coef_4[statename(state)] = []
    n = round(len(ratio_4.index)/10)
    x = ratio_4.index.values
    y = ratio_4[state].values
    for i in range(1,n):
        regressor = LinearRegression()  
        regressor.fit(x[(i-1)*10:i*10].reshape(-1,1), y[(i-1)*10:i*10].reshape(-1,1))
        lin_coef_4[statename(state)].append(['Day '+str((i-1)*10)+'-'+str(i*10)+': ', round(regressor.coef_[0][0], 7), round(regressor.intercept_[0], 7)])
        for h in range((i-1)*10, i*10):
            ratio_4.loc[h, state] = (regressor.coef_[0][0]*h) + regressor.intercept_[0]
    regressor = LinearRegression()  
    regressor.fit(x[(n-1)*10:].reshape(-1,1), y[(n-1)*10:].reshape(-1,1))
    lin_coef_4[statename(state)].append(['Day '+str((n-1)*10)+'- end: ', round(regressor.coef_[0][0], 7), round(regressor.intercept_[0], 7)])
    for h in range((n-1)*10, len(ratio_4.index)):
        ratio_4.loc[h, state] = (regressor.coef_[0][0]*h) + regressor.intercept_[0]

ratio_3['index'] = ['Linear3'+x for x in dates_for_index]
ratio_3.set_index('index',inplace=True)
ratio_4['index'] = ['Linear4'+x for x in dates_for_index]
ratio_4.set_index('index',inplace=True)

logistic_3 = np.log(logistic_3/(1-logistic_3))
logistic_4 = np.log(logistic_4/(1-logistic_4))
logistic_3.replace([np.inf, -np.inf], np.nan, inplace=True)
logistic_4.replace([np.inf, -np.inf], np.nan, inplace=True)
logistic_3.fillna(0, inplace=True)
logistic_4.fillna(0, inplace=True)

for state in logistic_3.columns:
    regressor = LinearRegression()  
    regressor.fit(logistic_3.index.values.reshape(-1,1), logistic_3[state].values.reshape(-1,1))
    for index in logistic_3.index:
        logistic_3.loc[index, state] = 1/(1 + math.exp(-(regressor.coef_[0][0]*index + regressor.intercept_[0])))
    log_coef_3[statename(state)] = [regressor.coef_[0][0], regressor.intercept_[0]]

for state in logistic_4.columns:
    regressor = LinearRegression()  
    regressor.fit(logistic_4.index.values.reshape(-1,1), logistic_4[state].values.reshape(-1,1))
    for index in logistic_4.index:
        logistic_4.loc[index, state] = 1/(1 + math.exp(-(regressor.coef_[0][0]*index + regressor.intercept_[0])))
    log_coef_3[statename(state)] = [regressor.coef_[0][0], regressor.intercept_[0]]

logistic_3['index'] = ['Logistic3'+x for x in dates_for_index]
logistic_3.set_index('index',inplace=True)
logistic_4['index'] = ['Logistic4'+x for x in dates_for_index]
logistic_4.set_index('index',inplace=True)

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

state_wise_daily = pd.concat([state_wise_daily, non_cumulative, ratio_3, ratio_4, logistic_3, logistic_4])

date_status_list = list(state_wise_daily.index)

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
    file.write("var statesData = " + states_data + ";"+"var totalData = " + str(total_properties_list) + ";"+"var runID = '" + str(run_id) +"';"+"var recoveredAvailable = '" + str(covid_recovered_availability) +"';"+"var noOfDays = '" + str(no_of_days) +"';"+"var SD = '" + str(start_date) +"';"+"var lin_coef_3 = " + str(lin_coef_3) +";"+"var lin_coef_4 = " + str(lin_coef_4) +";"+"var log_coef_3 = " + str(log_coef_3) +";"+"var log_coef_4 = " + str(log_coef_4) +";")

print("\nData written into " + run_id + "/data.js")

f.close()

