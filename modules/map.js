// modules/map.js

import 'ol/ol.css';
import {
 Map,
 View
} from 'ol';
import TileLayer from 'ol/layer/Tile';
import {
 transform
} from 'ol/proj.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {
 Vector as VectorLayer
} from 'ol/layer.js';
import {
 OSM,
 Vector as VectorSource
} from 'ol/source.js';

var busEvent = require('./bus');

'use strict';


var Fmap = class {
 constructor(config) {
  this.config = config;
  this.className = "FMAP";
  this.map = null;
  this.initMap();
 }

 initMap() {

  this.map = new Map({
   target: 'map',
   layers: [
    new TileLayer({
     source: new OSM({
      attributions: [this.config.attributions],
      url: this.config.url
     })
    })
   ],
   view: new View({
    center: transform(this.config.center, 'EPSG:4326', 'EPSG:3857'),
    zoom: this.config.zoom
   })
  });

  busEvent.on('storeLoaded', this.loadFeatures, this);
  busEvent.on('storeFiltered', this.filterFeatures, this);

  busEvent.fire("mapLoaded", this);

 }

 loadFeatures(e) {
  var features = e.target.data;
  var vectorSource = new VectorSource({
   features: (new GeoJSON()).readFeatures(features)
  });
  var vectorLayer = new VectorLayer({
   source: vectorSource
  });
  this.map.addLayer(vectorLayer);
  var extent = vectorSource.getExtent();
  this.map.getView().fit(extent, this.map.getSize());

 }

 filterFeatures(e) {
  // todo
 }

}




module.exports = Fmap;