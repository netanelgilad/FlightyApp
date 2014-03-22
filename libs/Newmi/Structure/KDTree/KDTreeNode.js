define(["dojo/_base/declare"], function(declare)
{
	return declare("NeWMI.Structure.KDTree.KDTreeNode", null, 
	{
		constructor : function(obj, dimension, parent) 
		{
		    this.obj = obj;
		    this.left = null;
		    this.right = null;
		    this.parent = parent;
		    this.dimension = dimension;
		}
	});
});