/**
* @class NeWMI.Engine.ESRI.Map
* <p>Represents esri NeWMI Map Control.
* The object holds common properties and functionalities to all NeWMI Supported maps.
* @extends NeWMI.Map.Base.ABasicMap
*/
define(["dojo/_base/declare",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/on",
        "esri/map",
        "esri/geometry/Point",
        "esri/geometry/Extent",
        "esri/toolbars/draw",
        "NeWMI/Map/Base/ABasicMap",
        "NeWMI/Layer/Base/ACustomLayer",
        "NeWMI/Engine/ESRI/ESRILayer",
        "NeWMI/Engine/ESRI/ESRIEventsMgr",
        "NeWMI/Engine/ESRI/ESRIConversions",
        "NeWMI/Engine/ESRI/ESRILayerMgr",
        "NeWMI/Geometry/Point",
        "NeWMI/Geometry/Rectangle",
        "NeWMI/Map/Base/AEventsManager"],
        function(declare, 
        		dom, 
        		domConstruct,
        		on,
        		esriMap,
        		esriPoint,
        		esriExtent,
       		 	esriToolbarDraw,
        		ABasicMap,
        		ACustomLayer,
        		ESRILayer,
        		ESRIEventsManager,
        		ESRIConversions,
        		ESRILayerMgr,
        		Point,
        		Rectangle,
        		AEventsManager) {
	
	return declare("NeWMI.Engine.ESRI.Map", ABasicMap, 
	{
		
	    /**
         * @constructor
         * Creates new esri map instance
		 * @param {String|Object} p_htmlElement The div or it's id who will contains the map control
		 * @param {Object} p_objConfig Configuration for showing up the map control
         * @param {Boolean} p_objConfig.zoomSlider Showing\Hiding the zoom slider on the map
         * @param {Boolean} p_objConfig.panArrows Showing\Hiding the pan arrows controls on the map
         * @param {Function} p_objConfig.mapReadyCallback Callback for map ready event
		 */
		constructor: function(p_htmlElement, p_objConfig) 
		{
			try
			{
				this._cfg = {
						
					zoomSlider: false,
					panArrows: false,
					mapReadyCallback: null
				};
				
				if (p_objConfig != null)
				{
				    this._cfg.zoomSlider = p_objConfig.zoomSlider || false;
				    this._cfg.panArrows = p_objConfig.panArrows || false;
				    this._cfg.mapReadyCallback = p_objConfig.mapReadyCallback || null;
				}
				
				this.engine = 'esri';
				
				this.div = p_htmlElement;
				
				if (typeof p_htmlElement == 'string')
				    this.div = dom.byId(p_htmlElement);
				
				this.core = new esriMap(this.div, {
						//center : [ 35.8, 32.5 ],
						//zoom : 5,
						wrapAround180 : false,
						logo:false,
						fadeOnZoom: true,
						navigationMode: "css-transforms",
						nav: this._cfg.panArrows || false,
						slider: this._cfg.zoomSlider || false,
						sliderOrientation: "vertical",
						sliderPosition: "top-left",
						sliderStyle: "large"
					});
				
				this.conversionsSvc = new ESRIConversions(this);
				this.core.spatialReference = this.conversionsSvc.getMainSR();

				this._isWaitTillExtentChanged = false;

				//this.core.enablePan();
				//this.core.enableScrollWheelZoom();
				
				esriConfig.defaults.map.panDuration = 100; // time in milliseconds, default panDuration: 250
				esriConfig.defaults.map.panRate = 1; // default panRate: 25
				esriConfig.defaults.map.zoomDuration = 100; // default zoomDuration: 500
				esriConfig.defaults.map.zoomRate = 1;

				this.setExtent(new Rectangle({ xmin: -180, xmax: 180, ymin: -90, ymax: 90 }));
				
				this._EventsManagerClass = ESRIEventsManager;
				this._eventsMgr = new ESRIEventsManager(this, this, this._onMapEvent);
				this._eventsMgr.connect([AEventsManager.EMapEvents.ExtentChange, AEventsManager.EMapEvents.MapLayoutChange]);

				this.layersMgr = new ESRILayerMgr(this);
				
				this._isBoundsAlwaysUpdated = false;
								
				var handle = on(this.core, "load", dojo.hitch(this, function(){
					
					handle.remove();
					
					if (this._cfg.mapReadyCallback != null)
					{
					    this._cfg.mapReadyCallback.call(this);
					}
				}));
			}
			catch(ex)
			{
			    NeWMI.Log.error(ex.message);
			}
		},
		
		enablePan : function()
		{
			this.core.enablePan();
		},
		
		disablePan : function(p_blnIsInPanning)
		{
			if (p_blnIsInPanning)
				this.core.navigationManager.mouseEvents.onMouseUp();
			else
				this.core.disablePan();
		},
		
		setExtent : function(p_objExtent, p_blnCallingFromTimer)
		{
		    if (this._isWaitTillExtentChanged)
		        return;

		    if (p_blnCallingFromTimer)
		        this._isWaitTillExtentChanged = true;

			var extent = new esriExtent();
			extent.xmin = p_objExtent.getXMin();
			extent.xmax = p_objExtent.getXMax();
			extent.ymin = p_objExtent.getYMin();
			extent.ymax = p_objExtent.getYMax();
			
			this.core.setExtent(extent, true);
		},
		
		getCenter : function()
		{
			var objCenterGeo = this.core.extent.getCenter();
			
			return { "x": objCenterGeo.x, "y": objCenterGeo.y };
		},
		
		setCenter: function (p_dblX, p_dblY, p_blnCallingFromTimer)
		{
		    if (this._isWaitTillExtentChanged)
		        return;

		    if (p_blnCallingFromTimer)
		        this._isWaitTillExtentChanged = true;

			var objNewCenter = new esriPoint(p_dblX, p_dblY);
			this.core.centerAt(objNewCenter);
		},
		
		resize : function()
		{
		    this._divLayout = null;
			this.core.resize.apply(this.core, arguments);
		},
		
		getExtent : function()
		{
		    return new Rectangle({
		        xmin: this.core.extent.xmin,
		        ymin: this.core.extent.ymin,
		        xmax: this.core.extent.xmax,
		        ymax: this.core.extent.ymax
		    });
		},
		
		getZoom : function()
		{
			return this.core.getZoom();
		},
		
		setZoom : function(p_intZoom)
		{
			return this.core.setZoom(p_intZoom);
		},
		
		getScale : function()
		{
			return this.core.getScale();
		},
		
		setScale : function(scale)
		{
			this.core.setScale(scale);
		},
		
		setPosition : function(p_dblX, p_dblY, p_intZoom)
		{
			this.core.centerAndZoom(new esriPoint(p_dblX, p_dblY), p_intZoom);
		},
		
		setCursor : function (p_strCursor)
		{
			this.core.setMapCursor(p_strCursor);
		},
		
		setZoomControls : function (p_bln)
		{
			if (p_bln)
			{
				this.core.showZoomSlider();
			}
			else
			{
				this.core.hideZoomSlider();
			}
		},
		
		setPanControls : function (p_bln)
		{
			if (p_bln)
			{
				this.core.showPanArrows();
			}
			else
			{
				this.core.hidePanArrows();
			}
		},
		
		layoutChanged : function()
		{
		    this.inherited(arguments);

		    this.core.reposition();
		    this.core.resize(true);
		},
		
		setDoubleClickZoomState : function(p_blnEnable)
		{
			if (p_blnEnable)
			{
				this.core.enableDoubleClickZoom();
			}
			else
			{
				this.core.disableDoubleClickZoom();
			}
		},
		
		_onMapEvent : function(evt)
		{
		    if (evt.eventType == AEventsManager.EMapEvents.ExtentChange) {
		        this._isWaitTillExtentChanged = false;
		    }
		}
	});
});