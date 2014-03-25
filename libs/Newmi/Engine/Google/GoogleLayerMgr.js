define(["dojo/_base/declare",
        "dojo/Deferred",
        "dojo/dom-style",
        "dojo/on",
        "NeWMI/Layer/Base/ALayersManager",
        "NeWMI/Layer/Base/AEngineLayersManager",
        "NeWMI/Engine/Google/GoogleLayer",
        "NeWMI/Layer/Base/ALayer"], 
        function(declare,
        		Deferred,
        		domStyle,
        		on,
        		ALayersManager,
        		AEngineLayersManager,
        		GoogleLayer,
        		ALayer)
{
	return declare("NeWMI.Engine.Google.LayerMgr", AEngineLayersManager,{ 
		
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
			var objGoogleLayer = (p_objLayer != null) ? 
					(p_objLayer.newmiProps.get(ALayer.Props.isNeWMI) ? new GoogleLayer(this.map, p_objLayer, p_intAbsIdx) : p_objLayer) 
			: null;
			
			var objDeferred = new Deferred();
					
			if (objGoogleLayer != null)
			{
				dojo.connect(objGoogleLayer, "onAdd", this, function(){
				    
					return objDeferred.resolve();
				});
				
				this._addGoogleLayer(objGoogleLayer, p_intAbsIdx);
				
				return objDeferred.promise;
			}
			
			return objDeferred.cancel();
		},
		
		_removeEngineLayer : function(p_objLayer)
		{
			var objGoogleLayer = null;
			
			if (p_objLayer)
			{
				if (p_objLayer.newmiProps.get(ALayer.Props.isNeWMI))
				{
					objGoogleLayer = p_objLayer.containsInMaps.item(this.map.id).engineLayer;
				}
				else
				{
					objGoogleLayer = p_objLayer;
				}
			}
			
			var objDeferred = new Deferred();
			
			if (objGoogleLayer != null)
			{
				dojo.connect(objGoogleLayer, "onRemove", this, function(){
				    
					return objDeferred.resolve();
				});
				
				this._removeGoogleLayer(objGoogleLayer);
				
				return objDeferred.promise;
			}
			
			return objDeferred.cancel();
		},
		
		_moveEngineLayer : function(p_objLayer, p_intAbsIdx)
		{
			var objDeferred = new Deferred();
			this._moveGoogleLayer(p_objLayer, p_intAbsIdx);
			return objDeferred.resolve();
		},
		
		//////////////////////////////////////////////////////////
		//	Name: Set Base Layer
		//	Input: Base Map Object
		//	Output: None
		//////////////////////////////////////////////////////////
		_setEngineBaseMap : function(p_objBaseMap)
		{
			/*
			var objLayer = this._setGoogleBaseMapLayer(p_objBaseMap);
			
			if (objLayer != null)
			{
				objLayer.newmiProps = new ALayer(p_objBaseMap.id, p_objBaseMap.title, false);
			
				this._setBaseLayer(objLayer);
			}
			*/
			
			var objDeferred = new Deferred();
			google.maps.event.addListener(this.map.core, "maptypeid_changed", dojo.hitch(this, function(){ 
				
				return objDeferred.resolve();
			}));
			
			this._setGoogleBaseMapLayer(p_objBaseMap);
			return objDeferred.promise;
		},
		
		_getEngineBaseMap : function()
		{
			return this._getGoogleBaseMapLayer();
		},
		
	    /////////////////////////////////
		// 		Google Helper Functions
		
		_setGoogleBaseMapLayer : function(p_objBaseMap)
		{
			this.map.core.setMapTypeId(p_objBaseMap.id);
		    
			/*
			var objLayerList = this._getLayerList(ALayersManager.LayersTypes._BaseMap);
			var objLayer = objLayerList.item(0);
			
			if (objLayer)
			{
				//var objGoogleLayer = objLayer.containsInMaps.item(this.map.id).engineLayer;
				objLayer.setMap(null);
			}
			
			var dynamap = new gmaps.ags.MapOverlay(p_objBaseMap.url);
			dynamap.setMap(this.map.core);
			
			return dynamap;
			*/
		},
		
		_getGoogleBaseMapLayer : function(p_objBaseMap)
		{
			return this.map.core.getMapTypeId();
		},
		
		_addGoogleLayer : function(p_objGooleLayer, p_intAbsIdx)
		{
			p_objGooleLayer.setMap(this.map.core);
		},
		
		_removeGoogleLayer : function(p_objGooleLayer)
		{
			p_objGooleLayer.setMap(null);
		},
		
		_moveGoogleLayer : function(p_objLayer, p_intAbsIdx)
		{
			var objGoogleLayer = (p_objLayer != null) 
				? (p_objLayer.newmiProps.get(ALayer.Props.isNeWMI) ? p_objLayer.containsInMaps.item(this.map.id).engineLayer : p_objLayer) 
				: null;

			if (objGoogleLayer != null)
			{
				var oldPos = objGoogleLayer.pos;
				var objLayerList = this.getAppLayersList();
				
				var absStartIdx = this._getAbsoluteIndex(ALayersManager.LayersTypes.Application, 0);
				
				if (oldPos < p_intAbsIdx)
				{
					for(var i = oldPos - absStartIdx; i <= p_intAbsIdx - absStartIdx; i++)
					{
					    var objItem = objLayerList.item(i);

					    if (objItem) {
					        var objLayerMapData = objLayerList.item(i).containsInMaps.item(this.map.id);
					        var tmpObjLayer = objLayerMapData.engineLayer;

					        tmpObjLayer.pos--;
					        domStyle.set(objLayerMapData.div.id, "z-index", tmpObjLayer.pos);
					    }
					}
				}
				else
				{
					for(var i = p_intAbsIdx - absStartIdx; i <= oldPos - absStartIdx; i++)
					{
					    var objItem = objLayerList.item(i);

					    if (objItem) {
					        var objLayerMapData = objItem.containsInMaps.item(this.map.id);

					        var tmpObjLayer = objLayerMapData.engineLayer;

					        tmpObjLayer.pos++;
					        domStyle.set(objLayerMapData.div.id, "z-index", tmpObjLayer.pos);
					    }
					}
				}
				
				var objLayerDiv = objGoogleLayer.customLayer.getLayerDiv(this.map);

				domStyle.set(objLayerDiv.id, "z-index", p_intAbsIdx);
				objGoogleLayer.pos = p_intAbsIdx;				
				
			}
			
		},
		
		makeNeWMILayer : function (p_objLayer)
		{
			if (p_objLayer == null)
				return;
			
			// Incase someone forgot to newmizer the layer
			if (typeof p_objLayer.newmiProps == "undefined")
			{
				GoogleLayer.makeNeWMILayer(p_objLayer);
			}
		}
	});
});