// modules/store.js
import Fuse from 'fuse.js';
import Mustache from 'mustache';

var busEvent = require('./bus');

var _template = "";
var _config = {};
var _fuse = null;

function template() {
    return _template;
}

var _fuseOptions = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: []
};



function initStore(config) {
  this.className = "STORE";
  this.config = _config = config;
  this.data = [];
  _fuseOptions.keys = config.keys;
  this.fuseOptions = _fuseOptions;
  $.ajax({
      type: "GET",
      url: config.template,
      context: this,
      success: function( mst ) {
        this.template = mst;   
      }
  });
  $.ajax({
      type: "GET",
      url: config.url,
      context: this,
      success: function( data ) {
        this.data = data;        
        this.fuse = _fuse = new Fuse(data.features, _fuseOptions); // "list" is the item array        
        var render = Mustache.render(this.template, data);
        $("#store").append(render);        
        busEvent.fire("storeLoaded", this);
      }
  });  
   
}


module.exports = {
  initStore: initStore,
  template: template
};