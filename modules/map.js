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

import {Circle, Fill, Stroke, Style} from 'ol/style.js';

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
        this.filteredIDs = [];
        this.initMap();

        this.style0 = [new Style({
            image: new Circle({
                fill: new Fill({
                    color: 'rgba(0, 0, 0, 0)'
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0)'
                }),
                radius: 1
            })
        })];

        this.style1 = [new Style({
            image: new Circle({
                fill: new Fill({
                    color: 'rgba(99, 110, 114,1.0)'
                }),
                stroke: new Stroke({
                    color: "#ffffff",
                    width: 4
                }),
                radius: 9
            })
        })];

        this.style2 = [ new Style({
            image: new Circle({
                fill: new Fill({
                    color: 'rgba(255, 118, 117,1.0)'
                }),
                stroke: new Stroke({
                    color: "#ffffff",
                    width: 4
                }),
                radius: 9
            })
        })];

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
		busEvent.on('removeFilter', this.removeFilter, this);
        busEvent.fire("mapLoaded", this);

    }

    loadFeatures(e) {
        var features = e.target.data;
        this.source = new VectorSource({
            features: (new GeoJSON()).readFeatures(features)
        });
        var vectorLayer = new VectorLayer({
            source: this.source,
            style: this.style1
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
            var _filteredIDs = [];
            this.source.forEachFeatureInExtent(extent, function(feature) {
                _filteredIDs.push(feature.getId());
            });
            this.filteredIDs = _filteredIDs;
            busEvent.fire("mapChanged", this.filteredIDs );
        }

    }

    filterFeatures(e) {
        var _filteredIDs = e.target.filteredIDs;
        if (_filteredIDs.length > 0 ) {
            var style0 = this.style0;
            var style1 = this.style1;
            var style2 = this.style2;
            this.source.forEachFeature(function(feature) {
                if (_filteredIDs.includes(feature.getId())) {
                    feature.setStyle(style2);
                } else {
                    feature.setStyle(style0);
                }
            });
            this.filteredIDs = _filteredIDs;
        }
    }

	removeFilter(e) {
		var style1 = this.style1;
		this.source.forEachFeature(function(feature) {
			feature.setStyle(style1);
		});
		this.filteredIDs = [];

	}


}

module.exports = Fmap;