/**
* @class NeWMI.Layer.TemporaryLayer
* <p>Represents a temporary layer NeWMI for geometries</p>
* <p>Please notice that this layer is not contains objects, but geometries. Trough simple array - NeWMI.Layer.TemporaryLayer.geometries
* @extends NeWMI.Layer.Base.ACustomLayer
*/
define(["dojo/_base/declare",
        "NeWMI/Layer/Base/ACustomLayer", 
        "NeWMI/Draw/Draw2D", 
        "dojox/collections/ArrayList"], 
        function(declare, 
        		ACustomLayer, 
        		Draw2D, 
        		ArrayList)
{
	return declare("NeWMI.Layer.TemporaryLayer", ACustomLayer,
	{ 

	    /**
        * @constructor
        * Creates new TemporaryLayer instance
        */
		constructor : function()
		{
		    this.inherited(arguments, [false, true]);

		    /**
            * @property {dojox.collections.ArrayList} geometries
            * The geometries for drawing
            */
			this.geometries = new ArrayList();
			this.hDraw = null;
			this.drawOptions = null;

		    /**
            * @property {Function} customDraw
            * In case we want custom drawing in addition to the geometries
            */
			this.customDraw = null;
		},
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////   Draw //////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		draw2D : function(p_objMap, p_objContext)
		{
			this.geometries.forEach(function(objGeoToDraw) 
			{
				Draw2D.geometry(p_objMap, p_objContext, objGeoToDraw, this.hDraw, this.drawOptions );
				
			}, this);
			
			if (this.customDraw)
				this.customDraw(p_objMap, p_objContext);
		}
	});
});