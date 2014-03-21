/**
* @class NeWMI.Layer.Base.GroupLayer
* <p>Single layer which can hold several layer</p>
* @extends NeWMI.Layer.Base.ACustomLayer
*/
define(["dojo/_base/declare",
        "dojo/dom-construct",
        "NeWMI/Layer/Base/ACustomLayer",
        "NeWMI/Layer/LayersList",
        "NeWMI/Tool/EventObject",
        "NeWMI/Layer/Base/ALayer"],
    function (declare,
            domConstruct,
            ACustomLayer,
            LayersList,
            EventObject,
            ALayer) {
    return declare("NeWMI.Layer.GroupLayer", ACustomLayer, {
		
        "-chains-" : 
		{
		    constructor: "manual"
		},
		
        /**
        * @constructor
        * Creates new GroupLayer instance
        */
        constructor: function ()
        {
            this.inherited(arguments, [false, false]);

            this.newmiProps.id += " - Group";

            /**
            * @property {dojox.collections.ArrayList} layers
            *
            * The layers list
            */
            this.layers = new LayersList();
            this.layers.on("layerInsert", dojo.hitch(this, this.onLayersChanged));
            this.layers.on("layerRemove", dojo.hitch(this,this.onLayersChanged));
            this.layers.on("layerMove", dojo.hitch(this,this.onLayersChanged));
            this.layers.on("layerAllRemoved", dojo.hitch(this,this.onLayersChanged));
        },

        //////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////// Insert\Remove Layers //////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////

        onLayerAdded: function (map, container)
        {
            var objRetVal = this.inherited(arguments);

            this._syncLayers(map);

            return objRetVal;
        },

        _syncLayers: function (p_objMap) {
            var objLayerDiv = this.getLayerDiv(p_objMap);

            this.layers.silentMode = true;

            this.layers.forEach(function (objCurrLayer) {
                this._removeLayer(p_objMap, objCurrLayer);
            }, this);

            this.layers.forEach(function (objCurrLayer) {
                this._insertLayer(p_objMap, objCurrLayer);
            }, this);

            this.layers.silentMode = false;
        },

        _insertLayer : function(p_objMap, p_objLayer, p_intIndex) {
            var objGroupDiv = this.getLayerDiv(p_objMap);

            var objNewLayerDiv = domConstruct.create("div", { id: p_objLayer.newmiProps.id }, objGroupDiv);

            if (p_intIndex < this.layers.getCount()) {
                objGroupDiv.removeChild(objNewLayerDiv);
                objGroupDiv.insertBefore(objNewLayerDiv, objGroupDiv.childNodes[p_intIndex]);
            }

            p_objLayer.onLayerAdded(p_objMap, objNewLayerDiv);
        },

        _moveLayer: function (p_objMap, p_objLayer, p_intIndex) {
            var objGroupDiv = this.getLayerDiv(p_objMap);

            var objLayerDiv = p_objLayer.getLayerDiv(p_objMap);

            if (objLayerDiv && objGroupDiv) {
                // Removing the layer div from the group layer div
                objGroupDiv.removeChild(objLayerDiv);

                // Adding the layer at the specific index
                var addBeforeNode = objGroupDiv.childNodes[p_intIndex];
                objGroupDiv.insertBefore(objLayerDiv, addBeforeNode);
            }
        },


        _removeLayer: function (p_objMap, p_objLayer) {

            var objGroupDiv = this.getLayerDiv(p_objMap);

            var objLayerDiv = p_objLayer.getLayerDiv(p_objMap);

            if (objLayerDiv && objGroupDiv) {
                p_objLayer.onLayerRemoved(p_objMap, objLayerDiv);

                objGroupDiv.removeChild(objLayerDiv);
            }
        },
        
        /**
        * @method insert
        * Inserting a given layer to a specific index
        * @param {NeWMI.Layer.Base.ACustomLayer} p_objLayer The layer to insert
        * @param {Number} [p_LayerIndex] The index to insert this layer at. If not passed, it will insert it to the end of the list
        */
        insert: function (p_objLayer, p_LayerIndex) {
            return this.layers.insert(p_objLayer, p_LayerIndex);
        },

        /**
        * @method remove
        * Inserting a given layer to a specific index
        * @param {Object} p_LayerProp Identifier to the layer. Can be one of 3:<ul><li>Layer ID</li><li>Layer index</li><li>The layer object</li></ul>
        */
        remove: function (p_LayerProp) {
            return this.layers.remove(p_LayerProp);
        },

        /**
        * @method clear
        * Removing all layers
        */
        clear: function () {
            return this.layers.clear();
        },

        /**
        * @method moveLayer
        * Moving layer to another index
        * @param {NeWMI.Layer.Base.ACustomLayer} p_objLayer The layer to insert
        * @param {Number} p_LayerIndex The index to move this layer to.
        */
        moveLayer: function (p_objLayer, p_LayerIndex) {
            return this.layers.move(p_objLayer, p_LayerIndex);
        },

        onLayersChanged: function (param) {
            switch (param.type) {
                case EventObject.Type.layerInsert:
                    {
                        this._performActionOnMaps(null,
                            function (item) {
                                this._insertLayer(item.map, param.object.layer, param.object.index);
                            });
                    }
                    break;
                case EventObject.Type.layerMove:
                    {
                        this._performActionOnMaps(null,
                            function (item) {
                                this._moveLayer(item.map, param.object.layer, param.object.index);
                            });
                    }
                    break;
                case EventObject.Type.layerRemove:
                    {
                        this._performActionOnMaps(null,
                            function (item) {
                                this._removeLayer(item.map, param.object.layer);
                            });
                    }
                    break;
                case EventObject.Type.layerRemoveAll:
                    {
                        this._performActionOnMaps(null,
                            function (item) {
                                param.object.layers.forEach(function (objCurrLayer) {
                                    this._removeLayer(item.map, objCurrLayer);
                                });
                            });
                    }
                    break;
            }
        },

        //////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////

        drawGL: function (gl) {
            
            if (!this.newmiProps.get(ALayer.Props.visible)) {
                return;
            }

            this.layers.forEach(function (objCurrLayer) {
                objCurrLayer.drawGL(gl);
            });

            this.inherited(arguments);
        },

        draw2D: function (context) {

            if (!this.newmiProps.get(ALayer.Props.visible)) {
                return;
            }

            this.layers.forEach(function (objCurrLayer) {
                objCurrLayer.draw2D(context);
            });
            
            this.inherited(arguments);
        },

        refresh: function (p_objMap) {

            if (!this.newmiProps.get(ALayer.Props.visible)) {
                this.layers.forEach(function (objCurrLayer) {
                    objCurrLayer.clear(p_objMap);
                });
            }
            else {
                this.layers.forEach(function (objCurrLayer) {
                    objCurrLayer.refresh(p_objMap);
                });
            }
        },

        _mapLayoutChange: function (p_objMap, width, height) {
            if (!this.newmiProps.get(ALayer.Props.visible)) {
                return;
            }

            this.layers.forEach(function (objCurrLayer) {
                objCurrLayer._mapLayoutChange(p_objMap, width, height);
            });
        },

        _panning: function (p_objMap, extent, delta) {
            if (!this.newmiProps.get(ALayer.Props.visible)) {
                return;
            }

            this.layers.forEach(function (objCurrLayer) {
                objCurrLayer._panning(p_objMap, extent, delta);
            });
        },

        _zooming: function (p_objMap, extent, zoomFactor, anchor, level) {
            if (!this.newmiProps.get(ALayer.Props.visible)) {
                return;
            }

            this.layers.forEach(function (objCurrLayer) {
                objCurrLayer._zooming(p_objMap, extent, zoomFactor, anchor, level);
            }); 
        },

        _extentChange: function (p_objMap, extent, delta, levelChange, lod) {
            if (!this.newmiProps.get(ALayer.Props.visible)) {
                return;
            }

            this.layers.forEach(function (objCurrLayer) {
                objCurrLayer._extentChange(p_objMap, extent, delta, levelChange, lod);
            });
        },

        clear: function(p_objMap) 
        {
            if (!this.newmiProps.get(ALayer.Props.visible)) {
                return;
            }

            this.layers.forEach(function (objCurrLayer) {
                objCurrLayer.clear(p_objMap);
            });
        },

        /**
        * @method getAllLayers
        * Returning all the layers in the group, including sons, and grandsons,....
        * @return {NeWMI.Layer.Base.ACustomLayer[]} All The layers inside the group
        */
        getAllLayers: function () {
            return this.layers.getAllLayers();
        },

        /**
        * @method forEach
        * Running over all the sons layers in a loop
        * @param {Function} p_objFunc The function to call for each item. The function will get the item as parameter
        * @param {Object} p_objScope The scope to run at
        */
        forEach: function (p_objFunc, p_objScope)
        {
            this.layers.forEach(p_objFunc, p_objScope);
        },
		
	});
});