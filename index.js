import jquery from 'jquery';
window.$ = window.jquery = jquery;
require('bootstrap');
import "./index.scss";
import 'bootstrap/js/dist/util';

var busEvent = require('./modules/bus');

const Fmap = require('./modules/map');
var store = require('./modules/store');

var handler = function(e) {
    console.log(e);
};

busEvent.on('mapLoaded', handler);


$.get( "config.json", function( config ) {
  let map = new Fmap(config.map);
  store.initStore(config.store);
  
});








