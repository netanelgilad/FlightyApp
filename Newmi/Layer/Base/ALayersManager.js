/**
* @class NeWMI.Layer.Base.ALayersManager
* <p>Layers list manager. It contains division between NeWMI.Layer.Base.ALayersManager.LayersTypes</p>
* <p>Use this class to add layers to the map, remove, update, find layers and get its data, move layers up and down the list, and much more.</p>
* @abstract
* @evented
*/
define(["dojo/_base/declare",
        "dojo/Evented",
        "dojox/collections/Dictionary",
        "dojox/collections/ArrayList",
        "NeWMI/Layer/LayersList", 
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Tool/EventObject",
        "NeWMI/Layer/TemporaryLayer"], 
        function(declare,
        		Evented,
        		Dictionary, 
        		ArrayList, 
        		LayersList, 
        		AEventsManager,
        		EventObject,
        		TemporaryLayer){
	
	var ALayersManager = declare("NeWMI.Layer.Base.ALayersManager", Evented, {
		
	    /**
        * @constructor
        * Creates new ALayersManager instance
        */
		constructor : function()
		{
			this._LayerLists = new Dictionary();
			
			for (var property in ALayersManager.LayersTypes) {
			    this._LayerLists.add(ALayersManager.LayersTypes[property], new LayersList());
			}
			
			this._layerListsBaseCount = Object.keys(ALayersManager.LayersTypes).length;
			
			// Event connections
			this.eventsMgr.connect([ AEventsManager.EMapEvents.Panning, 
			                         AEventsManager.EMapEvents.Zooming, 
			                         AEventsManager.EMapEvents.ExtentChange,
			                         AEventsManager.EMapEvents.MapLayoutChange]);
		},
		
	    ////////////////////////////
		// 		Internal Functions
	    ////////////////////////////
		
		_createLayerList : function(p_layerListType)
		{
		    if (!ALayersManager.LayersTypes.hasOwnProperty(p_layerListType))
			{			
				var objLayerList = new LayersList();
				this._LayerLists.add(p_layerListType, objLayerList);
				ALayersManager.LayersTypes[p_layerListType] = Object.keys(LayerTypes.types).length;
				return objLayerList;
			}
			
			return null;
		},
		
		_removeLayerList : function(p_layerListType)
		{
		    if (ALayersManager.LayersTypes.hasOwnProperty(p_layerListType) &&
				ALayersManager.LayersTypes[p_layerListType] > this._layerListsBaseCount - 1)
			{
		        this._LayerLists.remove(ALayersManager.LayersTypes);
		        delete ALayersManager.LayersTypes[p_layerListType];
				return true;
			}
			
			return false;
		},
		
	    ////////////////////////////
		// 		Layers Functions
	    ////////////////////////////
		
		_insertLayer : function(p_layerListType, p_objLayer, p_intIdx)
		{
			if (p_layerListType != null)
			{
				var objLayerList = this._LayerLists.item(p_layerListType);
				var objResult =  objLayerList.insert(p_objLayer, p_intIdx);
				
				if (objResult)
				{
					var eventObject = new EventObject(this);
					eventObject.type = EventObject.Type.layerInsert;
					eventObject.object = { listType: p_layerListType, layer: p_objLayer };
					eventObject.raise();
				}
				
				return objResult;
			}
			return false;
		},
		
		_removeLayer : function(p_layerListType, p_objProp)
		{
			if (p_layerListType != null)
			{
				var objLayerList = this._LayerLists.item(p_layerListType);
				var objResult = objLayerList.remove(p_objProp);
				
				if (objResult)
				{
					var eventObject = new EventObject(this);
					eventObject.type = EventObject.Type.layerRemove;
					eventObject.object = { listType: p_layerListType, layer: objLayerList.item(p_objProp) };
					eventObject.raise();
				}
				
				return objResult;
			}
			return false;
		},

		_getLayerIndex : function(p_layerListType, p_objProp)
		{
			if (p_layerListType != null)
			{
				var objLayerList = this._LayerLists.item(p_layerListType);
				return objLayerList.indexOf(p_objProp);			
			}
			return -1;
		},
		
		_getLayerCount : function(p_layerListType)
		{
			if (p_layerListType != null)
			{
				var objLayerList = this._LayerLists.item(p_layerListType);
				return objLayerList.getCount();			
			}
			return -1;
		},
		
		_getLayer : function(p_layerListType, p_objProp)
		{
			if (p_layerListType != null)
			{
				var objLayerList = this._LayerLists.item(p_layerListType);
				return objLayerList.item(p_objProp);			
			}
			return null;
		},
		
		_isLayerExists : function(p_layerListType, p_objProp)
		{
			if (p_layerListType != null)
			{
				var objLayerList = this._LayerLists.item(p_layerListType);
				return objLayerList.isExists(p_objProp);			
			}
			return false;
		},
		
		_moveLayer: function (p_layerListType, p_objProp, p_intIdx)
		{
			if (p_layerListType != null && p_intIdx < this._getLayerCount(p_layerListType))
			{
				var objLayerList = this._LayerLists.item(p_layerListType);
				var objResult = objLayerList.move(p_objProp, p_intIdx);
				
				if (objResult)
				{
					var eventObject = new EventObject(this);
					eventObject.type = EventObject.Type.layerOrder;
					eventObject.object = { listType: p_layerListType, layer: objLayerList.item(p_objProp), index: p_intIdx};
					eventObject.raise();
				}
				
				return objResult;
			}
			return false;
		},
		/*
		_setBaseLayer : function(p_objLayer, p_blnSingle)
		{
			var blnSingleBaseMap = (typeof p_blnSingle !== 'undefined') ? p_blnSingle : true;
			var objResult = false;
			
			if (!blnSingleBaseMap)
			{
				var objLayerList = this._LayerLists.item(ALayersManager.LayersTypes._BaseMap);
				var objLayer = objLayerList.item(p_objLayer);
				
				if (objLayer)
				{
					objResult = true;
					
					objLayerList.layersArrayList.forEach(function(item){
						item.newmiProps.isBase = false;
					});
					
					objLayer.newmiProps.isBase = true;
				}
			}
			else
			{
				var objLayerList = this._LayerLists.item(ALayersManager.LayersTypes._BaseMap);
				objLayerList.clear();
				
				var objLayer = objLayerList.item(p_objLayer);
				
				if (objLayer)
				{
					objResult = true;
					
					objLayer.newmiProps.isBase = true;
					objLayerList.insert(objLayer);
				}
			}
			
			if (objResult)
			{
				var eventObject = new EventObject(this);
				eventObject.type = EventObject.Type.layerBase;
				eventObject.object = { listType: ALayersManager.LayersTypes._BaseMap, layer: objLayer};
				eventObject.raise();
			}
			
			return objResult;
		},
		*/
		
		_setBaseLayer : function(p_objBaseLayer)
		{
		    var objLayerList = this._LayerLists.item(ALayersManager.LayersTypes._BaseMap);
		    objLayerList.clear();
			
			objLayerList.insert(p_objBaseLayer);
			
			var eventObject = new EventObject(this);
			eventObject.type = EventObject.Type.layerBaseMap;
			eventObject.object = { layer: p_objBaseLayer };
			eventObject.raise();
		},
		
		/*
		_getBaseLayer : function()
		{
			var objLayerList = this._LayerLists.item(ALayersManager.LayersTypes._BaseMap);
			var objLayer = null;
			
			objLayerList.layersArrayList.forEach(function(item){
				if (objLayer == null && item.newmiProps.isBase)
				{
					objLayer = item;
				}
			});
			
			return objLayer;
		},
		*/
		
	    ////////////////////////////
		//		Helper Functions 
	    ////////////////////////////
		
		_getLayerList : function(p_objLayerListType)
		{
			var objLayerList = null;
			
			if (p_objLayerListType != null && !isNaN(p_objLayerListType)) 
			{
				objLayerList = this._LayerLists.item(p_objLayerListType);
			}
			
			return objLayerList;
		},
		
		_getLayerListsCount : function()
		{
			return this._LayerLists.count;
		},
		
		_getLayerAbsoluteIndex : function(p_layerListType, p_objLayerProp)
		{
			var intIdx = -1;
			
			if (p_layerListType != null)
			{
				var objLayerList = this._LayerLists.item(p_layerListType);
				
				if (this._isLayerExists(p_layerListType, p_objLayerProp))
				{
					intIdx = 0;
					
					for(var i = 0; i < p_layerListType; i++)
					{
						intIdx += this._getLayerCount(i);
					}
					
					intIdx += this._getLayerIndex(p_layerListType, p_objLayerProp);
				}
			}
			
			return intIdx;
		},
		
		_getAbsoluteIndex : function(p_layerListType, p_intIdx)
		{
			var intIdx = -1;
			
			if (p_layerListType != null)
			{
				intIdx = 0;
				
				for(var i = 0; i < p_layerListType; i++)
				{
					intIdx += this._getLayerCount(i);
				}
				
				if (this._getLayerCount(p_layerListType) > 0 && p_intIdx != null)
				{
					intIdx += p_intIdx;
				}
				else intIdx += this._getLayerCount(p_layerListType);
			}
			
			return intIdx;
		},
	});

    /** @enum {Number} NeWMI.Layer.Base.ALayersManager.LayersTypes 
    * The types of layers in NeWMI
    */
	ALayersManager.LayersTypes = {
	    _BaseMap: 0,
	    /** Static layers type - For Engine layers such as tiled,... */
	    Static: 1,
	    /** Applicative layers type - For NeWMI Applicative layers such as NeWMI.Layer.Base.ACustomLayer,... */
	    Application: 2,
	    /** Additional layers type - For layers we want to be on top, for temporary time */
	    _Additional: 3,
	    _Feedback: 4
	};

	return ALayersManager;
});