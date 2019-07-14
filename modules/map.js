// modules/map.js

import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import {transform} from 'ol/proj.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';

var busEvent = require('./bus');

var _config = {};

var _map;

function loadFeatures (e) {
    var features = e.target.data;
    var vectorSource = new VectorSource({
      features: (new GeoJSON()).readFeatures(features)
   });
   var vectorLayer = new VectorLayer({
    source: vectorSource
  });

  _map.addLayer(vectorLayer);
  var extent = vectorSource.getExtent();
  _map.getView().fit(extent, _map.getSize());
    
    
}

function initMap(config) {
  this.className = "MAP";
  this.config = _config = config;
  _map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM({
              attributions: [ config.attributions],
              url: config.url
            })
        })
      ],
      view: new View({
        center: transform(config.center, 'EPSG:4326', 'EPSG:3857'),
        zoom: config.zoom
      })
    });
    this.map = _map;
    
    busEvent.on('storeLoaded', loadFeatures);
    
    
    busEvent.fire("mapLoaded", this);
    
}


module.exports = {
  initMap: initMap
};








