/**
* @class NeWMI.Engine.Google.Map
* <p>Represents Google NeWMI Map Control.
* The object holds common properties and functionalities to all NeWMI Supported maps.
* @extends NeWMI.Map.Base.ABasicMap
*/
define(["dojo/_base/declare",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/on",
        "dojo/dom-geometry",
        "NeWMI/Map/Base/ABasicMap",
        "NeWMI/Layer/Base/ACustomLayer",
        "NeWMI/Engine/Google/GoogleConversions",
        "NeWMI/Engine/Google/GoogleEventsMgr",
        "NeWMI/Engine/Google/GoogleLayerMgr",
        "NeWMI/Geometry/Point",
        "NeWMI/Geometry/Rectangle",
        "NeWMI/Map/Base/AEventsManager"],
        function(declare, 
        		dom, 
        		domConstruct,
        		on,
        		domGeom,
        		ABasicMap,
        		ACustomLayer,
        		GoogleConversions,
        		GoogleEventsManager,
        		GoogleLayerMgr,
        		Point,
        		Rectangle,
                AEventsManager) {
	
	return declare("NeWMI.Engine.Google.Map", ABasicMap, 
	{
	    /**
         * @constructor
         * Creates new Google map instance
		 * @param {String|Object} p_htmlElement The div or it's id who will contains the map control
		 * @param {Object} p_objConfig Configuration for showing up the map control
         * @param {Boolean} p_objConfig.zoomSlider Showing\Hiding the zoom slider on the map
         * @param {Boolean} p_objConfig.panArrows Showing\Hiding the pan arrows controls on the map
         * @param {Function} p_objConfig.mapReadyCallback Callback for map ready event
		 */
	    constructor: function (p_htmlElement, p_objConfig)
		{
			try
			{
				this.engine = 'google';
				
				this.div = p_htmlElement;

				if (typeof p_htmlElement == 'string')
				    this.div = dom.byId(p_htmlElement);
				
				this._cfg = {

				    zoomSlider: false,
				    panArrows: false,
				    mapReadyCallback: null
				};

				if (p_objConfig != null) {
				    this._cfg.zoomSlider = p_objConfig.zoomSlider || false;
				    this._cfg.panArrows = p_objConfig.panArrows || false;
				    this._cfg.mapReadyCallback = p_objConfig.mapReadyCallback || null;
				}

				var mapOptions = 
				{
					/*mapTypeControl: false,
					streetViewControl: false,*/
					panControl: this._cfg.panArrows,
					zoomControl: this._cfg.zoomSlider,
					noClear: true
					,disableDefaultUI : true
					//,mapTypeId: google.maps.MapTypeId.ROADMAP
				};
							
				this.core = new google.maps.Map(this.div, mapOptions);
				
								
				this._EventsManagerClass = GoogleEventsManager;
				
				this.conversionsSvc = new GoogleConversions(this);
				this.layersMgr = new GoogleLayerMgr(this);
				
				this._isBoundsAlwaysUpdated = true;

				this._eventsMgr = new GoogleEventsManager(this, this, this._onMapEvent);
				this._eventsMgr.connect([AEventsManager.EMapEvents.MapLayoutChange]);				
			}
			catch(ex)
			{
			    NeWMI.Log.error(ex.message);
			}
		},
		
		enablePan : function()
		{
			this.core.setOptions({ draggable : true });
		},
		
		disablePan : function()
		{
			this.core.setOptions({ draggable : false });
		},
		
		_onMapEvent : function ()
		{
		},
		
		setExtent : function(p_objExtent)
		{
			var sw = new google.maps.LatLng(p_objExtent.getYMin(), p_objExtent.getXMin());
			var ne = new google.maps.LatLng(p_objExtent.getYMax(), p_objExtent.getXMax());
			
			var extent = new google.maps.LatLngBounds(sw, ne);

			this.core.fitBounds(extent);
		},
		
		getExtent : function()
		{
			
			var objBounds = this.core.getBounds();
			var objNE = objBounds.getNorthEast();
			var objSW = objBounds.getSouthWest();
			
			var dblOffsetX = 0;
			if (objNE.lng() < objSW.lng())
			{
				dblOffsetX = 360;
			}

			var rect = new Rectangle({
			    xCenter: (objSW.lng() + objNE.lng() + dblOffsetX) / 2,
			    yCenter: (objSW.lat() + objNE.lat()) / 2, width: objNE.lng() + dblOffsetX - objSW.lng(),
			    height: objNE.lat() - objSW.lat()
			});

			return rect;
		},
		
		getCenter : function()
		{
			var objCenterGeo = this.core.getCenter();
			
			return { "x": objCenterGeo.lng(), "y": objCenterGeo.lat() };
		},
		
		setCenter : function(p_dblX, p_dblY)
		{
			var objNewCenter = new google.maps.LatLng(p_dblY, p_dblX);
			
			this.core.setCenter(objNewCenter);
		},
		
		layoutChanged : function()
		{
		    this.inherited(arguments);

		    google.maps.event.trigger(this.core, 'resize');
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
			var objCenterGeo = this.core.getCenter();
			
			return 156543.03392 * Math.cos(objCenterGeo.lat() * Math.PI / 180) / Math.pow(2, this.getZoom());
		},
		
		setScale : function(scale)
		{
			
		},
		
		setPosition : function(p_dblX, p_dblY, p_intZoom)
		{
			this.core.setOptions( { center : new google.maps.LatLng(p_dblY, p_dblX), 
									zoom : p_intZoom });
		},
		
		setDoubleClickZoomState : function(p_blnEnable)
		{
			this.core.setOptions( { disableDoubleClickZoom : !p_blnEnable });
			
			//this.core.disableDoubleClickZoom = p_blnEnable;
			/*if (p_blnEnable)
			{
				this.core.enableDoubleClickZoom();
			}
			else
			{
				this.core.disableDoubleClickZoom();
			}*/
		},
		
		setCursor : function (p_strCursor)
		{
			var myDiv = this.core.getDiv();
			myDiv.style.cursor = p_strCursor;
		}
	});
});