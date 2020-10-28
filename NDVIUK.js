{\rtf1\ansi\ansicpg1252\cocoartf2513
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww10800\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // Retrieve MODIS Terra Vegetation Indices 16 day global 1km dataset. Select NDVI band\
var col = ee.ImageCollection('MODIS/006/MOD13A2').select('NDVI');\
\
// Define a mask to clip the NDVI data \
var mask = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')\
  .filter(ee.Filter.eq('country_co', 'UK'));\
\
// Define the regional bounds of animation frames\
var region = ee.Geometry.Polygon(\
  [[[-13.99311197878253,49.522683578214206], \
    [3.453177083717449,49.522683578214206], \
    [3.453177083717449,62.46992600701793], \
    [-13.99311197878253,62.46992600701793]]],\
  null, false\
  );\
\
// Group images by composite date\
col = col.map(function(img)\{\
  var doy = ee.Date(img.get('system:time_start')).getRelative('day', 'year');\
  return img.set('doy', doy);\
\});\
var distinctDOY = col.filterDate('2013-01-01', '2014-01-01');\
\
// Define a filter that identifies which images from the complete collection match the DOY from the distinct DOY collection\
var filter = ee.Filter.equals(\{leftField: 'doy', rightField: 'doy'\}); \
\
// Define a join \
var join = ee.Join.saveAll('doy_matches');\
\
// Apply the join and convert the resulting FeatureCollection to an ImageCollection\
var joinCol = ee.ImageCollection(join.apply(distinctDOY, col, filter));\
\
// Apply median reduction among matching DOY collections\
var comp = joinCol.map(function(img) \{\
  var doyCol = ee.ImageCollection.fromImages(\
    img.get('doy_matches')\
    );\
    return doyCol.reduce(ee.Reducer.median());\
\});\
// Define RGB visualisation parameters\
var visParams = \{\
  min: 0.0,\
  max: 9000.0,\
  palette: [\
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901', '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01', '012E01', '011D01', '011301'\
    ],\
\};\
\
// Create RGB visualisation images for use as animation frames\
var rgbVis = comp.map(function(img)\{\
  return img.visualize(visParams).clip(mask);\
\});\
\
// Define GIS visualisation parameters\
var gifParams = \{\
'region' : region, \
'dimensions' : 600, \
'crs' : 'EPSG: 3857', \
'framesPerSecond' : 10\
\};\
\
// Print the GIF URL to the console\
print(rgbVis.getVideoThumbURL(gifParams));\
\
// Render the GIS animation in the console\
print(ui.Thumbnail(rgbVis, gifParams));}