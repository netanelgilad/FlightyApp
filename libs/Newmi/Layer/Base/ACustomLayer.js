/**
* @class NeWMI.Layer.Base.ACustomLayer
* <p>Represents abstract custom NeWMI Layer. All NeWMI applicative layers extends this object</p>
* <p>Implements the basic methods every layer should have, and provides virtual methods for overridden. Such as Draw, etc.</p>
* @abstract
*/
define(["dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojox/collections/Dictionary",
        "NeWMI/Layer/Base/ALayer", 
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Tool/CommandFeatures"], 
        function(declare, domConstruct, domStyle, Dictionary, ALayer, AEventsManager, CommandFeatures){
	return declare("NeWMI.Layer.Base.ACustomLayer", null,{  
		
		"-chains-" : 
		{
			constructor: "manual"
		},
		
	    /**
        * @constructor
        * Creates new ACustomLayer instance
        * @param {Boolean} [p_blnIsGL=false] Is the layer support GL
        * @param {Boolean} [p_blnIs2D=false] Is the layer support html5 simple context
        */
		constructor: function(p_blnIsGL, p_blnIs2D, p_arrFeatures) 
		{
		    /**
            * @property {Boolean} [isGL=false] 
            * Is the layer support GL
            */
		    this.isGL = p_blnIsGL;
		    /**
            * @property {Boolean} [is2D=false] 
            * Is the layer support html5 simple context
            */
			this.is2D = p_blnIs2D;
			
		    /**
            * @property {NeWMI.Layer.Base.ALayer} newmiProps 
            * The NeWMI layer properties
            */
			this.newmiProps = new ALayer(null, null, true);
			this.newmiProps.set(ALayer.Props.features, p_arrFeatures);
			
		    /**
            * @property {dojox.collections.Dictionary} containsInMaps 
            * Each layer can be in many maps. This dictionary contains information about each map it is contained in.<p/>
            * The keys of this dictionary are the id's of the maps the layer is in. And the values are an objects describes as follow:
            * <ul>
            *  <li>map - The map that the layer is in</li>
            *  <li>div - The div (HTML Element) of this layer in this map</li>
            *  <li>canvas2D and\or canvasGL - The Canvas\es (HTML Element) created for this layer in this map</li>
            * </ul>
            */
			this.containsInMaps = new Dictionary();
			
			// Refresh layer automatically every milliseconds. -1 To deactivate
			this.refreshEvery = -1;
			this.hRefreshTimer = null; // in case the developer will want to get this timer events
			this._timerStarted = false;
		},
		
		/////////////////////////////////////////////////////////////////////
		
	    /**
         * @method onLayerAdded
		 * Called automatically when the layer had been added to a map
         *
		 * @param {NeWMI.Map.Base.ABasicMap} map The map which contains this layer now
         * @param {HTMLElement} container The html element which created for this layer
         * @protected
		 */
		onLayerAdded : function(map, container)
		{						
			//////////////////////////// Creating the canvases //////////////////////////////
		  	
			var objDrawObjects = {};
			objDrawObjects.map = map;
			objDrawObjects.div = container;
			
			var objMapSize = map.getControlLayout();
			
			if (this.is2D)
			{
				objDrawObjects.canvas2D = domConstruct.create("canvas", 
					{
						width:  objMapSize.width + "px",
						height: objMapSize.height + "px",
						style: "position: absolute; left: 0px; top: 0px;"
					}, container);
			}
			
			if (this.isGL)
			{
				objDrawObjects.canvasGL = domConstruct.create("canvas", 
				{
					width:  objMapSize.width + "px",
					height: objMapSize.height + "px",
					style: "position: absolute; left: 0px; top: 0px;"
				}, container);

			}
			
			objDrawObjects.canvases = { '2d': objDrawObjects.canvas2D, 'gl' : objDrawObjects.canvasGL };
			
			//////////////////////////// Creating the contexts //////////////////////////////
			
			this._createContexts(map, objDrawObjects);
			
			if (!this.containsInMaps.containsKey(map.id))
			{
				this.containsInMaps.add(map.id, objDrawObjects);
			}
			
			// Initial rendering
			this.drawLayer(map, objDrawObjects);
			
			return objDrawObjects;
		},
		
		_createContexts : function(map, objDrawData)
		{
			objDrawData.contexts = {};
			
			if (objDrawData.canvas2D)
			{
				objDrawData.contexts.context2D = objDrawData.canvas2D.getContext("2d");
				objDrawData.context = objDrawData.contexts.context2D;
				objDrawData.context.map = map;
			}
			
			if (objDrawData.canvasGL)
			{
				objDrawData.contexts.contextGL = GL.create(objDrawData.canvasGL, { alpha : true });
				objDrawData.gl = objDrawData.contexts.contextGL;
				objDrawData.gl.map = map;
				
				
			
				objDrawData.gl.disable(objDrawData.gl.CULL_FACE);
				objDrawData.gl.disable(objDrawData.gl.DEPTH_TEST);
				objDrawData.gl.enable(objDrawData.gl.BLEND);
				objDrawData.gl.blendFunc(objDrawData.gl.SRC_ALPHA, objDrawData.gl.ONE_MINUS_SRC_ALPHA);
				objDrawData.gl.clearColor(0,0,0,0);
			}
			
			if (objDrawData.contexts.length == 0) 
			{
				console.error("This browser does not support <canvas> elements.");
			}	
		},
		
	    /**
         * @method onLayerRemoved
		 * Called automatically when the layer had been remove from a map
         *
		 * @param {NeWMI.Map.Base.ABasicMap} map The map which removed this layer now
         * @param {HTMLElement} container The html element of this layer
         * @protected
		 */
		onLayerRemoved : function(map, container) 
		{
		    if (!container) {
		        container = this.getLayerDiv(map);
		    }

			this._performActionOnMaps(map, function(item)
			{
				for (var intElementIndex in item.canvases)
				{
					var objCurrElement = item.canvases[intElementIndex];
					if (objCurrElement)
					{
						container.removeChild(objCurrElement);
					}
				}
			});
			
			this.containsInMaps.remove(map.id);
		},
		
	    /**
        * @method getLayerDiv
        * Returns the layer div (HTMLElement). Using NeWMI.Layer.Base.ACustomLayer.containsInMaps dictionary.
        *
        * @param {NeWMI.Map.Base.ABasicMap} map The map which contains this layer
        * @return {HTMLElement} the layer div
        */
		getLayerDiv: function (map) {
		    var objItem = this.containsInMaps.item(map.id);

		    if (objItem) {
		        return objItem.div;
		    }
		    else {
		        return null;
		    }
		},

		/////////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////   Events   ////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////
		
		_mapLayoutChange: function (p_objMap, width, height)
		{
			this._performActionOnMaps(p_objMap, function(item)
			{
				for (var intElementIndex in item.canvases)
				{
					var objCurrElement = item.canvases[intElementIndex];
					if (objCurrElement)
					{
						objCurrElement.width = width;
						objCurrElement.height = height;
					}
				}
			});

			this.refresh(p_objMap);
		},
		
		_performActionOnMaps : function (p_objMap, p_objAction)
		{
			if (this.containsInMaps.count == 0)
				return;
			
			if (p_objMap)
			{
			    var objDrawData = this.containsInMaps.item(p_objMap.id);
			    if (objDrawData) {
			        p_objAction.call(this, objDrawData);
			    }
			}
			else
			{
				this.containsInMaps.forEach(
					function (item) 
					{
						p_objAction.call(this, item.value);
					}, this);
			}
		},
		
		_panning: function(p_objMap, extent, delta) 
		{
			if (this.is2D)
			{
				this._performActionOnMaps(p_objMap, function(item) 
									{ 
										domStyle.set(item.canvas2D, { left: delta.x + "px", top: delta.y + "px" });
									});
			}
			if (this.isGL)
			{
				if (!p_objMap._isBoundsAlwaysUpdated)
				{
					this.offsetXY = [ delta.x, delta.y ];
				}
				else
				{
					this.offsetXY = [ 0, 0 ];
				}
				
				var blnWas2D = this.is2D; 
				this.is2D = false;
				this.clear(p_objMap);
				this.drawLayer(p_objMap);
				this.is2D = blnWas2D;
			}
		},
		
		_zooming: function(p_objMap, extent, zoomFactor, anchor, level) 
		{
			if (!extent)
				return;
			
			if (zoomFactor != 1)
			{
				var dblNewZoom = 100.0;
				var factor = 1;
				
				dblNewZoom = 100.0 * zoomFactor;
				
				var dblDistanceX =  -anchor.x  + (anchor.x / zoomFactor);
				var dblDistanceY =  -anchor.y  + (anchor.y / zoomFactor);

				if (this.is2D)
				{
					this._performActionOnMaps(p_objMap, function(item) 
							{ 
								domStyle.set(item.canvas2D, { left: dblDistanceX + "px", top: dblDistanceY + "px" });
								domStyle.set(item.canvas2D, { zoom: dblNewZoom + "%" });
							});
				}
				if (this.isGL)
				{
					this.scaleXY = [ anchor, zoomFactor ];
					
					var blnWas2D = this.is2D; 
					this.is2D = false;
					this.clear(p_objMap);
					this.drawLayer(p_objMap);
					this.is2D = blnWas2D;
				}
			}
		},
		
		_extentChange: function(p_objMap, extent, delta, levelChange, lod) 
		{
			var objElements = [];
			
			this._performActionOnMaps(p_objMap, 
					function(item) 
					{
						if (item.context)
							objElements.push(item.canvas2D);
						if (item.gl)
							objElements.push(item.canvasGL);
					});

			for (var objCurrElementIndex in objElements)
			{
				var objCurrElement = objElements[objCurrElementIndex];
				if (!levelChange) 
				{
					domStyle.set(objCurrElement, { left: "0px", top: "0px" });
				}
				else
				{
					domStyle.set(objCurrElement, { left: "0px", top: "0px" });
					domStyle.set(objCurrElement, { zoom: "100%" });
				}
			}
			
			this.offsetXY = null;
			this.scaleXY = null;
			
			this.clear(p_objMap);
			this.drawLayer(p_objMap);
		},
		
		drawLayer: function(p_objMap, p_objDrawObject) 
		{
			if (!this.newmiProps.get(ALayer.Props.visible))
				return;
			
			var me = this;
			
			if (this.isGL)
			{	
				if (p_objDrawObject)
				{
					this.drawLayerInGL(p_objDrawObject);
				}
				else
				{
					this._performActionOnMaps(p_objMap, 
							function(item) 
							{
								me.drawLayerInGL(item);
							});
				}
				
			}
			if (this.is2D)
			{
				if (p_objDrawObject)
				{
					this.draw2D(p_objDrawObject.map, p_objDrawObject.context);
				}
				else
				{
					this._performActionOnMaps(p_objMap, 
							function(item) 
							{
								me.draw2D(item.map, item.context);
							});
				}
			}
		},
		
		drawLayerInGL : function(p_objDrawObject)
		{
			// Setting the current context to the global one
			gl = p_objDrawObject.gl;
			
			p_objDrawObject.gl.mapScreenToMap(p_objDrawObject.map, this.offsetXY, this.scaleXY);
			this.drawGL(p_objDrawObject.map, p_objDrawObject.gl);
					
		},
		
	    /**
        * @method drawGL
        * Drawing the layer in gl mode. This method need to be override in order to perform some gl draw.<p/>
        * Called automatically every draw cycle by NeWMI.
        *
        * @param {Object} gl The gl context
        * @protected
        */
		drawGL: function(gl)
		{
			this._setRefreshTimer();
		},
		
	    /**
        * @method draw2D
        * Drawing the layer in 2D rendering mode. This method need to be override in order to perform some context draw.<p/>
        * Called automatically every draw cycle by NeWMI.
        *
        * @param {Object} context The canvas's context object
        * @protected
        */
		draw2D: function(context)
		{
			if (!this.isGL)
				this._setRefreshTimer();
		},
		
		_setRefreshTimer : function()
		{
			if (this.refreshEvery >= 0 && !this._timerStarted)
			{
				this._timerStarted = true;
				setTimeout(dojo.hitch(this, this._refreshTimer), this.refreshEvery);
			}
		},
		
		_refreshTimer : function()
		{
			if (this.hRefreshTimer)
			{
				this.hRefreshTimer(this);
			}
			
			this._timerStarted = false;
			this.refresh();
		},
		
		////////////////////////////

		setOpacity: function(o) 
		{
			if (this.opacity != o) 
			{
				this.onOpacityChange(this.opacity = o);
			}
		},
		
	    /**
        * @method refresh
        * Forcing redraw of the layer draw in a given map
        * @param {NeWMI.Map.Base.ABasicMap} [p_objMap] The map we want to refresh this layer. 
        * If the parameter is not passed it will refresh in all the maps the layer contained
        */
		refresh: function(p_objMap) 
		{
			this.clear(p_objMap);
			this.drawLayer(p_objMap);
		},
		
		clear: function(p_objMap) 
		{
			var me = this;
			this._performActionOnMaps(p_objMap, 
					function(item) 
					{
						if (item.context)
						{
						    var objMapSize = item.map.getControlLayout();
							item.context.clearRect(0, 0, objMapSize.width, objMapSize.height);
						}
						if (item.gl)
							item.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
					});
		}
	});
}); 