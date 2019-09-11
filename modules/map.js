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

import Overlay from 'ol/Overlay';

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
		this.selectedFeature = null;
		this.marker = null;
        this.initMap();

        this.styles = [[new Style({
            image: new Circle({
                fill: new Fill({
                    color: 'rgba(0, 0, 0, 0)'
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0)'
                }),
                radius: 1
            })
        })],

        [new Style({
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
        })],

        [ new Style({
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
        })]];

    }

    initMap() {
		
		const svg = ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="marker" x="0px" y="0px" viewBox="0 0 297 297" style="enable-background:new 0 0 297 297;" xml:space="preserve" width="30px" height="30px">',
                '<path d="M148.5,0C85.646,0,34.511,51.136,34.511,113.989c0,25.11,8.008,48.926,23.157,68.873  c13.604,17.914,32.512,31.588,53.658,38.904l27.464,68.659c1.589,3.971,5.434,6.574,9.71,6.574c4.276,0,8.121-2.603,9.71-6.574  l27.464-68.659c21.146-7.316,40.054-20.99,53.658-38.904c15.149-19.947,23.157-43.763,23.157-68.873  C262.489,51.136,211.354,0,148.5,0z M148.5,72.682c22.777,0,41.308,18.53,41.308,41.308c0,22.777-18.53,41.309-41.308,41.309  c-22.777,0-41.308-18.531-41.308-41.309C107.192,91.212,125.723,72.682,148.5,72.682z" fill="#F31541"/><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g>',
            '</svg>'].join("");
		$("#marker").append(svg);
		
		var overlays = [];        
        this.marker = new Overlay({ positioning: 'bottom-center', element: $("#marker")[0], stopEvent: false})
        overlays.push(this.marker);

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
			overlays: overlays,
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
            style: this.styles[1]
        });
        this.map.addLayer(vectorLayer);
        var extent = this.source.getExtent();
        this.map.getView().fit(extent, this.map.getSize());
        busEvent.on('storeFiltered', this.filterFeatures, this);
        busEvent.on('itemClicked', this.selectFeature, this);
        busEvent.on('inputchanged',this.filterFeatures,this);

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
	
	selectFeature(e) {		
		this.selectedFeature = this.source.getFeatureById(e.target);		
		this.marker.setPosition(this.selectedFeature.getGeometry().getFirstCoordinate());
		$("#marker").show();
	}
	
	unSelectFeature() {
        $("#marker").hide();
	}

    filterFeatures(e) {
        var _filteredIDs = e.target.filteredIDs;
        var styles = this.styles;
        var parent = this;
        if (_filteredIDs.length > 0 ) {        
            this.source.forEachFeature(function(feature) {
                if (_filteredIDs.includes(feature.getId())) {
                    feature.setStyle(styles[2]);
                } else {
                    feature.setStyle(styles[0]);
                    let feat = JSON.stringify(feature.getGeometry().getFirstCoordinate());
                    let marque = JSON.stringify(parent.marker.getPosition());
                    if(marque==feat)
                    {
                        parent.unSelectFeature();
                    }
                    
                }
            });
            this.filteredIDs = _filteredIDs;
        }
        else
        {
            var filtre = $('#toast-filter').text();
            this.source.forEachFeature(function(feature) {
                if(filtre=="")
                {
                    feature.setStyle(styles[1]);
                }
                else
                {
                    feature.setStyle(styles[0]);

                   
                    
                }
                    
            });
            
        }
    }

	removeFilter(e) {
		var styles = this.styles;
		this.source.forEachFeature(function(feature) {
			feature.setStyle(styles[1]);
		});
		this.filteredIDs = [];

	}


}

module.exports = Fmap;