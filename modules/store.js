/**
 * @module store.js
 */

import Fuse from 'fuse.js';
import Mustache from 'mustache';

var busEvent = require('./bus');


/**
 * @classdesc
 * Base class for sources providing images divided into a tile grid.
 *
 */

var Fstore = class {
    /**
     * @param {options} map options (layer url, attributions,  center, zoom).
     */
    constructor(options) {
        this.className = "Fstore";
        this.options = options;
        this.template = null;
        this.fuse = null;
        this.data = [];
        this.filteredIDs = [];
        this.activefilter = false;
        this.filteredlocations = null;
        this.toast = [
            '<div id="toast" class="toast" role="alert" data-autohide="false" aria-live="assertive" aria-atomic="true">',
                '<div class="toast-header">',
                    '<strong class="mr-auto">Filtre actif</strong>',
                    '<button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">',
                      '<span aria-hidden="true">&times;</span>',
                    '</button>',
                '</div>',
                '<div id="toast-filter" class="toast-body"></div>',
            '</div>'
        ].join("");
        this.fuseOptions = {
          shouldSort: true,
          threshold: 0.2,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: options.searchkeys
        }

        this.initStore("Lycees Bretons");
    }
    changedataset (e) {
        var dataset = $("#typeofdata").val();
        this.initStore(dataset);
    }
    initStore(configdata) {
        $("body").find("*").each(function() {
            $(this).unbind();
        });
        $("#notifications").html("");
      $("#notifications").append(this.toast);
      $("#toast .close").click(this.removeFilter.bind(this));
      $("#btn-search").click(this.searchFeatures.bind(this));
      $("#btn-typedata").click(this.changedataset.bind(this));
      $(document).on("keydown", "#txt-search", function (e)  {
        if (e.keyCode === 13) {
            e.preventDefault();
            $("#btn-search").click();
        }
      });
      $.ajax({
          type: "GET",
          url: this.options.template[configdata],
          context: this,
          success: function( mst ) {
            this.template = mst;
          }
      });
      $.ajax({
          type: "GET",
          url: this.options.url[configdata],
          context: this,
          success: function( data ) {
            $("#txt-search").html("");
            $("#typeofdata").html("");
            $("#team").remove();
            data.title=configdata;
            this.data = data;
            this.fuse = new Fuse(data.features, this.fuseOptions);
            var render = Mustache.render(this.template, data);
            var keys=Object.keys(this.options.url);
            keys.forEach(function(key){
                $("#typeofdata").append(new Option(key));
            });
            
            $("#store").append(render);
            $(".item").click(this.onItemClick.bind(this));
            busEvent.on('mapChanged', this.filterFeatures, this);
            busEvent.fire("storeLoaded", this);
          }
      });

    }
	
	onItemClick (e) {
		$(".item.highlighted").removeClass("highlighted");
		$(document.getElementById(e.currentTarget.id)).addClass("highlighted");
		busEvent.fire("itemClicked", e.currentTarget.id);
	}

    removeFilter (e) {
        this.filteredIDs = [];
        this.filteredlocations=null;
        this.activefilter = false;
        $("#toast-filter").text("");
		$(".item:not(.selected)").addClass("selected");
        busEvent.fire("removeFilter", this);
    }

    searchFeatures (e) {
        var value = $("#txt-search").val();
        if (value.length > 3) {
            this.filteredlocations=null;
            this.filteredIDs = this.fuse.search(value).map(a => a[this.options.uid]);
            $("#toast-filter").text(value);
            $("#txt-search").val("");
            this.filterFeatures({"target": this.filteredIDs,"type": "search"});
            busEvent.fire("inputchanged",this);
            busEvent.fire('emulchanged',this);
        }
    }

    filterFeatures(e) {
        var toastfilter = $("#toast-filter").text();
        var featuresIDs = e.target;
        if(toastfilter=="")
        {
            this.filteredlocations=[];
            $(".item.selected").removeClass("selected");
            featuresIDs.forEach(function(id) {
                $(document.getElementById(id)).addClass("selected");
            });
        }
        else
        {
            if(!this.filteredlocations)
            {
                this.filteredlocations=featuresIDs;
            }
            $(".item.selected").removeClass("selected");
            for(let i=0;i<this.filteredlocations.length;i++)
            {
                for(let j=0;j<featuresIDs.length;j++)
                {
                    if(this.filteredlocations[i]==featuresIDs[j])
                    {
                        $(document.getElementById(this.filteredlocations[i])).addClass("selected");
                    }
                }
            }
            
                      
        }
        if (e.type && e.type === "search") {
			$("#toast").toast('show');
			this.activefilter = true;
		}
        busEvent.fire("storeFiltered", this);

    };
   
}

module.exports = Fstore;