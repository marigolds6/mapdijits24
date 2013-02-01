/**
 * Part of the St Louis County Police ESRI jsapi map application
 * @projectDescription BaseMap widget
 * 
 * @namespace mapdijits.BaseMap
 * @author Brett Lord-Castillo blord-castillo(at)stlouisco(dot)com
 * @version 0.3
 * Stable pre-alpha
 */
/**
 * Change Log:
 * 0.3: highlightGraphic, _highlightGraphic, and unhighlightGraphic changed to
 * 			showInfoWindow, _showInfoWindow, and hideInfoWindow respectively.
 * 		_unhighlightGraphic removed. Use hideInfoWindow.
 * 		Modes removed (See mapdijits.DefinitionsManager for linking ResultPane/graphics events)
 */
/*global console, dijit, document, dojo, esri, window*/
dojo.provide("mapdijits.BaseMap");
dojo.experimental("mapdijits.BaseMap", "St Louis County Police Mapping experimental dijit");
dojo.require("esri.map");
dojo.require("dojo.DeferredList");
dojo.require("dijit.dijit");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.TitlePane");
dojo.require("esri.dijit.BasemapGallery");
/* required modules loaded by esri.map */
//dojo.require("dijit._Templated");
//dojo.require("dijit.form.Button");
if (!mapdijits.urlargs) {
	mapdijits.urlargs = {
		extent: ""
	}
}
/***************
 * CSS Includes
 ***************/
//anonymous function to load CSS files required for this module
(function () {
	var i, il, css = [dojo.moduleUrl("mapdijits", "css/BaseMap.css?v=1.0")], head = document.getElementsByTagName("head").item(0), link;
	for (i = 0, il = css.length; i < il; i++) {
		link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = css[i];
		head.appendChild(link);
	}
}());

/**
 * @classDescription This class creates a new BaseMap layout widget.
 * @return {mapdijits.BaseMap} Returns a new BaseMap.
 * @param {Object} params
 * @constructor
 */
