/**
 * Part of the St Louis County Police ESRI jsapi map application
 * @projectDescription templated map layers class. Allows for definition of map layers in markup
 * 
 * @namespace mapdijits.layers
 * @author Brett Lord-Castillo blord-castillo(at)stlouisco(dot)com
 * @version 1.0
 */
/*global console, dijit, document, dojo, esri, window*/
dojo.provide("mapdijits.layers");
dojo.experimental("mapdijits.layers", "St Louis County Police Mapping experimental dijit");
dojo.require("esri.map");
dojo.require("dijit.dijit");
dojo.require("esri.layers.FeatureLayer");

/**
 * @classDescription This is the parent abstract class for all templated layers.
 */
dojo.declare("mapdijits.layers.Layer", [dijit._Widget,dijit._Templated,dijit._Contained], {
	/******************************************************************
	 * Dijit Properties
	 */
	/**
	 * If widget template contains other widgets
	 * @type {Boolean}
	 */
    widgetsInTemplate: false, 
	templateString: "<span></span>",

	/******************************************************************
	 * Custom Properties
	 **/
	superclass: "mapdijits.layers.Layer",
	loaded: false,
	opacity: 1,
	url: "",
	visible: true,
	constructor : function (params, srcNodeRef) {
		this.connects = []; //Stores dojo.connect handles
		this.layer = {};
		return;
	}, 
	/******************************************************************
	 * Mapdijit Lifecycle Events
	 ******************************************************************/
	postCreate : function () {
		dojo.style(this.domNode, "display", "none");
		this._create();
		this.inherited("postCreate", arguments);
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
	 * Event Handlers
	 ******************************************************************/

	/******************************************************************
	 * Accessor Methods
	 ******************************************************************/
	getLayer: function () {
		return this.layer;
	}, 	
	/******************************************************************
	 * Methods
	 ******************************************************************/
	//Override _create to generate correct layer type
	_create: function () {
		return this.layer;
	}
});

/**
 * @classDescription This is the abstract parent class for templated dynamic map service layers.
 */
dojo.declare("mapdijits.layers.DynamicMapServiceLayer", [mapdijits.layers.Layer], {
	/******************************************************************
	 * Dijit Properties
	 * 	All inherited
	 */
	/******************************************************************
	 * Custom Properties
	 * None
	 **/
	constructor : function (params, srcNodeRef) {
		return;
	}
	/******************************************************************
	 * Mapdijit Lifecycle Events
	 ******************************************************************/
	/******************************************************************
	 * Event Handlers
	 ******************************************************************/
	/******************************************************************
	 * Accessor Methods
	 ******************************************************************/
	/******************************************************************
	 * Methods
	 ******************************************************************/
});

/**
 * @classDescription This class creates a new templated ArcGIS Dynamic Map Service.
 * @return {mapdijits.layers.ArcGISDynamicMapServiceLayer} Returns a new mapdijits.layers.ArcGISDynamicMapServiceLayer Widget.
 * @param {Object} params
 * @constructor
 */
dojo.declare("mapdijits.layers.ArcGISDynamicMapServiceLayer", [mapdijits.layers.DynamicMapServiceLayer], {
	/******************************************************************
	 * Dijit Properties
	 * 	All inherited
	 */
	/******************************************************************
	 * Custom Properties
	 **/
	//NOTE: Does not accept imageParameters at this time. Instead, supply image parameter when calling exportMapImage on the embedded service
	imageParameters: new esri.layers.ImageParameters(),
	useMapTime: true,
	disableClientCaching: false,
	constructor : function (params, srcNodeRef) {
		return;
	}, 
	/******************************************************************
	 * Mapdijit Lifecycle Events
	 ******************************************************************/
	/******************************************************************
	 * Event Handlers
	 ******************************************************************/
	/******************************************************************
	 * Accessor Methods
	 ******************************************************************/
	/******************************************************************
	 * Methods
	 ******************************************************************/
	//Overiding create 
	_create: function () {
		try {
			this.layer = new esri.layers.ArcGISDynamicMapServiceLayer(this.url,{
				id: this.id,
				imageParameters: this.imageParameters,
				opacity: this.opacity,
				useMapTime: this.useMapTime,
				visible: this.visible
			});
			this.layer.setDisableClientCaching(this.disableClientCaching);
		} catch (e) {
			console.log(e);
		}
		return this.layer;
	}
});
/**
 * @classDescription This class creates a new templated ArcGIS Graphics Layer.
 * @return {mapdijits.layers.GraphicsLayer} Returns a new mapdijits.layers.GraphicsLayer Widget.
 * @param {Object} params
 * @constructor
 */
dojo.declare("mapdijits.layers.GraphicsLayer", [mapdijits.layers.Layer], {
	/******************************************************************
	 * Dijit Properties
	 * 	All inherited
	 */

	/******************************************************************
	 * Custom Properties
	 **/
	displayOnPan: true,
	constructor : function (params, srcNodeRef) {
		return;
	}, 
	/******************************************************************
	 * Mapdijit Lifecycle Events
	 ******************************************************************/
	/******************************************************************
	 * Event Handlers
	 ******************************************************************/
	/******************************************************************
	 * Accessor Methods
	 ******************************************************************/
	/******************************************************************
	 * Methods
	 ******************************************************************/
	_create: function () {
		try {
			this.layer = new esri.layers.GraphicsLayer({
				displayOnPan: this.displayOnPan,
				id: this.id,
				opacity: this.opacity,
				visible: this.visible
			});
		} catch (e) {
			console.log(e);
		}
		return this.layer;
	}
});
/**
 * @classDescription This class creates a new templated ArcGIS Feature Layer.
 * @return {mapdijits.layers.FeatureLayer} Returns a new mapdijits.layers.FeatureLayer Widget.
 * @param {Object} params
 * @constructor
 */
dojo.declare("mapdijits.layers.FeatureLayer", [mapdijits.layers.GraphicsLayer], {
	/******************************************************************
	 * Dijit Properties
	 * 	All inherited
	 */

	/******************************************************************
	 * Custom Properties
	 **/
	infoTemplate: {},
	maxAllowableOffset: 0,
	mode: "",
	outFields: [],
	tileHeight: 512,
	tileWidth: 512,
	trackIdField: "",
	useMapTime: true,
	constructor : function (params, srcNodeRef) {
		params.mode = (dojo.indexOf(["MODE_SNAPSHOT","MODE_ONDEMAND","MODE_SELECTION"], params.mode) >= 0) ? esri.layers.FeatureLayer[params.mode] : esri.layers.FeatureLayer.MODE_ONDEMAND;
		params.infoTemplate = new esri.InfoTemplate(params.infoTemplate);
		return;
	}, 
	/******************************************************************
	 * Mapdijit Lifecycle Events
	 ******************************************************************/
	/******************************************************************
	 * Event Handlers
	 ******************************************************************/
	/******************************************************************
	 * Accessor Methods
	 ******************************************************************/
	/******************************************************************
	 * Methods
	 ******************************************************************/
	_create: function () {
		try {
			this.layer = new esri.layers.FeatureLayer(this.url, {
				displayOnPan: this.displayOnPan,
				id: this.id,
				infoTemplate: (this.infoTemplate) ? this.infoTemplate : null,
				maxAllowableOffset: this.maxAllowableOffset,
				mode: this.mode, //Do validation check
				opacity: this.opacity,
				outFields: (this.outFields.length > 0) ? this.outFields : null,
				tileHeight: this.tileHeight,
				tileWidth: this.tileWidth,
				trackIdField: this.trackIdField,
				useMapTime: this.useMapTime,
				visible: this.visible
			});
		} catch (e) {
			console.log(e);
		}
		return this.layer;
	}
});
/**
 * @classDescription This is the abstract parent class for templated tiled map service layers.
 */
dojo.declare("mapdijits.layers.TiledMapServiceLayer", [mapdijits.layers.Layer], {
	/******************************************************************
	 * Dijit Properties
	 * 	All inherited
	 */

	/******************************************************************
	 * Custom Properties
	 **/
	constructor : function (params, srcNodeRef) {
		return;
	}
	/******************************************************************
	 * Mapdijit Lifecycle Events
	 ******************************************************************/
	/******************************************************************
	 * Event Handlers
	 ******************************************************************/

	/******************************************************************
	 * Accessor Methods
	 ******************************************************************/

	/******************************************************************
	 * Methods
	 ******************************************************************/
});

/**
 * @classDescription This class creates a new templated ArcGIS Tiled Map Service.
 * @return {mapdijits.layers.ArcGISTiledMapServiceLayer} Returns a new mapdijits.layers.ArcGISTiledMapServiceLayer Widget.
 * @param {Object} params
 * @constructor
 */
dojo.declare("mapdijits.layers.ArcGISTiledMapServiceLayer", [mapdijits.layers.Layer], {
	/******************************************************************
	 * Dijit Properties
	 * 	All inherited
	 */

	/******************************************************************
	 * Custom Properties
	 **/
	displayLevels: [],
	tileServers: [],
	constructor : function (params, srcNodeRef) {
		return;
	}, 
	/******************************************************************
	 * Mapdijit Lifecycle Events
	 ******************************************************************/
	/******************************************************************
	 * Event Handlers
	 ******************************************************************/
	/******************************************************************
	 * Accessor Methods
	 ******************************************************************/
	/******************************************************************
	 * Methods
	 ******************************************************************/
	_create: function () {
		try {
			this.layer = new esri.layers.ArcGISTiledMapServiceLayer(this.url,{
				displayLevels: (this.displayLevels.length > 0) ? this.displayLevels : null,
				id: this.id,
				opacity: this.opacity,
				tileServers: (this.tileServers.length > 0) ? this.tileServers : null,
				visible: this.visible
			});
		} catch (e) {
			console.log(e);
		}
		return this.layer;
	}
});

/**
 * @classDescription This class creates a templated Basemap for use with the Basemap Gallery widget.
 * @return {mapdijits.layers.Basemap} Returns a new templated Basemap Widget.
 * @param {Object} params
 * @constructor
 */
dojo.declare("mapdijits.layers.Basemap", [dijit._Widget,dijit._Templated,dijit._Contained,dijit._Container], {
	/******************************************************************
	 * Dijit Properties
	 */
	/**
	 * If widget template contains other widgets
	 * @type {Boolean}
	 */
    widgetsInTemplate: false, 
	/**
	 * Path to widget template
	 * @type {String}
	 */
	templateString: "<span dojoAttachPoint='containerNode' id='${id}'></span>",

	/******************************************************************
	 * Custom Properties
	 **/
	superclass: "mapdijits.layers.Basemap",
	thumbnailUrl: "",
	title: "",
	isContainer: true,
	constructor : function (params, srcNodeRef) {
		this.layers = [];
		this.basemap = {};
		return;
	}, 
	/******************************************************************
	 * Mapdijit Lifecycle Events
	 ******************************************************************/
	postCreate : function () {
		dojo.style(this.domNode, "display", "none");
		this.inherited("postCreate", arguments);
	}, 
	startup: function () {
		dojo.forEach(this.getChildren(), function(child){child.startup();});
		this._create();
		if (this.inherited.startup) {
			this.inherited("startup", arguments);
		}
	}, 
	/******************************************************************
	 * Event Handlers
	 ******************************************************************/

	/******************************************************************
	 * Accessor Methods
	 ******************************************************************/
	_create: function() {
		this.layers = dojo.map(dojo.filter(this.getChildren(), function(child){
			return child.declaredClass && child.declaredClass == "mapdijits.layers.BasemapLayer";
		}, this), function(layer){
			return layer.getLayer()
		});
		this.basemap = new esri.dijit.Basemap({
			id: this.id,
			layers: this.layers,
			thumbnailUrl: this.thumbnailUrl,
			title: this.title
		});
	},
	getBasemap: function(){
		return this.basemap;
	}

	/******************************************************************
	 * Methods
	 ******************************************************************/
});


/**
 * @classDescription This class creates a templated Basemap layer for use inside a templated Basemap.
 * @return {mapdijits.layers.BasemapLayer} Returns a new templated BasemapLayer Widget.
 * @param {Object} params
 * @constructor
 */
 dojo.declare("mapdijits.layers.BasemapLayer", [mapdijits.layers.Layer, dijit._Contained], {
	/******************************************************************
	 * Dijit Properties
	 * 	All inherited
	 */

	/******************************************************************
	 * Custom Properties
	 **/
	bandIds: [],
	displayLevels: [],
	isReference: false,
	type: "",
	visibleLayers: [],
	opacity: 1,
	superclass: "mapdijits.layers.BasemapLayer",
	constructor : function (params, srcNodeRef) {
		this.type = (dojo.indexOf(["BingMapsAerial","BingMapsHybrid","BingMapsRoad","OpenStreetMap"], this.type) >= 0) ? this.type : "";
		return;
	}, 
	/******************************************************************
	 * Mapdijit Lifecycle Events
	 ******************************************************************/
	/******************************************************************
	 * Event Handlers
	 ******************************************************************/
	/******************************************************************
	 * Accessor Methods
	 ******************************************************************/
	/******************************************************************
	 * Methods
	 ******************************************************************/
	_create: function () {
		try {
			this.layer = (this.type == "") ? new esri.dijit.BasemapLayer({
				url: this.url,
				bandIds: (this.bandIds.length > 0) ? this.bandIds : null,
				displayLevels: (this.displayLevels.length > 0) ? this.displayLevels : null,
				isReference: this.isReference,
				visibleLayers: (this.visibleLayers.length > 0) ? this.visibleLayers : null,
				opacity: this.opacity
			}) : new esri.dijit.BasemapLayer({
				type: this.type
			});
		} catch (e) {
			console.log(e);
		}
		return this.layer;
	}
});
