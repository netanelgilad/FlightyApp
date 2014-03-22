/**
* @class NeWMI.Structure.QuadTree.QuadTree
* A Quadtree is a tree data structure in which each internal node has exactly four children.  
* The Quadtree used to partition a two-dimensional space by recursively subdividing it into four quadrants. 
* The regions are rectangular
*/
define(["dojo/_base/declare", "NeWMI/Structure/QuadTree/QuadTreeNode"], function (declare, QuadTreeNode) {
	return declare("NeWMI.Structure.QuadTree.QuadTree", null, {
		
	    /**
         * @constructor
         * Creates new QuadTree instance
		 * @param {String} p_strID The id of the quadtree
         * @param {NeWMI.Draw.Types.Rect} p_objBounds The boundary the quadtree suppose to index
         * @param {Number} [p_dblSmallestSubNodeArea=0.05] The smallest diving area for indexing
		 */
	    constructor: function (p_strID, p_objBounds, p_dblSmallestSubNodeArea)
		{
		    /**
            * @property {String} id
            *
            * The id of the quadtree
            * @readonly
            */
		    this.id = p_strID;

		    /**
            * @property {NeWMI.Draw.Types.Rect} bounds
            *
            * The boundary the quadtree suppose to index
            */
		    this.bounds = p_objBounds;

	        /**
            * @property {NeWMI.Structure.QuadTree.QuadTreeNode} root
            *
            * The map connected to this events manager
            * @readonly
            */
		    this.root = new QuadTreeNode(p_strID, this.bounds, p_dblSmallestSubNodeArea || 0.05);
		},
		
	    /**
        * @method count
        *
        * Returns The amount of children the root contains
        * @return {Number} Children count of the root
        */
		count : function() 
		{ 
			return root.count(); 
		},
		
	    /**
        * @method insert
        * Insert the feature into the QuadTree
        * @param {NeWMI.Structure.QuadTree.QuadTreeItem} p_objItem The item to insert
        */
        insert : function (p_objItem)
        {
            this.root.insert(p_objItem);
        },
        
	    /**
         * @method remove
         * Removing feature from the QuadTree
         * @param {NeWMI.Structure.QuadTree.QuadTreeItem} p_objItem The item to remove
         */
        remove : function (p_objItem)
        {
            if (p_objItem.containsInContents != null)
            {
                var objTreeNode = p_objItem.containsInContents[this.id];
                if (objTreeNode != null)
                {
                	var intIndexItem = objTreeNode.contents.indexOf(p_objItem);
                	objTreeNode.contents.splice(intIndexItem, 1);
                    delete p_objItem.containsInContents[this.id];
                }
            }
        },
        
	    /**
         * @method search
         * Query the QuadTree, returning the items that are in the given area
         * @param {NeWMI.Draw.Types.Rect} p_objArea The area we want to search
         * @return {NeWMI.Structure.QuadTree.QuadTreeItem[]} The items that are in the given area
         */
        search: function (p_objArea)
        {
            return this.root.search(p_objArea);
        },
        
        /// <summary>
        /// Query the QuadTree, returning the Nodes that are in the given area
        /// </summary>
        /// <param name="p_objArea">The area we want to search</param>
	    /// <returns>the Nodes that are in the given area</returns>
        searchNodes : function (p_objArea)
        {
            return this.root.searchNodes(p_objArea);
        },
        
        /// <summary>
        /// Removing all the items from the tree
	    /// </summary>

	    /**
         * @method clearAll
         * Removing all the items from the tree
         */
        clearAll : function()
        {
        	var subtreeContents = this.root.getSubTreeContents();
        	subtreeContents.forEach(function (objCurrItem)
        	{
        		this.remove(objCurrItem);
        	}, this);
        },
        
        draw : function (p_objContext, p_blnDrawItems)
    	{		
        	this.root.draw(p_objContext, p_blnDrawItems);
    	}
	});
});