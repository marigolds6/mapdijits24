mapdijits is compatible with JSAPI through 2.4.

1) Install the mapdijits folder under your site root.

2) Add this property to djConfig:

	modulePaths: {
		"mapdijits": "./mapdijits"
	},

   or
   Add "mapdijits": "./mapdijits" to your existing modulePaths

See http://maps.stlouisco.com/police/index.html and http://maps.stlouisco.com/police/mapdijits/index.html for examples of usage.
(In particular, see the script at http://maps.stlouisco.com/police/loader.js)

Widgets:
BaseMap: esri.Map as a layout widget
	implements dijit.layout._LayoutWidget, dijit._Templated
	Features:
	Basemap toggle buttons
	Layer reloading on http errors to the rest endpoint
	Loading icon while waiting for map load
	map functions called by dojo.publish
	map.resize() and map.reposition() called by dojo.layout._LayoutWidget.layout()
CloudMadeLayer: CloudMade extension of ArcGIS Tiled Map Service Layer
	Features:
	Change layer style on the fly with mapdijits.CloudMadeLayer.setStyle(id/name).refresh()
	Get and set apikey, style, and tile dimension on the fly
	Retries with new tile server on tile load error
DefinitionsManager:
	Uses a query task to manage display of graphics and results
	Features:
	Passes mouse events between a ResultsPane and GraphicsManager
	Lazy load of large featuresets
	Paging of results lists for large featuresets
	Overideable functions for feature sorting, page sorting, infoWindow templates, and ResultsPane templates
	Can set definitions on multiple service layers simultaneously to handle scale dependencies
GeometryManager:
	Creates a dijit.Menu that returns from selections a geometry argument that can be passed to queries
	Features
		Menus and Submenus available
		Menu creation from a JSON argument
		Can provide geometry directly, or use a QueryTask to fetch geometry on demand
	See munis.js for an example of arguments to the addSubMenu function
GraphicsManager:
	Wrapper for esri.layer.GraphicsLayer that interacts with mapdijits.DefinitionsManager
	Features:
		Scale dependent renderers
		Can open associated InfoWindow by passing in a graphic
		Maintains an index for use with ResultsPane or DefinitionsManager
		Works with esri.Map or mapdijits.BaseMap
GraphicsManagerOpt:
	Optimized version of GraphicsManager that uses a unique identifier hash to handle a large number of graphics from a queried featureset
	Features (in addition to features of GraphicsManager:
		Uses a hash to keep created graphics in memory from previous queries to a layer
		High performance for large numbers (1000+) graphics in one layer
		Return all values in the featureset for a graphics attribute
		Return all graphics matching a value for an attribute
ResultsPane:
	Layout widget to display a set of results as divs
	Features:
		Indexed event bubbling for mouse events on contained divs
		Scroll to div by dom id
		Div styling including alternating colors and rounded corners
		Change styling of contained divs by dom id for mouseover and mouse click events
		Interacts with mapdijits.DefinitionsManager
SearchPane:
	Layout widget for a header pane with address searching capabilities
	Features:
		Can call multiple prioritized locators
		Updates locator attributes from rest endpoint or passed in arguments
		Overrideable functions for candidate sorting, projection, and display as text or graphic
		Can display configurable search help using an associated ResultPane

