/**
* @class NeWMI.Layer.LayersList
* <p>A ordered layers list collection which provides methods for handling it</p>
* @evented
*/
define(["dojo/_base/declare",
         "dojox/collections/Dictionary", 
         "dojox/collections/ArrayList",
         "dojo/Evented",
         "NeWMI/Service/Create/RandomSvc",
         "NeWMI/Layer/Base/ALayer",
         "NeWMI/Tool/EventObject"],
         function(declare, 
        		 Dictionary, 
        		 ArrayList,
                 Evented,
        		 RandomSvc, 
        		 ALayer,
                 EventObject) {
    return declare("NeWMI.Layer.LayersList", Evented, {

        /**
        * @constructor
        * Creates new LayersList instance
        * @param {String} p_strID The id of the layers list
        */
        constructor: function (p_strID) {

            this.id = p_strID || "Layer_" + RandomSvc.guid();

            this.layersDictionary = new Dictionary();
            this.layersArrayList = new ArrayList();

            this.silentMode = false;
        },

        /**
        * @method insert
        *
        * Inserting a given layer to the layers list
        * @param {Object} p_objLayer The layer to insert
        * @param {Number} [p_intIdx] The index we want to add this layer. If not passed, it will insert it in the end of the list
        */
		insert : function(p_objLayer, p_LayerIndex) {
			
			var blnResult = false;
			
			if (p_objLayer != null && typeof p_objLayer === 'object')
			{	
			    if (!this.isExists(p_objLayer))
				{
			        // Adds the layer to the ArrayList to keep track of indices
					if (p_LayerIndex != null && p_LayerIndex <= this.getCount()) {
					    this.layersArrayList.insert(p_LayerIndex, p_objLayer);
					} else {
					    p_LayerIndex = this.layersArrayList.count;
					    this.layersArrayList.add(p_objLayer);
					}

					// Adds the layer to the Dictionary with the key as the layer ID
					this.layersDictionary.add(p_objLayer.newmiProps.get(ALayer.Props.id), p_objLayer);
					
					if (!this.silentMode) {
					    // Raising on added layer event
					    EventObject.raise(this, EventObject.Type.layerInsert, { layer: p_objLayer, index: p_LayerIndex });
					}

					blnResult = true;
				}
			}
			
			return blnResult;
		},
		
        /**
        * @method remove
        *
        * Remove a layer from the map
        * @param {Object} p_LayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        */
		remove : function(p_LayerProp) {
			
			var blnResult = false;
			
			var objLayer = this.item(p_LayerProp);

			if (objLayer != null)
			{
			    blnResult = this.layersDictionary.remove(objLayer.newmiProps.get(ALayer.Props.id));

			    if (blnResult) {
			        this.layersArrayList.remove(objLayer);

			        if (!this.silentMode) {
			            // Raising on removed layer event
			            EventObject.raise(this, EventObject.Type.layerRemove, { layer: objLayer });
			        }

			        blnResult = true;
			    }
			}
			
			return blnResult;
		},

        /**
        * @method item
        *
        * Gets the layer by one of its properties
        * @param {Object} p_LayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @return The wanted layer
        */
		item : function(p_LayerProp) {
			
			var objLayer = null;
			
			// Layer Object
			if (p_LayerProp != null && typeof p_LayerProp === 'object')
			{
				objLayer = p_LayerProp;
			}
			// Layer ID
			else if (p_LayerProp != null && typeof p_LayerProp === 'string') 
			{
			    objLayer = this.layersDictionary.item(p_LayerProp);
			}
			// Layer Index
			else if (p_LayerProp != null && !isNaN(p_LayerProp)) 
			{
			    objLayer = this.layersArrayList.item(p_LayerProp);
			}
			
			return objLayer;
		},
		
        /**
        * @method move
        *
        * Moving a layer to a different index
        * @param {Object} p_LayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @param {Number} p_intIdx The index we want to move this layer to
        */
		move : function(p_LayerProp, p_intIdx)
		{
			var blnResult = false;
			
			var objLayer = this.item(p_LayerProp);

			if (objLayer)
			{
				this.layersArrayList.remove(objLayer);
				this.layersArrayList.insert(p_intIdx, objLayer);

				if (!this.silentMode) {
				    EventObject.raise(this, EventObject.Type.layerMove, { layer: objLayer, index: p_intIdx });
				}

				blnResult = true;
			}

			return blnResult;
		},
		
        /**
        * @method clear
        *
        * Removing all the layers
        */
		clear: function()
		{
		    var arrLayers = this.layersArrayList.toArray();
		    
			this.layersDictionary.clear();
			this.layersArrayList.clear();

			if (!this.silentMode) {
			    // Raising on removed layer event
			    EventObject.raise(this, EventObject.Type.layerRemovedAll, { layers: arrLayers });
			}
		},
		
        /**
        * @method indexOf
        *
        * Returning the layer index
        * @param {Object} p_LayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @return {Number} The layer index
        */
		indexOf: function (p_LayerProp)
		{
			// Layer Object
			if (p_LayerProp != null && typeof p_LayerProp === 'object')
			{
				return this.layersArrayList.indexOf(p_LayerProp);
			}
			// Layer ID
			else if (p_LayerProp != null && typeof p_LayerProp === 'string') 
			{
				var objLayer = this.layersDictionary.item(p_LayerProp);
				return this.layersArrayList.indexOf(objLayer);
			}
			
			return -1;
		},
		
        /**
        * @method isExists
        *
        * Checking If the layer exists in the layers list
        * @param {Object} p_LayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        * @return {Boolean} If the layer exists in the layers list
        */
		isExists : function(p_LayerProp)
		{
			// Layer Object
			if (p_LayerProp != null && typeof p_LayerProp === 'object')
			{
				//return this.layersArrayList.contains(p_LayerProp);
				return this.layersDictionary.containsValue(p_LayerProp);
			}
			// Layer ID
			else if (p_LayerProp != null && typeof p_LayerProp === 'string') 
			{
				return this.layersDictionary.containsKey(p_LayerProp);
			}
			// Layer Index
			else if (p_LayerProp != null && !isNaN(p_LayerProp)) 
			{
			    return p_LayerProp < this.getCount();
			}
			
			return false;
		},
		
        /**
        * @method getCount
        *
        * Returns the layers count in the list
        * @return {Number} The layers count in the list
        */
		getCount : function()
		{
			return this.layersDictionary.count;
		},

        /**
       * @method getAllLayers
       *
       * Returns all the layers in the list, including all the nested layers in case of NeWMI.Layer.GroupLayer.
       * @param {NeWMI.Layer.LayersList} [p_objFather=this] The layers list to get its layers
       * @return {Object[]} All the layers
       */
	    getAllLayers: function (p_objFather) {
	        var retVal = [];
	        if (p_objFather == null) {
	            p_objFather = this;
	        }

	        p_objFather.layersArrayList.forEach(function (item) {
	            if (item.getAllLayers) {
	                retVal.push.apply(retVal, item.getAllLayers(item));
	            }
	            else {
	                retVal.push(item);
	            }
	        }, this);

	        return retVal;
	    },

        /**
       * @method forEach
       * Running over all the sons layers in a loop
       * @param {Function} p_objFunc The function to call for each item. The function will get the item as parameter
       * @param {Object} p_objScope The scope to run at
       */
	    forEach: function (p_objFunc, p_objScope) {
	        this.layersArrayList.forEach(p_objFunc, p_objScope);
	    },

	});
});