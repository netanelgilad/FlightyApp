define(["dojo/_base/declare",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/on",
        "dojo/dom-geometry",
        "NeWMI/Map/Base/ABasicMap",
        "NeWMI/Layer/Base/ACustomLayer",
        //"NeWMI/Engine/OpenLayers/OpenLayersConversions",
        //"NeWMI/Engine/OpenLayers/OpenLayersEventsMgr",
        //"NeWMI/Engine/OpenLayers/OpenLayersLayerMgr",
        "NeWMI/Geometry/Point",
        "NeWMI/Geometry/Rectangle"], 
        function(declare, 
        		dom, 
        		domConstruct,
        		on,
        		domGeom,
        		ABasicMap,
        		ACustomLayer,
        		//OpenLayersConversions,
        		//OpenLayersEventsManager,
        		//OpenLayersLayerMgr,
        		Point,
        		Rectangle){
	
	return declare("NeWMI.Engine.OpenLayers.Map", ABasicMap, 
	{
	
		constructor: function(p_htmlElement, p_hMapReady) 
		{
			try
			{
				this.engine = 'open_layers';
				
				var htmlElement = p_htmlElement;
				
				if (typeof p_htmlElement == 'string')
					htmlElement = dom.byId(p_htmlElement);
							
				this.core = new OpenLayers.Map((htmlElement, mapOptions));
								
				
				this._EventsManagerClass = GoogleEventsManager;
				
				this.conversionsSvc = new GoogleConversions(this);
				this.layersMgr = new GoogleLayerMgr(this);
				
				this._isBoundsAlwaysUpdated = true;
				
				this._updateControlSizeMembers();
				
				google.maps.event.addListener(this.core.getDiv(), 'resize', dojo.hitch(this, this.onMapResize));
				
			}
			catch(ex)
			{
				console.log(ex.message);
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
		
		onMapResize : function()
		{
			this._updateControlSizeMembers();
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
			
			var rect = new Rectangle(NeWMI.Service.Create.GeometrySvc.CreateRectangleInitObject((objSW.lng() + objNE.lng() + dblOffsetX) / 2,
            (objSW.lat() + objNE.lat()) / 2, objNE.lng() + dblOffsetX - objSW.lng(),
            objNE.lat() - objSW.lat()));

			return rect;
		},
		
		getCenter : function()
		{
			var objCenterGeo = this.core.getCenter();
			
			return {"x" :objCenterGeo.lng(), "y": objCenterGeo.lat()};
		},
		
		setCenter : function(p_dblX, p_dblY)
		{
			var objNewCenter = new google.maps.LatLng(p_dblY, p_dblX);
			
			this.core.setCenter(objNewCenter);
		},
		
		resize : function()
		{
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
		
		setCursor : function (p_strCursor)
		{
			var myDiv = this.core.getDiv();
			myDiv.style.cursor = p_strCursor;
		}
	});
});