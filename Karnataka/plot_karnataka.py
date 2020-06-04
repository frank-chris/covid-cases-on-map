import json
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

def daily(df):
    for column in df.columns:
        temp = df[column].sub(df[column].shift())
        temp.iloc[0] = df[column].iloc[0]
        df[column] = temp
    return df

# load the json data
f = open('districts_daily.json') 
loaded_json = json.load(f)

number_of_dates = {}
data = {}
dates = []

for entry in loaded_json['districtsDaily']['Karnataka']['Bagalkote']:
    dates.append(entry['date'])

for district in loaded_json['districtsDaily']['Karnataka'].keys():
    data[district] = []
    number_of_dates[district] = len(loaded_json['districtsDaily']['Karnataka'][district])
    for entry in loaded_json['districtsDaily']['Karnataka'][district]:
        for status in ['active', 'confirmed', 'deceased', 'recovered']:
            data[district].append([entry['date'], status, entry[status]])

dataframes = {}

for status in ['active', 'confirmed', 'deceased', 'recovered']:
    dataframes[status] = pd.DataFrame();
    dataframes[status]['index'] = dates
    dataframes[status].set_index('index', inplace=True)
    for district in loaded_json['districtsDaily']['Karnataka'].keys():
        dataframes[status][district] = 0
        for entry in loaded_json['districtsDaily']['Karnataka'][district]:
            dataframes[status].loc[entry['date'], district] = entry[status]

active_cumulative = dataframes['active'].copy()
confirmed_cumulative = dataframes['confirmed'].copy()
deceased_cumulative = dataframes['deceased'].copy()
recovered_cumulative = dataframes['recovered'].copy()

dataframes['active'] = daily(dataframes['active'])
dataframes['confirmed'] = daily(dataframes['confirmed'])
dataframes['deceased'] = daily(dataframes['deceased'])
dataframes['recovered'] = daily(dataframes['recovered'])

dataframes['ratio-1'] = dataframes['active']/active_cumulative
dataframes['ratio-2'] = recovered_cumulative/confirmed_cumulative
dataframes['ratio-3'] = dataframes['deceased']/active_cumulative
dataframes['ratio-4'] = dataframes['recovered']/active_cumulative
dataframes['ratio-5'] = deceased_cumulative/confirmed_cumulative

dataframes['ratio-1'].replace([np.inf, -np.inf, np.nan,], '', inplace=True)
dataframes['ratio-2'].replace([np.inf, -np.inf, np.nan,], '', inplace=True)
dataframes['ratio-3'].replace([np.inf, -np.inf, np.nan,], '', inplace=True)
dataframes['ratio-4'].replace([np.inf, -np.inf, np.nan,], '', inplace=True)
dataframes['ratio-5'].replace([np.inf, -np.inf, np.nan,], '', inplace=True)

diagnosticsData = {}

for district in loaded_json['districtsDaily']['Karnataka'].keys():
    diagnosticsData[district] = []
    for entry in loaded_json['districtsDaily']['Karnataka'][district]:
        for status in ['ratio-1', 'ratio-2', 'ratio-3', 'ratio-4', 'ratio-5']:
            diagnosticsData[district].append([entry['date'], status, dataframes[status].loc[entry['date'], district]])

dailyData = {}

for district in loaded_json['districtsDaily']['Karnataka'].keys():
    dailyData[district] = []
    for entry in loaded_json['districtsDaily']['Karnataka'][district]:
        for status in ['active', 'confirmed', 'deceased', 'recovered']:
            dailyData[district].append([entry['date'], status, dataframes[status].loc[entry['date'], district]])

results = {}

dataframes['linear-1'] = dataframes['ratio-1'].copy()
dataframes['linear-2'] = dataframes['ratio-2'].copy()
dataframes['linear-3'] = dataframes['ratio-3'].copy()
dataframes['linear-4'] = dataframes['ratio-4'].copy()
dataframes['linear-5'] = dataframes['ratio-5'].copy()

dataframes['ratio-1'].replace('', 0, inplace=True)
dataframes['ratio-2'].replace('', 0, inplace=True)
dataframes['ratio-3'].replace('', 0, inplace=True)
dataframes['ratio-4'].replace('', 0, inplace=True)
dataframes['ratio-5'].replace('', 0, inplace=True)

for status in ['ratio-1', 'ratio-2', 'ratio-3', 'ratio-4', 'ratio-5']:
    results[status] = {}
    linear = status.replace('ratio', 'linear')
    for district in loaded_json['districtsDaily']['Karnataka'].keys():
        results[status][district] = []
        n = round(44/10)
        y = dataframes[status][district]
        dataframes[status]['x'] = [k for k in range(len(dataframes[status].index))]
        x = dataframes[status]['x']
        for i in range(1,n):
            regressor = LinearRegression()
            regressor.fit(x[(i-1)*10:i*10].to_numpy().reshape(-1, 1), y[(i-1)*10:i*10].to_numpy().reshape(-1, 1))
            results[status][district].append([regressor.coef_[0][0], regressor.intercept_[0]])
            for h in range((i-1)*10, i*10):
                dataframes[linear][district][h] = h*regressor.coef_[0][0] + regressor.intercept_[0]
        regressor = LinearRegression()
        regressor.fit(x[(n-1)*10:].to_numpy().reshape(-1, 1), y[(n-1)*10:].to_numpy().reshape(-1, 1))
        results[status][district].append([regressor.coef_[0][0], regressor.intercept_[0]])
        for h in range((n-1)*10, len(dataframes[linear][district])):
            dataframes[linear][district][h] = h*regressor.coef_[0][0] + regressor.intercept_[0]

print(regressor.coef_, regressor.intercept_)

dataframes['linear-1'].replace([np.inf, -np.inf, np.nan,], '', inplace=True)
dataframes['linear-2'].replace([np.inf, -np.inf, np.nan,], '', inplace=True)
dataframes['linear-3'].replace([np.inf, -np.inf, np.nan,], '', inplace=True)
dataframes['linear-4'].replace([np.inf, -np.inf, np.nan,], '', inplace=True)
dataframes['linear-5'].replace([np.inf, -np.inf, np.nan,], '', inplace=True)

for district in loaded_json['districtsDaily']['Karnataka'].keys():
    for entry in loaded_json['districtsDaily']['Karnataka'][district]:
        for status in ['linear-1', 'linear-2', 'linear-3', 'linear-4', 'linear-5']:
            diagnosticsData[district].append([entry['date'], status, dataframes[status].loc[entry['date'], district]])

with open("data.js", 'w') as file:
    file.write("var data = " + str(data) + ";"+"var dailyData = " + str(dailyData) + ";"+"var diagnosticsData = " + str(diagnosticsData) + ";"+"var results = " + str(results) + ";")

print("\nData written into data.js")