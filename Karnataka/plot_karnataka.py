import json

# load the json data
f = open('districts_daily.json') 
loaded_json = json.load(f)

data = {}

for district in loaded_json['districtsDaily']['Karnataka'].keys():
    data[district] = []
    for entry in loaded_json['districtsDaily']['Karnataka'][district]:
        for status in ['active', 'confirmed', 'deceased', 'recovered']:
            data[district].append([entry['date'], status, entry[status]])


with open("data.js", 'w') as file:
    file.write("var data = " + str(data) + ";")

print("\nData written into data.js")