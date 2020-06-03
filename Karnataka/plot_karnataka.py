import json
import pandas as pd

def daily(df):
    for column in df.columns:
        temp = df[column].sub(df[column].shift())
        temp.iloc[0] = df[column].iloc[0]
        df[column] = temp
    return df

# load the json data
f = open('districts_daily.json') 
loaded_json = json.load(f)

data = {}
dates = []

for entry in loaded_json['districtsDaily']['Karnataka']['Bagalkote']:
    dates.append(entry['date'])

for district in loaded_json['districtsDaily']['Karnataka'].keys():
    data[district] = []
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

dataframes['active'] = daily(dataframes['active'])
dataframes['confirmed'] = daily(dataframes['confirmed'])
dataframes['deceased'] = daily(dataframes['deceased'])
dataframes['recovered'] = daily(dataframes['recovered'])

dailyData = {}

for district in loaded_json['districtsDaily']['Karnataka'].keys():
    dailyData[district] = []
    for entry in loaded_json['districtsDaily']['Karnataka'][district]:
        for status in ['active', 'confirmed', 'deceased', 'recovered']:
            dailyData[district].append([entry['date'], status, dataframes[status].loc[entry['date'], district]])

with open("data.js", 'w') as file:
    file.write("var data = " + str(data) + ";"+"var dailyData = " + str(dailyData) + ";")

print("\nData written into data.js")