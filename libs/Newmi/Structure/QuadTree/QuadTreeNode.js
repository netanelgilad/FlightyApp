/**
* @class NeWMI.Structure.QuadTree.QuadTreeNode
* The QuadTreeNode which contains objects or another 4 nodes according to QuadTree implementation.
* @extends NeWMI.Structure.QuadTree.QuadTreeItem
*/
define(["dojo/_base/declare", "NeWMI/Structure/QuadTree/QuadTreeItem", "NeWMI/Draw/Types/Rect"], function (declare, QuadTreeItem, RectD) {
	return declare("NeWMI.Structure.QuadTree.QuadTreeNode", QuadTreeItem, {
		
	    /**
         * @constructor
         * Creates new QuadTreeNode instance
		 * @param {String} p_strID The id of the quadtree the node is in
         * @param {NeWMI.Draw.Types.Rect} p_objBounds The boundary the node
         * @param {Number} p_dblSmallestSubNodeArea The smallest diving area for indexing
		 */
		constructor: function(p_strID, p_objBounds, p_dblSmallestSubNodeArea) 
		{
		    /**
            * @property {String} id
            *
            * The id of the quadtree the node is in
            * @readonly
            */
		    this.id = p_strID;

		    /**
            * @property {NeWMI.Draw.Types.Rect} bounds
            *
            * The boundary the node
            * @readonly
            */
		    this.bounds = p_objBounds;

		    /**
            * @property {Number} smallestSubNodeArea
            *
            * The smallest diving area for indexing
            * @readonly
            */
			this.smallestSubNodeArea = p_dblSmallestSubNodeArea;
			
		    /**
            * @property {NeWMI.Structure.QuadTree.QuadTreeNode[]} nodes
            *
            * The son nodes of this node
            * @readonly
            */
			this.nodes = [];

		    /**
            * @property {NeWMI.Structure.QuadTree.QuadTreeItem[]} contents
            *
            * The son children of this node
            * @readonly
            */
			this.contents = [];
		},
	
		isEmpty : function()
		{ 
			return this.bounds.isEmpty || (this.nodes.length == 0 && this.contents.length == 0);
		},
		
	    /**
        * @method count
        *
        * Returns The amount of children this node
        * @return {Number} Children count of the root
        */
		count : function()
		{ 
			var count = 0;

			this.nodes.forEach(function(node)
			{
				count += node.count();
			});                

            count += this.contents.length;

            return count;
		},
		
	    /**
        * @method getSubTreeContents
        *
        * Returns The objects in this node and all his sub nodes
        * @return {NeWMI.Structure.QuadTree.QuadTreeItem[]} List of all the children and sub children and on.
        */
		getSubTreeContents : function()
        {
            var results = [];

            this.nodes.forEach(function(node)
			{
            	results.push.apply(results, node.getSubTreeContents());
			}); 
            
            if (this.contents.length > 0)
            {
            	results.push.apply(results, this.contents);
            }
            return results;
        },
		
		////////////////////// Private /////////////////////////////
		
		_createSubNodes : function()
        {
            // the smallest sub node has an area 
            if ((this.bounds.height * this.bounds.width) <= this.smallestSubNodeArea)
                return;

            var halfWidth = this.bounds.width / 2.0;
            var halfHeight = this.bounds.height / 2.0;

            this.nodes.push(new NeWMI.Structure.QuadTree.QuadTreeNode(this.id, new RectD(this.bounds.x, this.bounds.y, halfWidth, halfHeight), this.smallestSubNodeArea));
            this.nodes.push(new NeWMI.Structure.QuadTree.QuadTreeNode(this.id, new RectD(this.bounds.x, this.bounds.y + halfHeight, halfWidth, halfHeight), this.smallestSubNodeArea));
            this.nodes.push(new NeWMI.Structure.QuadTree.QuadTreeNode(this.id, new RectD(this.bounds.x + halfWidth, this.bounds.y, halfWidth, halfHeight), this.smallestSubNodeArea));
            this.nodes.push(new NeWMI.Structure.QuadTree.QuadTreeNode(this.id, new RectD(this.bounds.x + halfWidth, this.bounds.y + halfHeight, halfWidth, halfHeight), this.smallestSubNodeArea));
        },
        
        //////////////////// Public ////////////////////////////////
        
	    /**
        * @method insert
        * Insert the feature into the node
        * @param {NeWMI.Structure.QuadTree.QuadTreeItem} p_objItem The item to insert
        */
        insert : function (p_objItem)
        {
            // if the item is not contained in this quad, there's a problem
            if (!this.bounds.contains(p_objItem.boundsRect))
            {
                //throw new Exception("Object Boundary is not in the tree boundary");
                return false;
            }

            // if the sub nodes are null create them. may not be successful: see below
            // we may be at the smallest allowed size in which case the sub nodes will not be created
            if (this.nodes.length == 0)
                this._createSubNodes();

            // for each sub node:
            // if the node contains the item, add the item to that node and return
            // this recourses into the node that is just large enough to fit this item
            for (var intCurrNodeIdx = 0; intCurrNodeIdx < this.nodes.length; ++ intCurrNodeIdx)
            {	
            	var node = this.nodes[intCurrNodeIdx];
            	if (node.bounds.contains(p_objItem.boundsRect))
                {
                    node.insert(p_objItem);
                    return true;
                }
            }

            // if we make it to here, either
            // 1) none of the sub nodes completely contained the item. or
            // 2) we're at the smallest sub node size allowed 
            // add the item to this node's contents.
            this.contents.push(p_objItem);

            if (!p_objItem.containsInContents)
            {
                p_objItem.containsInContents = {};
            }
            
            p_objItem.containsInContents[this.id] = this;
            
            return true;
        },
        
        
        
	    /// <summary>
	    /// Query the node, returning the Nodes that are in the given area
	    /// </summary>
	    /// <param name="p_objArea">The area we want to search</param>
	    /// <returns>the Nodes that are in the given area</returns>
        searchNodes : function (p_objQueryArea)
        {
            // create a list of the items that are found
            var results = [];

            // this quad contains items that are not entirely contained by
            // it's four sub-quads. Iterate through the items in this quad 
            // to see if they intersect.
            if (this.contents.length > 0)
            {
                results.push(this);
            }

            for (var intCurrNodeIdx = 0; intCurrNodeIdx < this.nodes.length; ++intCurrNodeIdx)
            //this.nodes.forEach(function(node)
    		{
            	var node = this.nodes[intCurrNodeIdx];
            	
            	if (node.isEmpty())
            		continue;
            	
            	// Case 1: search area completely contained by sub-quad
                // if a node completely contains the query area, go down that branch
                // and skip the remaining nodes (break this loop)
                if (node.bounds.contains(p_objQueryArea))
                {
                    results.push.apply(results, node.searchNodes(p_objQueryArea));
                    break;
                }
            	
                // Case 2: Sub-quad completely contained by search area 
                // if the query area completely contains a sub-quad,
                // just add all the contents of that quad and it's children 
                // to the result set. You need to continue the loop to test 
                // the other quads
                if (p_objQueryArea.contains(node.bounds))
                {
                    results.push.apply(results, node.searchNodes(p_objQueryArea));
                    
                    continue;
                }
                
                // Case 3: search area intersects with sub-quad
                // traverse into this quad, continue the loop to search other
                // quads
                if (node.bounds.intersectsWith(p_objQueryArea))
                {
                    results.push.apply(results, node.searchNodes(p_objQueryArea));
                }
    		}
            
            return results;
        },
        
	    /**
         * @method search
         * Query the node, returning the items that are in the given area
         * @param {NeWMI.Draw.Types.Rect} p_objQueryArea The area we want to search
         * @return {NeWMI.Structure.QuadTree.QuadTreeItem[]} The items that are in the given area
         */
        search : function (p_objQueryArea)
        {
            // create a list of the items that are found
            var results = [];

            // this quad contains items that are not entirely contained by
            // it's four sub-quads. Iterate through the items in this quad 
            // to see if they intersect.
            this.contents.forEach(function(item)
    		{
            	if (p_objQueryArea.intersectsWith(item.boundsRect))
                    results.push(item);
    		});

            for (var intCurrNodeIdx = 0; intCurrNodeIdx < this.nodes.length; ++intCurrNodeIdx)
            //this.nodes.forEach(function(node)
    		{
            	var node = this.nodes[intCurrNodeIdx];
		
            	if (node.isEmpty())
                    continue;
            	
                // Case 1: search area completely contained by sub-quad
                // if a node completely contains the query area, go down that branch
                // and skip the remaining nodes (break this loop)
                if (node.bounds.contains(p_objQueryArea))
                {
                    results.push.apply(results, node.search(p_objQueryArea));
                    break;
                }
                
                // Case 2: Sub-quad completely contained by search area 
                // if the query area completely contains a sub-quad,
                // just add all the contents of that quad and it's children 
                // to the result set. You need to continue the loop to test 
                // the other quads
                if (p_objQueryArea.contains(node.bounds))
                {
                    results.push.apply(results, node.getSubTreeContents());
                    continue;
                }

                // Case 3: search area intersects with sub-quad
                // traverse into this quad, continue the loop to search other
                // quads
                if (node.bounds.intersectsWith(p_objQueryArea))
                {
                    results.push.apply(results, node.search(p_objQueryArea));
                }
    		};
            
            return results;
        },
        
        draw : function (p_objContext, p_blnDrawItems)
    	{
    		p_objContext.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    		this.nodes.forEach(function(objCurrNode)
    		{
    			objCurrNode.draw(p_objContext, p_blnDrawItems);
    		});
    		
    		if (p_blnDrawItems)
    		{
    			this.contents.forEach(function(objCurrItem)
    			{
    				p_objContext.strokeRect(objCurrItem.boundsRect.x, objCurrItem.boundsRect.y, objCurrItem.boundsRect.width, objCurrItem.boundsRect.height);
    			});
    		}
    	}
        
	});
});