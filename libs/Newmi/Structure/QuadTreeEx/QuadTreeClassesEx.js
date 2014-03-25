
var RectEx = function () {}; 


RectEx.prototype = 
{
	counter : 0,
	
	init : function(pX, pY, pWidth, pHeight)
	{
		this.x = pX;
		this.y = pY;
		this.width = pWidth;
		this.height = pHeight;
		
		RectEx.prototype.counter++;
		
		return this;
	},
		
	union : function(pRect)
	{
		var dblLeft = Math.min(this.x, pRect.x);
		var dblRight = Math.max(this.x + this.width, pRect.x + pRect.width);
		var dblTop = Math.min(this.y, pRect.y);
		var dblBottom = Math.max(this.y + this.height, pRect.y + pRect.height);
        
        this.x = dblLeft;
        this.y = dblTop;
        this.width = dblRight - dblLeft;
        this.height = dblBottom - dblTop;
	},
	
	intersectsWith : function (pRect)
	{
		var blnResult = true;

        if (this.x > (pRect.x + pRect.width) ||
        	(this.x + this.width) < pRect.x ||
            this.y > (pRect.y + pRect.height) ||
            (this.y + this.height) < pRect.y)
        {
            blnResult = false;
        }

        return blnResult;
	},
	
	containsWithBorder : function (pRect)
	{
		var blnResult = true;
		
		// If envelope is on border, it's considered as contained
        if (this.x >= pRect.x ||
        	(this.x + this.width) <= (pRect.x + pRect.width) ||
            this.y >= pRect.y ||
            (this.y + this.height) <= (pRect.y + pRect.height))
        {
            blnResult = false;
        }
        
		
		return blnResult;
	},
	
	contains : function (pRect, p_blnIncludingOnBorder)
	{
		var blnResult = true;
		
		if (p_blnIncludingOnBorder == null)
			p_blnIncludingOnBorder = true;
		
		if (p_blnIncludingOnBorder)
        {   // If envelope is on border, it's considered as contained
            if (this.x >= pRect.x ||
            	(this.x + this.width) <= (pRect.x + pRect.width) ||
                this.y >= pRect.y ||
                (this.y + this.height) <= (pRect.y + pRect.height))
            {
                blnResult = false;
            }
        }
        else
        {   // If envelope is on border, it's considered as not contained
        	if (this.x > pRect.x ||
            	(this.x + this.width) < (pRect.x + pRect.width) ||
                this.y > pRect.y ||
                (this.y + this.height) < (pRect.y + pRect.height))
        	{
                blnResult = false;
            }
        }
		
		return blnResult;
	}	
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var QuadTreeNodeEx = function () {};
		
//QuadTreeNodeEx.prototype = new QuadTreeItemEx();

QuadTreeNodeEx.prototype.counter = 0;

QuadTreeNodeEx.prototype.init = function(p_strID, p_objBounds, p_dblSmallestSubNodeArea) 
{
	this.id = p_strID;
	this.bounds = p_objBounds;
	this.smallestSubNodeArea = p_dblSmallestSubNodeArea;
	
	this.nodes = [];
	this.contents = [];
	
	QuadTreeNodeEx.prototype.counter++;
	
	return this;
};

QuadTreeNodeEx.prototype.isEmpty = function()
{ 
	return this.bounds.isEmpty || (this.nodes.length == 0 && this.contents.length == 0);
};
	
QuadTreeNodeEx.prototype.count = function()
{ 
	var count = 0;

	this.nodes.forEach(function(node)
	{
		count += node.count();
	});                

    count += this.contents.length;

    return count;
};
	
QuadTreeNodeEx.prototype.getSubTreeContents = function()
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
};

////////////////////// Private /////////////////////////////

QuadTreeNodeEx.prototype._createSubNodes = function()
{
    // the smallest sub node has an area 
    if ((this.bounds.height * this.bounds.width) <= this.smallestSubNodeArea)
        return;

    var halfWidth = this.bounds.width / 2.0;
    var halfHeight = this.bounds.height / 2.0;

    this.nodes.push(new QuadTreeNodeEx().init(this.id, new RectEx().init(this.bounds.x, this.bounds.y, halfWidth, halfHeight), this.smallestSubNodeArea));
    this.nodes.push(new QuadTreeNodeEx().init(this.id, new RectEx().init(this.bounds.x, this.bounds.y + halfHeight, halfWidth, halfHeight), this.smallestSubNodeArea));
    this.nodes.push(new QuadTreeNodeEx().init(this.id, new RectEx().init(this.bounds.x + halfWidth, this.bounds.y, halfWidth, halfHeight), this.smallestSubNodeArea));
    this.nodes.push(new QuadTreeNodeEx().init(this.id, new RectEx().init(this.bounds.x + halfWidth, this.bounds.y + halfHeight, halfWidth, halfHeight), this.smallestSubNodeArea));
};

//////////////////// Public ////////////////////////////////

/// <summary>
/// Insert an item to this node
/// </summary>
/// <param name="p_objItem">The item we want to insert to under this node</param>
/// <returns>True if the item inserted to the tree, otherwise false - can be because the item is outside the tree boundaries</returns>
QuadTreeNodeEx.prototype.insert = function (p_objItem)
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
};



/// <summary>
/// Query the QuadTree for nodes that are in the given area
/// </summary>
/// <param name="p_objQueryArea">The area we want to search</param>
/// <returns>The nodes which is in the query area</returns>
QuadTreeNodeEx.prototype.searchNodes = function (p_objQueryArea)
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
};

/// <summary>
/// Query the QuadTree for items that are in the given area
/// </summary>
/// <param name="p_objQueryArea">The area we want to search</param>
/// <returns>The items which is in the query area</returns>
QuadTreeNodeEx.prototype.search = function (p_objQueryArea)
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
};

QuadTreeNodeEx.prototype.draw = function (p_objContext, p_blnDrawItems)
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
};