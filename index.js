import jquery from 'jquery';
window.$ = window.jquery = jquery;
require('bootstrap');
import "./index.scss";
import 'bootstrap/js/dist/util';

var busEvent = require('./modules/bus');

const Fmap = require('./modules/map');
const Fstore = require('./modules/store');


 $.ajax({
	type: "GET",
	url: "config.json",
	success: function( config ) {
	  $("title").text(config.title);
	  let map = new Fmap(config.map);
	  let store = new Fstore(config.data);
	},
	error: function (a, b, c) {
	  console.log(a, b, c);
	}
  });