dojo.declare("mapdijits.BaseMap", [dijit.layout._LayoutWidget, dijit._Templated, dijit._Container], {
	/******************************************************************
	 * Dijit Properties
	 */
	isLayoutContainer: true,
	isContainer: true,
	/**
	 * If widget template contains other widgets
	 * @type {Boolean}
	 */
    widgetsInTemplate: true, 
	/**
	 * Path to widget template
	 * @type {String}
	 */
	//Not using template path
    //templatePath: dojo.moduleUrl("mapdijits", "templates/BaseMap.html"), 
	templateString: "<div minsize='1px' class='mapdijitBaseMapMain' dojoAttachPoint='containerNode' id='${id}'><div dojoAttachPoint='mapNode'><span dojoAttachPoint='copyrightNode' class='copyrighttext'></span><div class='mapdijitBaseMapLoading' dojoAttachPoint='loadingNode' ></div><div style='position:absolute; right:20px; top:10px; z-Index:999;'><div dojoType='dijit.TitlePane' title='Switch Basemap' closable='false'  open='false'><div dojoType='dijit.layout.ContentPane' style='width:380px; height:280px; overflow:auto;'><div dojoAttachPoint='galleryNode' ></div></div></div></div></div></div>",

	/******************************************************************
	 * Custom Properties
	 **/
	/**
	 * if map loading is complete
	 * @type {Boolean}
	 */
	loaded: false, 
	showArcGISBasemaps: true,
	bingMapsKey: "",
	basemapLayerTypes: ["BingMapsAerial", "BingMapsHybrid", "BingMapsRoad", "OpenStreetMap"],
	constructor : function (params, srcNodeRef) {
		this.connects = []; //Stores dojo.connect handles
		this.map = ""; //Holds the esri.map object
		this.resizetimer = ""; //Resize timer - prevents stutter in IE6/7
		return;

	}, 
	/******************************************************************
	 * Mapdijit Lifecycle Events
	 ******************************************************************/
	postMixInProperties: function () {
		this.inherited("postMixInProperties", arguments);
		//Custom code goes here
	}, 
	postCreate : function () {
		this.inherited("postCreate", arguments);
	}, 
	startup: function () {
		//Code goes here
		dojo.mixin(mapdijits.mapConfig, arguments);
		dojo.forEach(this.getChildren(), function(child){child.startup();});
		if (this.inherited.startup) {
			this.inherited("startup", arguments);
		}
	},
	destroy: function () {
		var c;
		for (c in this.connects) {
			if (this.connects[c].slice) {
				dojo.disconnect(this.connects[c]);
			}
		}
		this.inherited("destroy", arguments);
	}, 
	/******************************************************************
	 * Implemented methods from dijit.layout._LayoutWidget
	 ******************************************************************/
	/**
	 * Resizes map when layout() is called by containing object
	 * @alias layout
	 * @alias mapdijits.BaseMap.layout
	 * @memberOf BaseMap
	 * @method
	 */
	layout: function () { //Not executed if map is not created yet
		this.inherited("layout", arguments);
		if (this.map) {
			this.onMapResize();
		} else {
			this.init(mapdijits.mapConfig);
		}
	}, 
	/**
	 * See dijit.layout._LayoutWidget
	 * @alias _setupChild
	 * @alias mapdijits.BaseMap._setupChild
	 * @memberOf BaseMap
	 * @method
	 */
	_setupChild: function (child) {
		if (child.superclass) {
			if(child.superclass == "mapdijits.layers.Layer") {
				this.addLayer(child.getLayer());
			} else if (child.superclass == "mapdijits.layers.Basemap") {
				this.addBasemap(child.getBasemap());
			}
		}
		this.inherited("_setupChild", arguments);
	},
	/******************************************************************
	 * Event Handlers
	 ******************************************************************/
	/**
	 * Called during DOM load to initialize BaseMap after creation
	 * @alias init
	 * @alias mapdijits.BaseMap.init
	 * @param {Object} [options] Optional map parameters as specified for esri.Map(divID, options?)
	 * @memberOf BaseMap
	 * @method
	 */
	//Need way to pass arguments when parsing
	init: function (options) {
		options = options || {};
		options.extent = mapdijits.urlargs.extent || options.extent; //Override any passed extent with url arguments
		this.map = new esri.Map(this.domNode, options);
		this.onLoadingStart();
		this.connects.bmHandlers = dojo.connect(this.map, "onLoad", this, this.setHandlers);
		this.basemapGallery = this.createBasemapGallery();
		this.connects.bmgLoad = dojo.connect(this.basemapGallery, "onLoad", dojo.hitch(this, this.onLoadingEnd));
		dojo.forEach(dojo.filter(this.getChildren().reverse(), function(child){
			return (child.superclass && child.superclass == "mapdijits.layers.Layer");
		}).concat(dojo.filter(this.getChildren(),function(child){
			return child.superclass == "mapdijits.layers.Basemap";
		})), this._setupChild, this);
	}, 
	//Override to change how basemap gallery is created
	//Must return object of class esri.dijit.BasemapGallery
	createBasemapGallery: function() {
		var bmg = new esri.dijit.BasemapGallery({
			showArcGISBasemaps: (this.showArcGISBasemaps == null) ? true : this.showArcGISBasemaps,
			map: this.map
		}, this.galleryNode);
		return bmg;
	},
	/**
	 * Sets up object event connections after map object has been loaded
	 * @alias setHandlers
	 * @alias mapdijits.BaseMap.setHandlers
	 * @memberOf BaseMap
	 * @method
	 */
	setHandlers: function (source) {
		//Remove dojo.connect for setHandlers - only want this called once
		dojo.disconnect(this.connects.bmHandlers);
		delete this.connects.bmHandlers;
		//Connect map events
		this.connects.mExtentChange = dojo.connect(this.map, "onExtentChange", this, this.onMapExtentChange);
        this.connects.mPan = dojo.connect(this.map, "onPan", this, this.onMapPan);
		//Alert other widgets when the infoWindow has been closed by a click on _hide (the 'X' sprite)
		dojo.connect(this.map.infoWindow._hide, "onclick", function () {
			dojo.publish("mapdijits.BaseMap.infoWindow.onClose", []);
		});
		this.loaded = true;
		this.onLoadingEnd(source);
	}, 
	/**
	 * Called when the extent of the embedded esri.map object changes
	 * @alias onMapExtentChange
	 * @alias mapdijits.BaseMap.onMapExtentChange
	 * @memberOf BaseMap
	 * @method
	 */
	onMapExtentChange: function () {
		return arguments;
	}, 
	/**
	 * Called when the embedded esri.map object is panned
	 * @alias onMapPan
	 * @alias mapdijits.BaseMap.onMapPan
	 * @memberOf BaseMap
	 * @method
	 */
	onMapPan: function () {
		return arguments;
	}, 
	/**
	 * Called when the embedded esri.map object is resized
	 * @alias onMapResize
	 * @alias mapdijits.BaseMap.onMapResize
	 * @memberOf BaseMap
	 * @method
	 */
	onMapResize: function () {
		if (dojo.coords(this.domNode).w > 2 && dojo.coords(this.domNode).h > 2) {
			window.clearTimeout(this.resizetimer);
			this.resizetimer = window.setTimeout(dojo.hitch(this, function () {
				this.map.resize();
				this.map.reposition();
			}), 200);
		}
		return arguments;
	}, 

	/******************************************************************
	 * Accessor Methods
	 ******************************************************************/
	/**
	 * Gets the current map object
	 * @return {esri.map}
	 */
	getMap: function () {
		return this.map;
	}, 
	getScale: function () {
		return (this.map) ? esri.geometry.getScale(this.map.extent, this.map.width, this.map.spatialReference.wkid) : null;
	}, 
	/**
	 * Retrieves an individual map layer
	 * @return {esri.Layer}
	 */
	getLayer: function (id) {
		return this.map.getLayer(id);
	}, 	
	/******************************************************************
	 * Methods
	 ******************************************************************/
	addBasemap: function (basemap, thumbnailUrl, title) {
		//'basemap' can be a string url, a string basemap type, an esri.dijit.Basemap object, an esri.dijit.BasemapLayer, or a parameter object for a Basemap object
		//thumbnailUrl and title are optional
		//For multiple layers in a Basemap, must use a Basemap Object or parameter object for a Basemap
		var _basemap = false;
		if (!this.basemapGallery) {
			this.basemapGallery = this.createBasemapGallery();
		}
		if (typeof basemap == "string") {
			if (dojo.indexOf(this.basemapLayerTypes, basemap) >= 0) {
				//create layer of type and create basemap
				_basemap = this._BasemapLayerToBasemap(new esri.dijit.BasemapLayer({type: basemap}), thumbnailUrl, title);
			} else {
				//treat as url for layer and create layer then basemap
				_basemap = this._BasemapLayerToBasemap(new esri.dijit.BasemapLayer({url: basemap}), thumbnailUrl, title);
			}
		} else if (typeof basemap == "object") {
			if (basemap.declaredClass == "esri.dijit.Basemap") {
				//continue normally
				_basemap = basemap;
			} else if (basemap.declaredClass == "esri.dijit.BasemapLayer") {
				//make basemap from basemap layer
				_basemap = this._BasemapLayerToBasemap(basemap, thumbnailUrl, title);
			} else if (basemap.layers){
				//These are basemap params, make basemap
				try {
					_basemap = new esri.dijit.Basemap(basemap);
				} catch (e) {
					console.error("Failed to create basemap from basemap params argument");
					console.log(e);
					console.log(basemap);
				}
			} else if (basemap.type || basemap.url) {
				//These are layer params, make a basemap layer then a basemap
				try {
					_basemap = this._BasemapLayerToBasemap(new esri.dijit.BasemapLayer(basemap), thumbnailUrl, title);
				} catch (e) {
					console.error("Failed to create basemap from basemap layer params argument");
					console.log(e);
					console.log(basemap);
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
		//At this point _basemap should be an object of class esri.dijit.Basemap
		//Add this, triggering 
		try {
			if (this.basemapGallery) {
				this.basemapGallery.add(_basemap);
				if(this.basemapGallery.basemaps.length == 1) {
					this.basemapGallery.select(_basemap.id);
				}
			} else {
				console.error("No BasemapGallery in " + this.id + ".basemapGallery");
				console.error("Unable to add basemap '" + _basemap.id + "'");
				console.log(_basemap);
			}
		} catch (e) {
			console.error(e);
		}

	}, 
	//Takes a single BasemapLayer and makes a basemap out of it
	_BasemapLayerToBasemap: function (layer, thumbnailUrl, title) {
		try {
			return new esri.dijit.Basemap({
				layers: [layer],
				thumbnailUrl: thumbnailUrl,
				title: title
			});
		} catch (e) {
			console.error("Unable to convert basemap layer to basemap. Error and layer argument follows.");
			console.log(e);
			console.log(layer);
			return false;
		}
	},
	addLayer: function (layer) {
		try {
			var dl = new dojo.Deferred();
			var dm = new dojo.Deferred();
			var dlOnLoad = dojo.connect(layer, "onLoad", dl, "callback");
			var dlOnError = dojo.connect(layer, "onError", dl, "errback");
			var dmOnLoad = dojo.connect(this.map, "onLoad", dm, "callback");
			dl.then(function(){dojo.disconnect(dlOnLoad);dojo.disconnect(dlOnError);});
			dm.then(function(){dojo.disconnect(dmOnLoad);});
			if (this.map.loaded) {
				dm.callback(this.map);
			}
			if (layer.loaded) {
				dl.callback(layer);
			}
			var df = new dojo.DeferredList([dm,dl]);
			return df.then(function(response){
				return (response[0][1] && response[1][1]) ? response[0][1].addLayer(response[1][1]) : false;
			});
		} catch (e) {
			console.error("Failed to add layer to map '"  + this.id + "'\n" + e);
			return;			
		}
	},
	fuzzyPan: function (pt, panx, pany) {
		//pans the map just far enough to get the point inside the extent borders
		//pan is an additional factor to scroll inside the borders, e.g. 0.1 adds 10% of the width or height of the extent
		var ex = this.map.extent, ox = 0, oy = 0;
		if (ex.contains(pt)) {
			return;
		} else {
			if (pt.x < ex.xmin) {
				ox = pt.x - ex.xmin - (panx * ex.getWidth());
			} else if (pt.x > ex.xmax) {
				ox = pt.x - ex.xmax + (panx * ex.getWidth());				
			}
			if (pt.y < ex.ymin) {
				oy = pt.y - ex.ymin - (pany * ex.getHeight());
			} else if (pt.y > ex.ymax) {
				oy = pt.y - ex.ymax + (pany * ex.getHeight());					
			}
			this.map.setExtent(ex.offset(ox, oy));

		}	
		
	}, 
	showInfoWindow: function () {
		var geo, pt, graphic = (arguments[0] && typeof arguments[0] === "object") ? ((arguments[0].declaredClass === "esri.Graphic") ? arguments[0] : null) : ((arguments[0] && typeof arguments[0] === "number") ? this.map.graphics.graphics[arguments[0]] : null);
		if (graphic) {
 			//Define event point
			pt = geo = graphic.geometry;
			if (geo.type === "polygon" || geo.type === "extent") {
				pt = geo.getExtent().getCenter();
			}
			if (geo.type === "polyline" || (geo.type === "polygon" && !geo.contains(pt))) {
				pt = geo.getPoint(0, 0);
			}
			pt = (geo.type === "multipoint") ? new esri.geometry.Point(geo.points[0], this.map.spatialReference) : pt;
			//Set and Show InfoWindow
			if (pt) {
				this.fuzzyPan(pt, 0.25, 0.25);
				this.map.infoWindow.setContent(graphic.getContent());
				this.map.infoWindow.setTitle(graphic.getTitle());
				this.map.infoWindow.show(this.map.toScreen(pt), this.map.getInfoWindowAnchor(this.map.toScreen(pt)));
				return graphic;
			}
		}
		return null;
	}, 
	hideInfoWindow: function () {
		this.map.infoWindow.hide();
		this.map.infoWindow.setContent("");
		this.map.infoWindow.setTitle("");
		return null;
	}, 
	//Disable the _hide sprite - the InfoWindow cannot be closed
	disableInfoWindowClose: function () {
		dojo.addClass(this.map.infoWindow._hide, "mapdijitsHideInfoWindow");
	}, 
	//Enable the _hide sprite - the InfoWindow can be closed
	enableInfoWindowClose: function () {
		dojo.removeClass(this.map.infoWindow._hide, "mapdijitsHideInfoWindow");		
	}, 
	//******************************************************************
	//esri.map events
	setExtent: function (extent) {
		this.map.setExtent(extent);
	}, 
	centerAt: function (mapPoint) {
		this.map.centerAt(mapPoint);
	}, 
	centerAndZoom: function (mapPoint, levelOrFactor) {
		this.map.centerAndZoom(mapPoint, levelOrFactor);
	}, 
	onLoadingStart: function () {
		this._hide();
	}, 
	onLoadingEnd: function (source) {
		this._unhide();
		delete this.connects.bmgLoad;
		delete this.connects.mapLoad;
	}, 
	//******************************************************************
	//esri.dijit.BasemapGallery events
	onAddBasemap: function (){},
	onErrorBasemap: function (){},
	onLoadBasemap: function (){},
	onRemoveBasemap: function (){},
	onSelectionChangeBasemap: function (){},
	
	_hide: function () {
		esri.show(this.loadingNode);
		this.map.disableMapNavigation();
		this.map.hideZoomSlider();		
	}, 
	_unhide: function () {
        esri.hide(this.loadingNode);
        this.map.enableMapNavigation();
        this.map.showZoomSlider();
	}
});
