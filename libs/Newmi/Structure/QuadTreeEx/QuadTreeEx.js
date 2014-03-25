define(["dojo/_base/declare"], function(declare){
	return declare("NeWMI.Structure.QuadTreeEx.QuadTreeEx", null, {
		
		constructor: function(p_strID, p_objBounds, p_dblSmallestSubNodeArea) 
		{
			this.id = p_strID;
            this.bounds = p_objBounds;
            this.root = new QuadTreeNodeEx().init(p_strID, this.bounds, p_dblSmallestSubNodeArea);
		},
		
		count : function() 
		{ 
			return root.count; 
		},
		
        /// <summary>
        /// Insert the feature into the QuadTree
        /// </summary>
        /// <param name="p_objItem">The item to insert</param>
        insert : function (p_objItem)
        {
            this.root.insert(p_objItem);
        },
        
        /// <summary>
        /// Insert the feature into the QuadTree
        /// </summary>
        /// <param name="p_objItem">The item to remove</param>
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
        
        /// <summary>
        /// Query the QuadTree, returning the items that are in the given area
        /// </summary>
        /// <param name="p_objArea">The area we want to search</param>
        /// <returns>the items that are in the given area</returns>
        search : function (p_objArea)
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