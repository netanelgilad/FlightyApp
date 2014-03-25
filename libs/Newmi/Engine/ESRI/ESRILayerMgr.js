define(["dojo/_base/declare",
        "dojo/Deferred",
        "dojo/on",
        "NeWMI/Engine/ESRI/ESRILayer",
        "NeWMI/Layer/Base/ALayer",
        "NeWMI/Layer/Base/AEngineLayersManager"], 
        function(declare,
        		Deferred,
        		on,
        		ESRILayer, 
        		ALayer,
        		AEngineLayersManager){
	return declare("NeWMI.Engine.ESRI.LayerMgr", AEngineLayersManager,{ 
		
		"-chains-" : 
		{
			constructor: "manual"
		},
		
		constructor : function (p_objMap)
		{
			this.inherited(arguments);
		},
	
	    ////////////////////////////////
		// 		Base Functions

		_addEngineLayer : function(p_objLayer, p_intAbsIdx)
		{
			var objDeferred = new Deferred();
			
			var objEvent = on(this.map.core, "layer-add-result", function(layer,error)
			{ 
				objEvent.remove();
				
				if (error)
				{
					return objDeferred.cancel();
				}
				else
				{
					return objDeferred.resolve();
				}
			});
						
			this._addESRILayer(p_objLayer, p_intAbsIdx);
			return objDeferred.promise;
		},
		
		_removeEngineLayer : function(p_objLayer)
		{
			var objDeferred = new Deferred();
			
			var objEvent = on(this.map.core, "layer-remove", function(layer)
			{
				objEvent.remove();
				return objDeferred.resolve();
			});
			
			this._removeESRILayer(p_objLayer);
			return objDeferred.promise;
		},
		
		_moveEngineLayer : function(p_objLayer, p_intAbsIdx)
		{
			var objDeferred = new Deferred();
			
			var objEvent = on(this.map.core, "layer-reorder", function(layer, index)
			{
				objEvent.remove();

				return objDeferred.resolve();
			});
			
			this._moveESRILayer(p_objLayer, p_intAbsIdx);
			return objDeferred.promise;
		},
		
		//////////////////////////////////////////////////////////
		//	Name: Set Base Layer
		//	Input: Base Map Object
		//	Output: None
		//////////////////////////////////////////////////////////
		_setEngineBaseMap : function(p_objBaseMap)
		{
			var objDeferred = new Deferred();
			var objBaseLayerDeferred = new Deferred();
			
			var objEvent = on(this.map.core, "basemap-change", dojo.hitch(this, function()
			{ 
				objEvent.remove();
				
				objBaseLayerDeferred.promise.then(dojo.hitch(this, function(p_objBaseLayer)
				{
					return objDeferred.resolve(p_objBaseLayer);
				}));
			}));
			
			/*
			var objLayer = this._setESRIBaseMapLayer(p_objBaseMap);
			
			objLayer.newmiProps = new ALayer(p_objBaseMap.id, p_objBaseMap.title, false);
			
			this._setBaseLayer(objLayer);
			*/
			
			this._setESRIBaseMapLayer(p_objBaseMap);
			
			objBaseLayerDeferred.resolve(this.map.core.getLayer(this.map.core.layerIds[0]));
			
			return objDeferred.promise;
		},
		
		_getEngineBaseMap : function()
		{
			return this._getESRIBaseMapLayer();
		},
		
	    /////////////////////////////////
		//		ESRI Helper Functions
		
		_setESRIBaseMapLayer : function(p_objBaseMap)
		{
			/*
			var newmiBaseLayer = this._getBaseLayer();
			if (newmiBaseLayer != null)
			{
				var tempEsriLayer = this.map.core.getLayer(newmiBaseLayer.id);
				
				this.map.core.removeLayer(tempEsriLayer);
			}
			
			var objBM = new esri.layers.ArcGISTiledMapServiceLayer(p_objBaseMap.url, { "visible": true });
			
			objBM.opacity = p_objBaseMap.opacity;
			
			this.map.core.addLayer(objBM, 0);
			
			return objBM;
			
			*/
			
			this.map.core.setBasemap(p_objBaseMap.id);
			
		},
		
		_getESRIBaseMapLayer : function()
		{
			return this.map.core.getBasemap();
		},
		
		_addESRILayer : function(p_objLayer, p_intAbsIdx)
		{
			var objEsriLayer = (p_objLayer != null) 
								? (p_objLayer.newmiProps.get(ALayer.Props.isNeWMI) ? new ESRILayer(this.map, p_objLayer) : p_objLayer) 
								: null;
			
			if (objEsriLayer != null)
			{
				this.map.core.addLayer(objEsriLayer, p_intAbsIdx);
			}
		},
		
		_removeESRILayer : function(p_objLayer)
		{
			var objEsriLayer = (p_objLayer != null) 
								? (p_objLayer.newmiProps.get(ALayer.Props.isNeWMI) ? p_objLayer.containsInMaps.item(this.map.id).engineLayer : p_objLayer) 
								: null;
								
			if (objEsriLayer != null)
			{
				this.map.core.removeLayer(objEsriLayer);
			}
		},
		
		_moveESRILayer : function(p_objLayer, p_intAbsIdx)
		{
			var objEsriLayer = (p_objLayer != null) 
								? (p_objLayer.newmiProps.get(ALayer.Props.isNeWMI) ? p_objLayer.containsInMaps.item(this.map.id).engineLayer : p_objLayer) 
								: null;

			if (objEsriLayer != null)
			{
				this.map.core.reorderLayer(objEsriLayer, p_intAbsIdx);
			}
		},
		
		makeNeWMILayer : function (p_objLayer)
		{
			if (p_objLayer == null)
				return;
			
			// Incase someone forgot to newmizer the layer
			if (typeof p_objLayer.newmiProps == "undefined")
			{
				ESRILayer.makeNeWMILayer(p_objLayer);
			}
		}
		
	});
});