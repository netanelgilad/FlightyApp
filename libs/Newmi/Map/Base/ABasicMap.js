/**
* @class NeWMI.Map.Base.ABasicMap
* <p>Represents abstract NeWMI Map Control. All Types of NeWMI Maps (esri, Google, ...) extends this object</p>
* The object holds common properties and functionalities to all NeWMI Supported maps.
* @abstract
* <p>See also {@link NeWMI.Engine.ESRI.Map} esri Map, {@link NeWMI.Engine.Google.Map} Google Map</p>
*/
define(["dojo/_base/declare",
        "dojo/dom-geometry",
        "NeWMI/Tool/ToolsManager", 
        "NeWMI/Selection/SelectionManager", 
        "NeWMI/Service/Create/RandomSvc",
        "NeWMI/Geometry/Point",
        "NeWMI/Geometry/Rectangle",
        "NeWMI/Map/MapSvc"],
        function (declare,
                    domGeom,
					ToolsManager, 
					SelectionManager, 
					Random, 
					Point, 
					Rectangle,
                    MapSvc)
{
	
	return declare("NeWMI.Map.Base.ABasicMap", null, 
	{
		constructor: function() 
		{
		    /**
            * @property {string} id
            *
            * The Map Control Unique ID.
            * @readonly
            */
		    this.id = Random.guid();

		    /**
            * @property {String} engine
            *
            * The name of the engine we are using
            * @readonly
            */
		    this.engine = null;
		    /**
            * @property {Object} core
            *
            * The Core object of the map instance.
            * <p>The map engine instance (esri, Google, ...).</p>
            * @readonly
            */
		    this.core = null;

		    /**
            * @property {Object} div
            *
            * The map HTML div.
            * @readonly
            */
		    this.div = null;
		    /**
            * @property {NeWMI.Layer.Base.AEngineLayersManager} layersMgr
            *
            * The Layers Manager of all layers contained within the current map instance.
            * @readonly
            */
			this.layersMgr = null;
		    /**
            * @property {NeWMI.Tool.ToolsManager} toolsMgr
            *
            * The Tools Manager object of the current map.
            * @readonly
            */
			this.toolsMgr = new ToolsManager(this);
		    /**
            * @property {NeWMI.Selection.SelectionManager} selectionMgr
            *
            * The selection Manager object of the current map.
            * @readonly
            */
			this.selectionMgr = new SelectionManager(this);

		    /**
            * @property {NeWMI.Map.Base.AConversionSvc} conversionsSvc
            *
            * The conversion services related to map. Such as map to pixels, pixel to map.
            * @readonly
            */
			this.conversionsSvc = null;

		    /**
            * @property {NeWMI.Map.MapSvc} svc
            *
            * The services the map provides, such as blinking
            * @readonly
            */
			this.svc = new MapSvc(this);
			
			this._EventsManagerClass = null;
			this._savedExtents = [];
		},

		_onMapEvent : function(evt)
		{
		},
		
	    /**
		* @method getEventMgr
        * Returning new instance of the event manager
        *
		* @param {Object} p_objScope The scope of the callback function
		* @param {Function} p_fnCallback Callback for map event
        * <pre><code>
        * // Get a new instance of the events manager
        * var evMgr = map.getEventMgr(this, this.onMapEvent);
        * evMgr.connect([NeWMI.Map.Base.AEventsManager.EMapEvents.ExtentChange]);
        * .
        * .
        * function onMapEvent(evt)
        * {
        *   if (evt.eventType == AEventsManager.EMapEvents.ExtentChange) {
        *       console.log(evt.eventType);
        *   }
        * }
        * .
        * .
        * .
        * evMgr.disconnectAll();
        * </code></pre>
		*/
		getEventMgr : function (p_objScope, p_fnCallback)
		{
		    return new this._EventsManagerClass(this, p_objScope, p_fnCallback);
		},
		
	    /**
		 * @method saveExtent
         *
         * Saving the extent in the extents stack
         *
		 * @param {Boolean} [p_blnOnlyGet=false] If we want only to get the extent and not save it in the stack 
         * @return {Object} The extent
         * @return {Object} return.center The center of the map
         * @return {Number} return.center.x The X center of the map
         * @return {Number} return.center.y The Y center of the map
         * @return {Number} return.zoom The zoom of the map
		 */
		saveExtent : function(p_blnOnlyGet)
		{
			var objData = { center: this.getCenter(), zoom : this.getZoom() };
			
			if (!p_blnOnlyGet)
			{
				this._savedExtents.push(objData);
			}
			
			return objData;
		},
		
	    /**
		 * @method restoreExtent
         *
         * Saving the extent in the extents stack
         *
		 * @param {Boolean} p_blnDoNotSet If we want only to get the extent and not set the map extent to it
         * @param {Object} [p_objDrawData] If we want to set the map extent with this object
         * @param {Object} p_objDrawData.center The center of the map
         * @param {Number} p_objDrawData.center.x The X center of the map
         * @param {Number} p_objDrawData.center.y The Y center of the map
         * @param {Number} p_objDrawData.zoom The zoom of the map
         * @return {Object} The center and zoom of the extent
         * @return {Object} return.center The center of the map
         * @return {Number} return.center.x The X center of the map
         * @return {Number} return.center.y The Y center of the map
         * @return {Object} return.zoom The zoom of the map
		 */
		restoreExtent : function(p_blnDoNotSet, p_objDrawData) {
			if (this._savedExtents.length == 0)
				return;
			
			var objData = p_objDrawData;
			
			if (!objData)
			{
				objData = this._savedExtents.pop();
			}			
			
			if (!p_blnDoNotSet)
			{
				this.setPosition(objData.center.x, objData.center.y, objData.zoom);
			}
			
			return objData;
		},
		
	    /**
		 * @method layoutChanged
         *
         * Notifying the map that it's layout has been changed
         */
		layoutChanged: function () {
		    this._elementLayout = null;
		},

	    /**
		 * @method getControlLayout
         *
         * Gets the map control layout
         *
         * @return {Object} The map control layout
         * @return {Number} return.x The map control X position
         * @return {Number} return.y The map control y position
         * @return {Number} return.width The map control width
         * @return {Number} return.height The map control height
         */
		getControlLayout: function (p_blnForceCalc) {
		    if (p_blnForceCalc || !this._elementLayout) {

		        var objData = domGeom.position(this.div, true);

		        this._elementLayout = {
		            x: objData.x,
		            y: objData.y,
		            width: objData.w,
		            height: objData.h
		        };

		        //console.log(this._elementLayout);
		    }

		    return this._elementLayout;
		},

	    /**
        * @method enablePan
        * Enabling the map panning mode - navigation
        */
		enablePan: function () { },
	    /**
        * @method disablePan
        * Disabling the map panning mode - navigation
        */
		disablePan: function () { },
	    /**
        * @method getExtent
        * Returning the map extent - the visible area
        * @return {NeWMI.Geometry.Rectangle} The map extent
        */
		getExtent: function () { return new Rectangle({ xmin: -180, xmax: 180, ymin: -90, ymax: 90 }); },
	    /**
        * @method setExtent
        * Set the map extent - the visible area
        * @param {NeWMI.Geometry.Rectangle} The wanted map extent
        * <pre><code>
        * var extentToSet = new NeWMI.Geometry.Rectangle({ xmin: -180, xmax: 180, ymin: -90, ymax: 90 });
        * map.setExtent(extentToSet);
        * </code></pre>
        */
		setExtent: function (p_objExtent) { },
	    /**
        * @method getCenter
        * Returning the center of the map
        * @return {Object} The map center
        * @return {Number} return.x The map X center
        * @return {Number} return.y The map Y center
        */
		getCenter: function () { return { "x": 0, "y": 0 } },
	    /**
        * @method setCenter
        * Setting the center of the map
        * @param {Number} p_dblX The map X center
        * @param {Number} p_dblY The map Y center
        */
		setCenter: function (p_dblX, p_dblY) { },
	    /**
        * @method getZoom
        * Returning the zoom of the map
        * @return {Number} The map zoom
        */
		getZoom: function () { return 0; },
	    /**
        * @method setZoom
        * Setting the map zoom
        * @param {Number} p_intZoom The wanted map zoom
        */
		setZoom: function (p_intZoom) { },
	    /**
        * @method setPosition
        * Setting the position of the map - With center point and zoom
        * @param {Number} p_dblX The wanted map X center
        * @param {Number} p_dblY The wanted map Y center
        * @param {Number} p_intZoom The wanted map zoom
        */
		setPosition: function (p_dblX, p_dblY, p_intZoom) { },

	    /**
        * @method setCursor
        * Setting the map cursor
        * @param {String} p_strCursor The wanted cursor URL
        */
		setCursor: function (p_strCursor) { },

	    /**
        * @method setZoomControls
        * Enable\disable the zoom controls on the map
        * @param {Boolean} p_blnVal If true, the zoom controls will be shown on the map
        */
		setZoomControls: function (p_blnVal) { },

	    /**
        * @method setPanControls
        * Enable\disable the pan controls on the map
        * @param {Boolean} p_blnVal If true, the pan controls will be shown on the map
        */
		setPanControls: function (p_blnVal) { },
	});
});