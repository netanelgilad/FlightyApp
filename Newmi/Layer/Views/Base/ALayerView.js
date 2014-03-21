/**
* @class NeWMI.Layer.Views.Base.ALAyerView
* <p>A different way to view the layer.</p>
* <p>The view we get the draw cycle, will perform his drawing implementation, and pass on the objects which need to be dealt in the layer</p>
* @abstract
*/
define(["dojo/_base/declare"],
    function(declare, Dictionary, KDTree2D, Draw2D, Point)
{	
	return declare("NeWMI.Layer.Views.Base.ALAyerView", null, 
	{
	    /**
        * @constructor
        * Creates new ALAyerView instance
        */
		constructor : function() {
		},
			
	    /**
        * @method isObjectDrawn
        * Checks if a given object is drawn in the layer or in the view drawing
        * @param {NeWMI.Object.NeWMIObject} p_objToCheck The object to check if drawn
        * @return {Boolean} True if the object is drawn in the layer and not in the view
        */
		isObjectDrawn : function (p_objToCheck) {
			return true;
		},
		
	    /**
        * @method draw
        * Drawing the view
        * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map who request the draw
        * @param {Object} p_objContext The canvas context object
        * @param {NeWMI.Object.NeWMIObject[]} p_arrObjects The object to draw in the view
        * @return {NeWMI.Object.NeWMIObject[]} The objects which did not participant in the view drawing 
        */
		draw : function (p_objMap, p_objContext, p_arrObjects) {
			return p_arrObjects;
		},
		
	    /**
        * @method search
        * Searching for a given objects in the view. View might change the search due to it's own drawing implementation
        *
        * @param {NeWMI.Geometry.Rectangle} p_objGeo The area we want to search for the object in
		* @param {Boolean} [p_blnExactSearch=false] Send true when we want to perform query of the real geometry. Send false when we want fast querying, less accurate, geometries bounds rectangles intersections
        */
		search: function (p_objGeo, p_blnExactSearch) {
			return [];
		}
	});
});