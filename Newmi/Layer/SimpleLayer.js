/**
* @class NeWMI.Layer.SimpleLayer
* <p>Represents a simple applicative layer NeWMI</p>
* <p>The drawing implementation is simple - geometries drawn</p>
* @extends NeWMI.Layer.Base.ACustomObjectsLayer
* <pre><code>
* var myFirstNeWMIObject = new NeWMI.Object.NeWMIObject();
* myFirstNeWMIObject.id = "MyObjectID";
* 
* var circle = new NeWMI.Geometry.Circle({ x: 10, y: 10, radius: 30 });
* myFirstNeWMIObject.geometry = circle;
* 
* // getEnvelope will return a Rectangle geometry, getRect will return the its NeWMI.Draw.Types.Rect type
* myFirstNeWMIObject.boundsRect = circle.getEnvelope().getRect();
* 
* var myLayer = new NeWMI.Layer.SimpleLayer();
* myLayer.dataSource.addObject(myFirstNeWMIObject);
* 
* map.layersMgr.insertAppLayer(myLayer);
* </code></pre>
*/
define(["dojo/_base/declare",
        "NeWMI/Layer/Base/ACustomObjectsLayer", 
        "NeWMI/Object/DataSource", 
        "NeWMI/Draw/Draw2D", 
        "dojox/collections/Dictionary"], 
        function(declare, 
        		ACustomObjectsLayer, 
        		DataSource, 
        		Draw2D, 
        		Dictionary)
{
	return declare("NeWMI.Layer.SimpleLayer", ACustomObjectsLayer,{ 

		"-chains-" : 
		{
			constructor: "manual"
		},
		
	    /**
        * @constructor
        * Creates new SimpleLayer instance
        */
		constructor : function()
		{
			this.inherited(arguments, [false, true]);
			
		    /**
            * @property {Object} contextParams
            * @property {String} [contextParams.strokeStyle='black']
            * @property {String} [contextParams.fillStyle='blue']
            * @property {Number} [contextParams.lineWidth=1]
            * Styles for drawing the geometries
            * Contains the properties as they are in the Canvas (Context '2d'), and their values
            */
			this.contextParams = {};
			this.contextParams.strokeStyle = "black";
			this.contextParams.fillStyle = "blue";
			this.contextParams.lineWidth = 1;

		    /**
            * @property {Object} selectedContextParams
            * @property {String} [selectedContextParams.strokeStyle='red']
            * @property {Number} [selectedContextParams.lineWidth=1]
            * Styles for drawing the geometries when they are selected
            * Contains the properties as they are in the Canvas (Context '2d'), and their values
            */
			this.selectedContextParams = {};
			this.selectedContextParams.strokeStyle = "red";
			this.selectedContextParams.lineWidth = 3;
            
		    /**
            * @property {Number} pointSize
            * The size of the point
            */
			this.pointSize = null;

		    /**
            * @property {Function} hDraw
            * The draw function. When we want to combine some fill and stroke actions together, or just fill			
            */
			this.hDraw = null;
		},
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////// Draw ////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		drawObjects2D : function (p_objMap, p_objContext, p_arrObjToDraw)
		{
		    Draw2D.setContextParams(p_objContext, this.contextParams);
			
			//var timeBefore = new Date().getTime();
			
			p_arrObjToDraw.forEach(function(objToDraw) 
			{
				if (objToDraw.draw2d)
				{
					objToDraw.draw2d(p_objMap, p_objContext, this);
				}
				else
				{
					Draw2D.geometry(p_objMap, p_objContext, objToDraw.geometry, this.hDraw, { pointSize : this.pointSize });
				}
				//Draw2D.geometry(p_objMap, p_objContext, objToDraw.geometry.getEnvelope());
				//Draw2D.pointGeometry(me.map, p_objContext, new NeWMI.Geometry.Point(entry.geometry.x, entry.geometry.y));
			}, this);
			
			//var timeAfter = new Date().getTime();
			//console.log((timeAfter - timeBefore) / 1000);
			
			this._drawSelectedObjects(p_objMap, p_objContext, this.selection);
		},
		
		_drawSelectedObjects : function (p_objMap, p_objContext, p_arrSelectedObjects)
		{
		    Draw2D.setContextParams(p_objContext, this.selectedContextParams);
			
			var blnCheckWithView = this.useView && this.view != null;
			
			p_arrSelectedObjects.forEach(function(objSelectedPair) 
			{
				if (!objSelectedPair.value.draw2d && (!blnCheckWithView || this.view.isObjectDrawn(objSelectedPair.value)))
				{
					Draw2D.geometry(p_objMap, p_objContext, objSelectedPair.value.geometry, p_objContext.stroke, { pointSize : this.pointSize });
				}
			}, this);
		}
	});
});