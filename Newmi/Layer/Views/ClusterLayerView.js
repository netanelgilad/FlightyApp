/**
* @class NeWMI.Layer.Base.ClusterLayerView
* <p>Clustering view for layer</p>
* <p>Objects closed to each other will shown as single group of object</p>
* <p>The basic drawing for clustering is circle with label showing the number of objects in the cluster. 
* There are some properties for changing the styles. In anyway, there is option to override the NeWMI.Layer.Views.ClusterLayerView._drawSingleCluster.
* @extends NeWMI.Layer.Base.ACustomObjectsLayer
*/
define(["dojo/_base/declare",
        "dojox/collections/Dictionary", 
        "NeWMI/Structure/KDTree/KDTree2D", 
        "NeWMI/Draw/Draw2D", 
        "NeWMI/Geometry/Point", 
        "NeWMI/Layer/Views/Base/ALAyerView", 
        "NeWMI/Service/Create/RandomSvc", 
        "NeWMI/Draw/Types/Rect",
        "NeWMI/Structure/QuadTree/QuadTree",
        "NeWMI/Structure/QuadTree/QuadTreeItem",
        "NeWMI/Service/Math/MeasurementSvc"],
        
    function(declare, 
    		Dictionary, 
    		KDTree2D, 
    		Draw2D, 
    		Point, 
    		ALayerView, 
    		RandomSvc, 
    		Rect,
    		QuadTree,
    		QuadTreeItem,
    		MeasurementSvc)
{	
	return declare("NeWMI.Layer.Views.ClusterLayerView", ALayerView, 
	{
		
		"-chains-" : 
		{
			constructor: "manual"
		},
		
	    /**
        * @constructor
        * Creates new ClusterLayerView instance
        * @param {Object} params The initial parameters
        * @param {Function} params.hRefresh Callback which will be called when the cluster will need to refresh the layer
        * @param {NeWMI.Object.DataSource} params.datasource The layer datasource
        * @param {dojox.collections.Dictionary} params.selectedObjects The layer selection dictionary
        */
		constructor : function(params)
		{
			params = params || {};
			
			this._tree = null;
			this._clusterQuadTree = null;
						
		    /**
            * @property {Number} [clusterDist=50]
            *
            * The distance in pixels for clustering the objects
            */
			this.clusterDist = 50;
			
		    /**
            * @property {Number} [labelFont='12pt arial']
            *
            * The font of the label
            */
			this.labelFont = "12pt arial";
		    /**
            * @property {String} [strokeStyle='white']
            *
            * The style for stroking the cluster circle
            */
			this.strokeStyle = "white";
		    /**
            * @property {String} [fillStyle='red']
            *
            * The style for filling the cluster circle
            */
			this.fillStyle = "red";

			this._hDrawCircleCluster = function() { this.fill(); this.stroke(); };
			
		    /**
            * @property {Number} [maxObjectsInCluster=5000]
            *
            * The maximum objects to collect in single cluster
            */
			this.maxObjectsInCluster = 5000;
		
			this._hRefreshCallback = params.hRefresh || null;
			
			this._dataSource = params.datasource || null;
			this._buildTree();
			this._selectedObjects = params.selectedObjects || new Dictionary();
			
			this._connects = [];
			this._connects.push(this._dataSource.on("dataChanged", dojo.hitch(this, this.onDataSourceDataChanged)));
			
			this._inAnimation = false;
			this.bubbleAnimation = true;
		},
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////// Inits and Updates //////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		_buildTree : function()
		{	
			var arrObjs = [];
			this._dataSource.objects.forEach(function(item)
			{
				arrObjs.push( this._convertObjectToTreeItem(item.value) );
			}, this);
			
			this._tree = new KDTree2D(arrObjs);
		},
		
		_convertObjectToTreeItem : function(p_obj)
		{
			return { x:p_obj.geometry.getPresentationPoint().x, 
					 y:p_obj.geometry.getPresentationPoint().y, 
					 item: p_obj};
		},

		onDataSourceDataChanged : function (p_objParam)
		{
			if (p_objParam.object.type == "add")
			{
				p_objParam.object.objects.forEach(function(item)
				{
					this._tree.insert(this._convertObjectToTreeItem(item));
				}, this);
			}
			else 
			{
				this._buildTree();
			}
		},
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////// Draw and Calculations /////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		_getClusterResult : function(p_objMap,
									p_arrObjects, 
									p_dblSearchDist)
		{
			this.singleDrawObjects = new Dictionary();
			
			var dictDrawnObjs = new Dictionary();
			p_arrObjects.forEach(function(item)
			{
				dictDrawnObjs.add(item.id, item);
			});
			
			var dictObjs = new Dictionary();
			var objExtent = p_objMap.getExtent();
			objExtent.scale(2, 2);
			this._dataSource.search(objExtent).forEach(function(item)
			{
				dictObjs.add(item.id, item);
			});
			
			var singlesQuadTree = new QuadTree(RandomSvc.guid(), new Rect(-180, -90, 360, 180), 0.05);
			singlesQuadTree.allObjects = [];
			var clusterQuadTree = new QuadTree(RandomSvc.guid(), new Rect(-180, -90, 360, 180), 0.05);
			clusterQuadTree.allObjects = [];
			
			var arrSingleObjects = [];
			var arrClusterData = [];
			
			var dictUsedObjects = new Dictionary();
			
			while (dictObjs.count > 0)
			{
				var objCurrObject = dictObjs.getIterator().element.value;
				
				var res = this._tree.nearest(objCurrObject.geometry.getPresentationPoint(), this.maxObjectsInCluster, p_dblSearchDist);

	            var dblXSum = 0;
	            var dblYSum = 0;
	            var dblMaxDistance = 0;
	            var intSelectedObj = 0;

	            var arrObjectsInCluster = [];
	            
	            if (res.length == 0)
	            {
	            	dictObjs.remove(objCurrObject.id);
	            	dictUsedObjects.add(objCurrObject.id, objCurrObject);
	            }
	            else
	            {
	            	// One at least - Me
	            	res.forEach(function(item)
	            	{
	            		var objCurrObject = item[0].item || item[0].obj.item;
	            		if (!dictUsedObjects.containsKey(objCurrObject.id))
	            		{
	            			if (this._selectedObjects.containsKey(objCurrObject.id))
	            			{
	            				intSelectedObj++;
	            			}
	            			
	            			dictUsedObjects.add(objCurrObject.id, objCurrObject);
	            			dictObjs.remove(objCurrObject.id);

	            			dblMaxDistance = Math.max(dblMaxDistance, item[1]);

	            			dblXSum += objCurrObject.boundsRect.x;
	            			dblYSum += objCurrObject.boundsRect.y;

	            			arrObjectsInCluster.push(objCurrObject);
	            		}
	            	}, this);
	            }
								
				// Drawing the cluster
                if (arrObjectsInCluster.length > 1)
                {
                	var clusterObject = { id : RandomSvc.guid(),
                						  objects : arrObjectsInCluster,
                						  selectedObjCount : intSelectedObj,
                						  maxDistance : dblMaxDistance,
                						  centerPnt: {
                						      "x": dblXSum / arrObjectsInCluster.length,
                						      "y": dblYSum / arrObjectsInCluster.length
                						  } };
                	
                	dojo.mixin(clusterObject, new QuadTreeItem(
                        new Rect(clusterObject.centerPnt.x, clusterObject.centerPnt.y, dblMaxDistance, dblMaxDistance), clusterObject));
                	
                	clusterQuadTree.insert(clusterObject);
                	
                	clusterQuadTree.allObjects.push(clusterObject);
                }
                else
                {
                	if (dictDrawnObjs.containsKey(objCurrObject.id))
                	{
	                	this.singleDrawObjects.add(objCurrObject.id, objCurrObject);
	                
	                	singlesQuadTree.insert(objCurrObject);
	                	singlesQuadTree.allObjects.push(objCurrObject);
	                	arrSingleObjects.push(objCurrObject);
                	}
                }
			}
						
			return { singles : arrSingleObjects, singlesQT: singlesQuadTree, clusters : clusterQuadTree };
		},
		
		_drawClusters : function (p_objMap, p_objContext, p_arrClusters)
		{
			p_objContext.font = this.labelFont;
			p_objContext.textAlign = 'center';
			p_objContext.textBaseline = 'middle';
						
			this._clustersDrawQT =  new QuadTree(RandomSvc.guid(), new Rect(-180, -90, 360, 180), 0.05);
			
			p_arrClusters.forEach(function(item)
			{				
				var objClusterRect = this._drawSingleCluster(p_objMap, p_objContext, item);
				
				this._clustersDrawQT.insert(new QuadTreeItem(objClusterRect, item));
			},
			this);				
		},
		
	    /**
        * @method _drawSingleCluster
        * Drawing implementation for the cluster
        * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map which the cluster is drawn on
        * @param {Object} p_objContext The canvas context object
        * @param {Object} p_objCluster The cluster data
        * @param {String} p_objCluster.id Random generated ID
        * @param {NeWMI.Object.NeWMIObject[]} p_objCluster.objects The objects in the cluster
        * @param {Number} p_objCluster.selectedObjCount The amount of selected objects inside the cluster
        * @param {Number} p_objCluster.maxDistance The longest distance from the center of the cluster
        * @param {{x,y}} p_objCluster.centerPnt The center of the cluster
        * @param {Object} [p_objPnt=p_objCluster.centerPnt]
        * @param {Number} [transparency=1] 
        * @protected
        */
		_drawSingleCluster : function(p_objMap, p_objContext, p_objCluster, p_objPnt, transparency)
		{
			transparency = transparency != null ? transparency : 1;
			
			p_objPnt = p_objPnt || p_objCluster.centerPnt;
			
			var drawPoint = p_objMap.conversionsSvc.toScreen(p_objPnt.x, p_objPnt.y);
			
			var intRealSize = p_objCluster.objects.length + 8;
			var drawRadiusPixel = intRealSize;
			drawRadiusPixel = Math.min(this.clusterDist / 2.5, drawRadiusPixel);

			/*var drawRadius = p_objMap.conversionsSvc.toScreenSize(item.maxDistance) / 2;
			drawRadius = Math.max(drawRadius, 10);
			drawRadius = Math.min(this.clusterDist /2 , drawRadius);*/
			
			this._drawClusterCircle(p_objContext, drawPoint, drawRadiusPixel, p_objCluster.objects.length, p_objCluster.selectedObjCount);
			
			var dblRadius = p_objMap.conversionsSvc.toMapSize(drawRadiusPixel);
			
			var objRect = new Rect(p_objPnt.x, p_objPnt.y, dblRadius * 2, dblRadius * 2);
			
			return objRect;
		},
		
		_drawClusterCircle : function(p_objContext, p_objPnt, p_intRadius, p_intClusterObj, p_intSelectedInCluster)
		{
			p_objContext.strokeStyle = this.strokeStyle;
			p_objContext.fillStyle = this.fillStyle;
			Draw2D.ellipseCenter(p_objContext, p_objPnt.x, p_objPnt.y, p_intRadius, p_intRadius, 0, this._hDrawCircleCluster);
			
			p_objContext.fillStyle = this.strokeStyle;
			p_objContext.fillText(p_intClusterObj, p_objPnt.x, p_objPnt.y);			
		},
		
		_drawSingleObject : function(p_objMap, p_objContext, p_objObject, p_objPnt)
		{
			p_objPnt = p_objPnt || p_objObject.geometry.getPresentationPoint();
			
			p_objContext.fillStyle = "blue";
			
			Draw2D.pointGeometry(p_objMap, p_objContext, p_objPnt, 10);
		},
		
		_addAnim : function (objAnimIds, item, isClusterObject, isZoomIn, searchInCluster, reverese)
		{
			var objPnt = isClusterObject ? item.centerPnt : item.geometry.getPresentationPoint();
			var objRect = new Rect(objPnt.x, objPnt.y, 0,0);
			
			var itemsConnectedBefore = searchInCluster.search(objRect);
			
			if (itemsConnectedBefore.length > 0)
			{
				itemsConnectedBefore.forEach(function (itemConnectedBefore)
				{
					var fromPnt = itemConnectedBefore.centerPnt;
					var toPnt = objPnt;
					
					if (reverese)
					{
						toPnt = itemConnectedBefore.centerPnt;
						fromPnt = objPnt;
					}
					
					var dist = MeasurementSvc.distancePnts(fromPnt, toPnt);
					var angle = MeasurementSvc.getAngle(fromPnt.x, fromPnt.y, toPnt.x, toPnt.y);
													
					var objWay = { "x": dist * Math.sin(angle), "y": dist * Math.cos(angle) };
					
					var animatedItem = isZoomIn ? item : itemConnectedBefore;
					
					if (!objAnimIds.containsKey(animatedItem.id))
					{
						objAnimIds.add(animatedItem.id, animatedItem.id);
						
						this._animations.push( { isCluster: isClusterObject, 
												 item: animatedItem, 
												 position: dojo.clone(fromPnt), 
												 way : objWay } );
					}
				},this);
			}
		},
		
		//////////////////////////// Overrides ///////////////////////////////////
		
		isObjectDrawn : function (p_objToCheck)
		{
			return this.singleDrawObjects.containsKey(p_objToCheck.id);
		},
		
		draw : function (p_objMap, p_objContext, p_arrObjects)
		{
			this._animTime = 1000;
			
			if (!this._inAnimation)
			{
				var searchDist = p_objMap.conversionsSvc.toMapSize(this.clusterDist);
				
				this._newClusterRes = this._getClusterResult(p_objMap, p_arrObjects, searchDist);
				
				var intZoomDif = p_objMap.getZoom() - this._lastDrawnZoom;
				
				if (this.bubbleAnimation &&
					this._lastClusterRes && intZoomDif != 0 && this._hRefreshCallback)
				{
					this._inAnimation = true;
										
					this._animations = [];
					
					var isZoomIn =  intZoomDif > 0;
					
					var objAnimIds = new Dictionary();
					this._newClusterRes.clusters.allObjects.forEach (function (item)
					{
						this._addAnim(objAnimIds, item, true, isZoomIn, this._lastClusterRes.clusters);
					}, this);					
					this._newClusterRes.singlesQT.allObjects.forEach (function (item)
					{
						this._addAnim(objAnimIds, item, false, isZoomIn, this._lastClusterRes.clusters);
					}, this);
					
					this._lastClusterRes.singlesQT.allObjects.forEach (function (item)
					{
						this._addAnim(objAnimIds, item, false, true, this._newClusterRes.clusters, true);
					}, this);
					
					this._animStartTime = new Date().getTime();
					
					setTimeout(dojo.hitch(this, function() { this._hRefreshCallback(p_objMap); }), 1	);
					
					return [];
				}
			}
			else
			{
				var timeNow = new Date().getTime();
				
				var difTime = timeNow - this._animStartTime;
				
				if (difTime < this._animTime)
				{
					var percentageOfWay = (difTime / this._animTime);
					
					p_objContext.globalAlpha = percentageOfWay;
					
					this._animations.forEach(function(item)
					{
					    var newPos = {
					        "x": item.position.x + percentageOfWay * item.way.x,
					        "y": item.position.y + percentageOfWay * item.way.y
					    };
					
						if (item.isCluster)
						{
							this._drawSingleCluster(p_objMap, p_objContext, item.item, newPos, percentageOfWay);
						}
						else
						{
							this._drawSingleObject(p_objMap, p_objContext, item.item, newPos, percentageOfWay);
						}
					}, this);
					
					p_objContext.globalAlpha = 1;
				
					setTimeout(dojo.hitch(this, function() { this._hRefreshCallback(p_objMap); }), 1);
					
					return [];
				}
				else
				{
					this._inAnimation = false;
				}
			}
			
			this._drawClustersExpanded(p_objMap, p_objContext, this._newClusterRes);
			
			this._lastClusterRes = this._newClusterRes;
			this._lastDrawnZoom = p_objMap.getZoom();
			
			return this._newClusterRes.singles;
		},
		
		_drawClustersExpanded : function (p_objMap, p_objContext, p_objClusters)
		{
			var mapExtent = p_objMap.getExtent();
			mapExtent.scale(1.2, 1.2);

			var clustersToDraw = p_objClusters.clusters.search(mapExtent.getRect());
			
			this._drawClusters(p_objMap, p_objContext, clustersToDraw);
		},
		
	    /**
         * @method dispose
		 * Releasing all object resources
		 */
		dispose : function()
		{
			this._connects.forEach(function (item)
			{
				item.remove();
			});
		},
		
		/////////////////////////////// Search ////////////////////////////////////
		
		search: function (p_objGeo, p_blnExactSearch)
		{
			var objRes = [];
			
			if (this._clustersDrawQT)
			{
				var objRect = new Rect(p_objGeo.getXMin(), p_objGeo.getYMin(), p_objGeo.width, p_objGeo.height);
				var objClusterRes = this._clustersDrawQT.search(objRect);
				
				objClusterRes.forEach(function(objCurrCluster)
				{
					objCurrCluster.data.objects.forEach(function(objCurrObject)
					{
						objRes.push(objCurrObject);
					}, this);
					
				}, this);

				if (this.singleDrawObjects.count > 0)
				{
					var intSingleDraw = this.singleDrawObjects.count; 
					var objSingleSelectedObjects = this._dataSource.search(p_objGeo, p_blnExactSearch);

					for (var intCurrSelectedObj = 0; intCurrSelectedObj < objSingleSelectedObjects.length; ++intCurrSelectedObj)
					{
						var item = objSingleSelectedObjects[intCurrSelectedObj];
						
						if (this.isObjectDrawn(item))
						{
							objRes.push(item);
							
							--intSingleDraw;
							
							if (intSingleDraw == 0)
								break;
						}
					};
				}
			}
			
			return objRes;
		}
	});
});