import jquery from 'jquery';
window.$ = window.jquery = jquery;
require('bootstrap');
import "./index.scss";
import 'bootstrap/js/dist/util';

var busEvent = require('./modules/bus');

const Fmap = require('./modules/map');
const Fstore = require('./modules/store');



$.get( "apps/config.json", function( config ) {
  let map = new Fmap(config.map);
  let store = new Fstore(config.store);
  
});








