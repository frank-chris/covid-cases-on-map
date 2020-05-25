import json

# Open GeoJSON file
f = open('states_geojson_simplified.json') 
loaded_json = json.load(f)

# print(loaded_json['features'][4]['geometry']['coordinates'][0][0])

print(loaded_json['features'][4]['geometry'])

# for i in range(len(loaded_json['features'])):
