define(["dojo/_base/declare", 
        "NeWMI/Structure/KDTree/KDTreeNode", 
        "NeWMI/Structure/BinaryHeap"], 
		function(declare, 
				KDTreeNode, 
				BinaryHeap)
{
	return declare("NeWMI.Structure.KDTree.KDTree", null, 
	{
		constructor : function(points, metric, dimensions) 
		{
			this._metric = metric;
			this._dimensions = dimensions;
			
			this.root = this._buildTree(points, 0, null);
		},
		
		_buildTree : function (points, depth, parent) 
		{
			var dim = depth % this._dimensions.length;
			var median;
			var node;

			if (points.length === 0) {
				return null;
			}
			if (points.length === 1) {
				return new KDTreeNode(points[0], dim, parent);
			}

			var me = this;
			points.sort(function (a, b) 
					{
				return a[me._dimensions[dim]] - b[me._dimensions[dim]];
			});

			median = Math.floor(points.length / 2);
			node = new KDTreeNode(points[median], dim, parent);
			node.left = this._buildTree(points.slice(0, median), depth + 1, node);
			node.right = this._buildTree(points.slice(median + 1), depth + 1, node);

			return node;
		},
		
		
		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////// INSERT /////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		insert : function (point) 
		{
			var insertPosition = this._innerSearch(point, this.root, null);

			if (insertPosition === null) 
			{
				this.root = new KDTreeNode(point, 0, null);
				return;
			}

			var newNode = new KDTreeNode(point, (insertPosition.dimension + 1) % this._dimensions.length, insertPosition);
			var dimension = this._dimensions[insertPosition.dimension];

			if (point[dimension] < insertPosition.obj[dimension]) 
			{
				insertPosition.left = newNode;
			} 
			else 
			{
				insertPosition.right = newNode;
			}
		},
		
		_innerSearch : function(point, node, parent) 
		{
			if (node === null) 
			{
				return parent;
			}

			var dimension = this._dimensions[node.dimension];
			if (point[dimension] < node.obj[dimension]) 
			{
				return this._innerSearch(point, node.left, node);
			} 
			else 
			{
				return this._innerSearch(point, node.right, node);
			}
		},
		
		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////// REMOVE /////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////

		remove : function (point) 
		{
			var node = this._nodeSearch(point, this.root);

			if (node === null) 
				return;

			this._removeNode(node);
		},
		
		_nodeSearch : function(point, node) 
		{
			if (node === null) {
				return null;
			}

			if (node.obj === point) {
				return node;
			}

			var dimension = this._dimensions[node.dimension];

			if (point[dimension] < node.obj[dimension]) 
			{
				return this._nodeSearch(point, node.left, node);
			} 
			else 
			{
				return this._nodeSearch(point, node.right, node);
			}
		},

		_findMax : function(node, dim) 
		{
			if (node === null)
			{
				return null;
			}

			var dimension = this._dimensions[dim];
			if (node.dimension === dim) 
			{
				if (node.right !== null) 
				{
					return this._findMax(node.right, dim);
				}
				return node;
			}

			var own = node.obj[dimension];
			var left = this._findMax(node.left, dim);
			var right = this._findMax(node.right, dim);
			var max = node;

			if (left !== null && left.obj[dimension] > own) 
			{
				max = left;
			}

			if (right !== null && right.obj[dimension] > max.obj[dimension]) 
			{
				max = right;
			}
			return max;
		},

		_findMin : function(node, dim) 
		{

			if (node === null) 
			{
				return null;
			}

			var dimension = this._dimensions[dim];

			if (node.dimension === dim) 
			{
				if (node.left !== null) 
				{
					return this._findMin(node.left, dim);
				}
				return node;
			}

			var own = node.obj[dimension];
			var left = this._findMin(node.left, dim);
			var right = this._findMin(node.right, dim);
			var min = node;

			if (left !== null && left.obj[dimension] < own) 
			{
				min = left;
			}
			if (right !== null && right.obj[dimension] < min.obj[dimension]) 
			{
				min = right;
			}
			return min;
		},

		_removeNode : function(node) 
		{
			var nextNode,
			nextObj,
			pDimension;

			if (node.left === null && node.right === null) 
			{
				if (node.parent === null) 
				{
					this.root = null;
					return;
				}

				pDimension = this._dimensions[node.parent.dimension];

				if (node.obj[pDimension] < node.parent.obj[pDimension]) 
				{
					node.parent.left = null;
				} 
				else 
				{
					node.parent.right = null;
				}
				return;
			}

			if (node.left !== null) 
			{
				nextNode = this._findMax(node.left, node.dimension);
			} 
			else 
			{
				nextNode = this._findMin(node.right, node.dimension);
			}

			nextObj = nextNode.obj;
			this._removeNode(nextNode);
			node.obj = nextObj;
		},
		
		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////// UPDATE /////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		update : function (point)
		{
			this.remove(point);
			this.insert(point);
		},
		
		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////// NEARST /////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////

		nearest : function (point, maxNodes, maxDistance, sort) 
		{
			var bestNodes = [];
			
			if (sort)
			{
				bestNodes = new BinaryHeap( function (e) { return -e[1]; } );
			
				if (maxDistance) 
				{
					for (i = 0; i < maxNodes; i += 1) 
					{
						bestNodes.push([null, maxDistance]);
					}
				}
			}

			this._nearestSearch(point, maxNodes, bestNodes, this.root, maxDistance);

			var result = [];

			if (sort)
			{
				for (var i = 0; i < maxNodes; i += 1) 
				{
					if (bestNodes.content[i][0]) 
					{
						result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
					}
				}
			}
			else
			{
				result = bestNodes;
			}
			
			return result;
		},
		
		_nearestSearch : function(point, maxNodes, bestNodes, node, searchDist) 
		{
			
			var dimension = this._dimensions[node.dimension];
			var ownDistance = this._metric(point, node.obj);
			var linearPoint = {};

			for (var i = 0; i < this._dimensions.length; i += 1) 
			{
				if (i === node.dimension) 
				{
					linearPoint[this._dimensions[i]] = point[this._dimensions[i]];
				} 
				else 
				{
					linearPoint[this._dimensions[i]] = node.obj[this._dimensions[i]];
				}
			}

			var linearDistance = this._metric(linearPoint, node.obj);

			if (node.right === null && node.left === null) 
			{
				if ((bestNodes.size && bestNodes.size() < maxNodes) || ownDistance < searchDist) 
				{
					this._saveNode(bestNodes, maxNodes, node, ownDistance);
				}
				return;
			}

			var bestChild;
			if (node.right === null) 
			{
				bestChild = node.left;
			} 
			else if (node.left === null) 
			{
				bestChild = node.right;
			} 
			else 
			{
				if (point[dimension] < node.obj[dimension]) 
				{
					bestChild = node.left;
				} 
				else 
				{
					bestChild = node.right;
				}
			}

			this._nearestSearch(point, maxNodes, bestNodes, bestChild, searchDist);

			if ((bestNodes.size && bestNodes.size() < maxNodes) || ownDistance < searchDist) 
			{
				this._saveNode(bestNodes, maxNodes, node, ownDistance);
			}

			if ((bestNodes.size && bestNodes.size() < maxNodes) || Math.abs(linearDistance) < searchDist) 
			{
				var otherChild;
				
				if (bestChild === node.left) 
				{
					otherChild = node.right;
				} 
				else 
				{
					otherChild = node.left;
				}
				if (otherChild !== null) 
				{
					this._nearestSearch(point, maxNodes, bestNodes, otherChild, searchDist);
				}
			}
		},
		
		_saveNode : function (bestNodes, maxNodes, node, distance) 
		{
			bestNodes.push([node, distance]);
			if ((bestNodes.size && bestNodes.size()) || (bestNodes.length) > maxNodes)
				 
			{
				bestNodes.pop();
			}
		},
		
		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////// Other //////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		balanceFactor : function () 
		{              
			return this._height(this.root) / (Math.log(this._count(this.root)) / Math.log(2));
		},
		
		_height : function(node) 
		{
			if (node === null) 
			{
				return 0;
			}
			return Math.max(this._height(node.left), this._height(node.right)) + 1;
		},

		_count : function(node) 
		{
			if (node === null) 
			{
				return 0;
			}
			
			return this._count(node.left) + this._count(node.right) + 1;
		}
	});
});