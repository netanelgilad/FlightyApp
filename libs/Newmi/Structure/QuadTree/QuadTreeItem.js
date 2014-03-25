/**
* @class NeWMI.Structure.QuadTree.QuadTreeItem
* An general implementation of a quad tree item.
*/
define(["dojo/_base/declare"], function (declare) {
	return declare("NeWMI.Structure.QuadTree.QuadTreeItem", null, {
		
        /**
         * @constructor
         * Creates new QuadTreeItem instance
         * @param {NeWMI.Draw.Types.Rect} p_objBoundsRect The boundary of the object 
         * @param {Object} p_objData The additional data we want to save in the item
		 */
		constructor: function(p_objBoundsRect, p_objData) 
		{
		    /**
            * @property {NeWMI.Draw.Types.Rect} boundsRect
            *
            * The boundary of the object
            */
		    this.boundsRect = p_objBoundsRect;

		    /**
            * @property {Object} data
            *
            * The additional data we want to save in the item
            */
			this.data = p_objData;
			
			this.containsInContents = null;
		}
	});
});