/**
 * @module map.js
 */
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


/**
 * @classdesc
 * Base class for sources providing images divided into a tile grid.
 *
 */

var Fmap = class {
    /**
     * @param {options} map options (layer url, attributions,  center, zoom).
     */
    constructor(options) {
        this.options = options;
        this.className = "Fmap";
        this.map = null;
        this.source = null;
        this.initMap();
    }

    initMap() {

        this.map = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new OSM({
                        attributions: [this.options.attributions],
                        url: this.options.url
                    })
                })
            ],
            view: new View({
                center: transform(this.options.center, 'EPSG:4326', 'EPSG:3857'),
                zoom: this.options.zoom
            })
        });

        this.map.on('moveend', this.updateExtent.bind(this));

        busEvent.on('storeLoaded', this.loadFeatures, this);        
        busEvent.fire("mapLoaded", this);

    }

    loadFeatures(e) {
        var features = e.target.data;
        this.source = new VectorSource({
            features: (new GeoJSON()).readFeatures(features)
        });
        var vectorLayer = new VectorLayer({
            source: this.source
        });
        this.map.addLayer(vectorLayer);
        var extent = this.source.getExtent();
        this.map.getView().fit(extent, this.map.getSize());
        busEvent.on('storeFiltered', this.filterFeatures, this);

    }

    updateExtent(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.map && this.source) {
            var extent = e.map.getView().calculateExtent(e.map.getSize());
            console.log(extent);
            var filteredIDs = [];
            this.source.forEachFeatureInExtent(extent, function(feature) {
                filteredIDs.push(feature.getProperties().code_rne);
            });
            busEvent.fire("mapChanged", filteredIDs );
        }

    }   

    filterFeatures(e) {
        // todo
    }

}

module.exports = Fmap;