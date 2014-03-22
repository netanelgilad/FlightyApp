/**
* @class NeWMI.Object.NeWMIObject
* <p>Presents an object in NeWMI</p>
* In order to use NeWMI for the best performances, in selection and drawing we must use the NeWMIObject.<br/>
* @extends NeWMI.Structure.QuadTree.QuadTreeItem
*/
define(["dojo/_base/declare", "NeWMI/structure/QuadTree/QuadTreeItem"], function (declare, QuadTreeItem) {
	return declare("NeWMI.Object.NeWMIObject", QuadTreeItem, {
		
		"-chains-" : 
		{
			constructor: "manual"
		},
		
		/**
		 * @constructor
         * Creates new NeWMIObject instance
         *
		 * @param {String} [p_strID] The Object ID - Must be unique
		 * @param {NeWMI.Draw.Types.Rect} [p_objBoundsRec] The bounds of the geometry
		 * @param {NeWMI.Geometry.Base.AGeometry} [p_objGeo] The geometry of the object
		 */
		constructor: function(p_strID, p_objBoundsRec, p_objGeo) 
		{
			this.inherited(arguments, [p_objBoundsRec]);

		    /**
            * @property {String} id
            *
            * The Object ID - Must be unique
            */
			this.id = p_strID;

		    /**
            * @property {NeWMI.Geometry.Base.AGeometry} geometry
            *
            * Any type of NeWMI Geometry object that can be drawn on a map
            */
			this.geometry = p_objGeo;
		}
	});
});