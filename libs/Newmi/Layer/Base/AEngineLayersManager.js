/**
* @class NeWMI.Layer.Base.AEngineLayersManager
* <p>NeWMI collects all the layers in one manager called the layers manager.</p>
* <p>Use this class to add layers to the map, remove, update, find layers and get its data, move layers up and down the list, and much more.</p>
* Each map instance contains the property NeWMI.Map.Base.ABasicMap.layersMgr which holds the map layers manager.
* @extends NeWMI.Layer.Base.ALayersManager
* @abstract
*/
define(["dojo/_base/declare",
        "dojo/Deferred",
        "dojox/collections/Queue",
        "NeWMI/Layer/Base/ALayer",
        "NeWMI/Layer/Base/ALayersManager",
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Tool/EventObject"], 
        function(declare,
        		Deferred,
        		Queue,
        		ALayer,
        		ALayersManager,
        		AEventsManager,
        		EventObject){
	
	return declare("NeWMI.Layer.Base.AEngineLayersManager", ALayersManager, 
	{
		"-chains-" : 
		{
			constructor: "manual"
		},
		
	    /**
        * @constructor
        * Creates new ALayersManager instance
        * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map of this layers manager
        */
		constructor : function (p_objMap)
		{
		    /**
            * @property {Number} [clusterDist=50]
            *
            * The map
            * @readonly
            */
			this.map = p_objMap;
			
			this.eventsMgr = p_objMap.getEventMgr(this, this._onMapEvent);
			
			this.inherited(arguments, []);
			
			this._layersToLoadQueue = new Queue();
		},
		
	     ////////////////////////////
		 //			Events
	     ////////////////////////////
		
		_onMapEvent : function (evt)
		{
			switch (evt.eventType)
			{
				case AEventsManager.EMapEvents.Panning:
				{
					this._sendFuncToLayers(AEventsManager.EMapEvents.Panning, [evt.map, evt.extent, evt.delta]);
					break;
				}
				case AEventsManager.EMapEvents.Zooming:
				{
					this._sendFuncToLayers(AEventsManager.EMapEvents.Zooming, [evt.map, evt.extent, evt.zoomFactor, evt.anchor, evt.level]);
					break;
				}
				case AEventsManager.EMapEvents.ExtentChange:
				{
					this._sendFuncToLayers(AEventsManager.EMapEvents.ExtentChange, [evt.map, evt.extent, evt.delta, evt.levelChange, evt.lod]);
					break;
				}
			    case AEventsManager.EMapEvents.MapLayoutChange:
				{
				    this._sendFuncToLayers(AEventsManager.EMapEvents.MapLayoutChange, [evt.map, evt.width, evt.height]);
					break;
				}
			}
		},
				
	    /**
        * @method refreshAllLayers
        *
        * Refreshing all the layers
        */
		refreshAllLayers : function()
		{
			this._sendFuncToLayers("refresh");
		},
		
		_sendFuncToLayers : function(p_func, p_evtArgs)
		{
		   // var timeBefore = new Date().getTime();
		    
			for (var i = 0; i < this._getLayerListsCount(); i++){
				
				var objLayerList = this._getLayerList(i);
				
				if (objLayerList != null && objLayerList.getCount() > 0)
				{
				    for (var j = 0; j < objLayerList.getCount() ; j++) {
						
						var objLayer = objLayerList.item(j);
						
						if (typeof objLayer.newmiProps !== "undefined" && 
							objLayer.newmiProps.get(ALayer.Props.isNeWMI))
						{
							objLayer[p_func].apply(objLayer, p_evtArgs);
						}
					}
				}
			}

			/*if (p_func == "_extentChange") {
			    var timeAfter = new Date().getTime();
			    console.log((timeAfter - timeBefore) / 1000);
			}*/
		},
		
		//
		// 		Base Functions
		//
		
	    /**
        * @method insertLayer
        *
        * Insert a layer to the map
        * @param {NeWMI.Layer.Base.ALayersManager.LayersTypes} p_layerListType The layer type
        * @param {Object} p_objLayer The layer to insert
        * @param {Number} [p_intIdx] The index we want to add this layer. If not passed, it will insert it in the end of the list
        */
		insertLayer : function(p_layerListType, p_objLayer, p_intIdx)
		{
			this.makeNeWMILayer(p_objLayer);
			
			var objLayerQueueItem = { params: [p_layerListType, p_objLayer, p_intIdx], async: new Deferred() };

			// Pushing the layer to add queue
			this._layersToLoadQueue.enqueue(objLayerQueueItem);
			
			// If we have only one in the queue we are processing it
			if (this._layersToLoadQueue.count == 1)
			{
			    this._processInsertLayer(p_layerListType, p_objLayer, p_intIdx);
			}

			return objLayerQueueItem.async.promise;
		},
		
		// Handling the add layer process  
		_processInsertLayer: function (p_layerListType, p_objLayer, p_intIdx)
		{
			// Adding the layer to the engine
			var intIdx = this._getAbsoluteIndex(p_layerListType, p_intIdx);
			var process = this._addEngineLayer(p_objLayer, intIdx);

			// Waiting till the layer to be added for adding it to our lists
			process.then(dojo.hitch(this, function(p_obj)
			{
				this._insertLayer(p_layerListType, p_objLayer, p_intIdx);
			
				// Processing the next layer to add
				var objQueueLayer = this._layersToLoadQueue.dequeue();
				objQueueLayer.async.resolve();
				
				if (this._layersToLoadQueue.count > 0)
				{
				    this._processInsertLayer.apply(this, this._layersToLoadQueue.peek().params);
				}
			}));
		},
		
	    /**
        * @method removeLayer
        *
        * Remove a layer from the map
        * @param {NeWMI.Layer.Base.ALayersManager.LayersTypes} p_layerListType The layer type to remove
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        */
		removeLayer : function(p_layerListType, p_objLayerProp)
		{
			var objLayer = null;

			// Layer Object
			if (typeof p_objLayerProp.newmiProps !== "undefined" && this._isLayerExists(p_layerListType, p_objLayerProp))
			{
			    objLayer = p_objLayerProp;
			}

            // Layer ID
			else if (typeof p_objLayerProp === 'string')
			{
			    objLayer = this._getLayer(p_layerListType, p_objLayerProp);
			}

			// Layer Index
			else if (!isNaN(p_objLayerProp))
			{
			    objLayer = this._getLayer(p_layerListType, p_objLayerProp);
			}
			
			if (objLayer != null)
			{
				//---------------------------------------------
				var isOnHold = false;
				
				this._layersToLoadQueue.forEach(function(item) {
					
					if (item.params[1].newmiProps.get(ALayer.Props.id) == objLayer.newmiProps.get(ALayer.Props.id))
					{
						isOnHold = true;
						
						item.async.promise.then(dojo.hitch(this, function(p_obj)
						{
							this._processRemoveLayer(p_layerListType, p_objLayerProp, objLayer);
						}));
					}
				}, this);
				
				//---------------------------------------------
				
				if (!isOnHold)
				{
					this._processRemoveLayer(p_layerListType, p_objLayerProp, objLayer);
				}
			}
		},
		
		// Handling the remove layer process  
		_processRemoveLayer : function(p_layerListType, p_objLayerProp, p_objLayer)
		{
			var process = this._removeEngineLayer(p_objLayer);
			
			process.then(dojo.hitch(this, function(p_obj){
				
				this._removeLayer(p_layerListType, p_objLayerProp);
			}));
		},
		
		//////////////////////////////////////////////////////////
		//	Name: Set Base Layer
		//	Input: Base Map Object
		//	Output: None
		//////////////////////////////////////////////////////////
		setBaseLayer : function(p_objBaseMap)
		{
			var process = this._setEngineBaseMap(p_objBaseMap);
			
			process.then(dojo.hitch(this, function(p_objBaseLayer)
			{
				this.makeNeWMILayer(p_objBaseLayer);
				this._setBaseLayer(p_objBaseLayer);
			}));
		},
		
        //////////////////////////////////////////////////////////
		//	Name: Get Base Layer
		//	Input: None
		//	Output: Base Layer
		//////////////////////////////////////////////////////////
		getBaseLayer : function()
		{
			return this._getEngineBaseMap();
		},
		

	    /**
        * @method getLayer
        *
        * Gets a layer from the manager
        * @param {NeWMI.Layer.Base.ALayersManager.LayersTypes} p_layerListType The layer type
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @return {Object} The layer we wanted
        */
		getLayer : function(p_layerListType, p_objLayerProp)
		{
			return this._getLayer(p_layerListType, p_objLayerProp);
		},
		
	    /**
        * @method moveLayer
        *
        * Moving a layer to a different index
        * @param {NeWMI.Layer.Base.ALayersManager.LayersTypes} p_layerListType The layer type
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @param {Number} p_intIdx The index we want to move this layer to
        */
		moveLayer: function (p_layerListType, p_objLayerProp, p_intIdx)
		{
			var objLayer = null;
			var tmpIdx = this._getLayerIndex(p_layerListType, p_objLayerProp);
			var intAbsIdx = this._getAbsoluteIndex(p_layerListType, p_intIdx);
			
			// Layer Object
			if (typeof p_objLayerProp.newmiProps !== "undefined") /* && 
				p_objLayerProp.newmiProps.get(ALayer.Props.isNeWMI))*/
			{
				objLayer = p_objLayerProp;
			}
			// Layer ID
			else if (typeof p_objLayerProp === 'string') 
			{
				objLayer = this._getLayer(p_layerListType, p_objLayerProp);
			}
			// Layer Index
			else if (!isNaN(p_objLayerProp)) 
			{
				objLayer = this._getLayer(p_layerListType, p_objLayerProp);
			}
			
			if (objLayer != null && intAbsIdx > -1)
			{
				var process = this._moveEngineLayer(objLayer, intAbsIdx);
				
				process.then(dojo.hitch(this, function(p_obj){
					
					this._moveLayer(p_layerListType, p_objLayerProp, p_intIdx);
				}));
				
				
			}
		},
		
	    ////////////////////////////
		// 		Static Layers
	    ////////////////////////////
		
	    /**
        * @method insertStaticLayer
        *
        * Insert static layer to the map
        * @param {Object} p_objLayer The layer to add
        * @param {Number} p_intIdx The index we want to move this layer to
        */
		insertStaticLayer : function(p_objLayer, p_intIndex)
		{
		    return this.insertLayer(ALayersManager.LayersTypes.Static, p_objLayer, p_intIndex);
		},
		
	    /**
        * @method removeStaticLayer
        *
        * Remove a static layer 
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        */
		removeStaticLayer : function(p_objLayerProp)
		{
		    this.removeLayer(ALayersManager.LayersTypes.Static, p_objLayerProp);
		},
		
	    /**
        * @method getStaticLayer
        *
        * Gets a static layer 
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @return {Object} The layer
        */
		getStaticLayer : function(p_objLayerProp)
		{
		    return this.getLayer(ALayersManager.LayersTypes.Static, p_objLayerProp);
		},
		
	    /**
        * @method moveStaticLayer
        *
        * Moving a static layer to a specific index
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @param {Number} p_intIdx The index we want to move this layer to
        */
		moveStaticLayer : function(p_objLayerProp, p_intIdx)
		{
		    this.moveLayer(ALayersManager.LayersTypes.Static, p_objLayerProp, p_intIdx);
		},
		
	    ////////////////////////////
		// 		Application Layers
	    ////////////////////////////
		
	    /**
        * @method insertAppLayer
        *
        * Insert an applicative layer to the map
        * @param {Object} p_objLayer The layer to add
        * @param {Number} p_intIndex The index we want to move this layer to
        */
		insertAppLayer : function(p_objLayer, p_intIndex)
		{
		    return this.insertLayer(ALayersManager.LayersTypes.Application, p_objLayer, p_intIndex);
		},
		
	    /**
        * @method removeAppLayer
        *
        * Remove a applicative layer 
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        */
		removeAppLayer : function(p_objLayerProp)
		{
		    this.removeLayer(ALayersManager.LayersTypes.Application, p_objLayerProp);
		},
		
	    /**
        * @method getAppLayer
        *
        * Gets a applicative layer 
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @return {Object} The layer
        */
		getAppLayer : function(p_objLayerProp)
		{
		    return this.getLayer(ALayersManager.LayersTypes.Application, p_objLayerProp);
		},
		
	    /**
        * @method moveAppLayer
        *
        * Moving a applicative layer to a specific index
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @param {Number} p_intIdx The index we want to move this layer to
        */
		moveAppLayer : function(p_objLayerProp, p_intIdx)
		{
		    this.moveLayer(ALayersManager.LayersTypes.Application, p_objLayerProp, p_intIdx);
		},

	    /**
        * @method removeAllAppLayers
        *
        * Removing all the applicative layers
        */
		removeAllAppLayers: function () {

		    this.getAppLayersList().forEach(function (item) {
		        this.removeAppLayer(item);
		    }, this);
		    
		},
		
        ////////////////////////////
		// 		General Functions
	    ////////////////////////////
		
	    /**
        * @method getAppLayersList
        *
        * Gets the applicative layers list
        * @return {NeWMI.Layer.LayersList} The applicative layers list
        */
		getAppLayersList : function()
		{
		    return this._LayerLists.item(ALayersManager.LayersTypes.Application);
		},
		
	    /**
        * @method getStaticLayersList
        *
        * Gets the static layers list
        * @return {NeWMI.Layer.LayersList} The static layers list
        */
		getStaticLayersList : function()
		{
		    return this._LayerLists.item(ALayersManager.LayersTypes.Static);
		},

	    /**
        * @method getAppLayerIndex
        *
        * Gets applicative layer index
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @return {Number} The layer index
        */
		getAppLayerIndex : function(p_objLayerProp)
		{
		    return this._getLayerAbsoluteIndex(ALayersManager.LayersTypes.Application, p_objLayerProp);
		},
		
	    /**
        * @method getStaticLayerIndex
        *
        * Gets static layer index
        * @param {Object} p_objLayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @return {Number} The layer index
        */
		getStaticLayerIndex : function(p_objLayerProp)
		{
		    return this._getLayerAbsoluteIndex(ALayersManager.LayersTypes.Static, p_objLayerProp);
		},
		
	    /**
        * @method makeNeWMILayer
        *
        * Converting the layer to a NeWMILayer.
        * Every none NeWMI layers will be NeWMI layers once they are added to the map. In case we want to set some members before
        * it added to the map we can call this method, and it will extend the layer with newmiProps property of type NeWMI.Layer.Base.ALayer
        */
		makeNeWMILayer : function ()  { }
	});	
});