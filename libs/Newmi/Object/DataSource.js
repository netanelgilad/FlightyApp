/**
* @class NeWMI.Object.DataSource
* The data binder between the user data and the layers.
* <p/>The datasource should be notified for every change related to the object in the geometry, for every new object or removed.
* @evented
*/
define(["dojo/_base/declare",
        "dojo/Evented",
        "dojox/collections/Dictionary",
        "NeWMI/Draw/Types/Rect",
        "NeWMI/Structure/QuadTree/QuadTree", 
        "NeWMI/Service/Math/RelationalOpGeo",
        "NeWMI/Modules/GeometryModule",
        "NeWMI/Tool/EventObject"], function(declare, Evented, Dictionary, Rect, QuadTree, RelationalOpGeo, Geometry, EventObject){
	return declare("NeWMI.Object.DataSource", Evented, 
	{
			
		/**
         * @constructor
         * Creates new DataSource instance
		 * @param {String} p_strID the id for the datasource - Must be unique
		 * @param {Array} p_objObjects the objects we want to add to the datasource - from type NeWMI.Object.NeWMIObject
		 */
		constructor : function (p_strID, p_objObjects)
		{
		    /**
            * @property {string} id
            *
            * The datasource ID - Must be unique
            * @readonly
            */
			this.ID = p_strID;
			
			this._treeData = new QuadTree(p_strID, new Rect(-180, -90, 360, 180), 0.05);

		    /**
            * @property {dojox.collections.Dictionary} objects 
            *
            * The NeWMI objects collection contained within this datasource.<p/>
            * The keys in this dictionary are the Ids of the NeWMI.Object.NeWMIObject and the value are the objects.
            * @readonly
            */
			this.objects = new Dictionary();
			
			this.addObjects(p_objObjects);
		},
		
	    /**
         * @method addObjects
		 * Adding objects to the datasource
         *
		 * @param {Array} p_objObjects The objects we want to add to the datasource - from type NeWMI.Object.NeWMIObject
		 */
		addObjects : function (p_objObjects)
		{
			for(var idx = 0;idx < p_objObjects.length; idx++)
			{	
				this.addObject(p_objObjects[idx], true);
			}
			
			this._raiseDataSourceDataChanged( { type: "add", objects: p_objObjects } );
		},
		
		/**
		 * @method addObject
         * Adding a single object to the datasource
		 *
         * @param {NeWMI.Object.NeWMIObject} p_objObject
		 * @param {Boolean} [p_blnNoEvents = false] Send true when we want to raise event for the change
		 */
		addObject : function(p_objObject, p_blnNoEvents)
		{
			this._treeData.insert(p_objObject);
			this.objects.add(p_objObject.id, p_objObject);
			
			if (!p_blnNoEvents)
				this._raiseDataSourceDataChanged( { type: "add", objects: [ p_objObject ]} );
		},
		
		/**
		 * @method updateObject
         * Tell the data source that an object has been updated
		 * @param {NeWMI.Object.NeWMIObject} p_objObject The updated object within the datasource
		 * @param {Boolean} [p_blnUpdateRect=false] Send true when we the method to update the object NeWMI.Object.NeWMIObject.BoundsRect property automatically
		 */
		updateObject : function(p_objObject, p_blnUpdateRect)
		{
			if (p_blnUpdateRect)
			{
				p_objObject.boundsRect = p_objObject.geometry.getEnvelope().getRect();
			}
			
			this._treeData.remove(p_objObject);
			this._treeData.insert(p_objObject);
			
			this._raiseDataSourceDataChanged( { type: "update", objects: [p_objObject] } );
		},
		
		/**
		 * @method removeObject
         * Removing a single object to the datasource
		 * @param {NeWMI.Object.NeWMIObject} p_objObject
		 */
		removeObject : function(p_objObject)
		{
			this._treeData.remove(p_objObject);
			this.objects.remove(p_objObject.id);
			
			this._raiseDataSourceDataChanged( { type: "remove", objects: [p_objObject] } );
		},
		
		/**
		 * @method clear
         * Removing all the objects in the datasource
		 */
		clear : function()
		{
			var objects = this.objects.clone();
			
			this.objects.clear();
			this._treeData.clearAll();
			
			this._raiseDataSourceDataChanged( { type: "clear", objects: objects.getValueList() } );
		},
		
		/**
		 * @method search
         * Searching for objects in the datasource in a given rectangle
		 * @param {NeWMI.Geometry.Rectangle} p_objEnvelope The area we want to search for the object in this datasource
		 * @param {Boolean} [p_blnExactIntersection=false] Send true when we want to perform query of the real geometry. Send false when we want fast querying, less accurate, geometries bounds rectangles intersections
		 * @return {Array} Array of the NeWMI.Object.NeWMIObject within the given geometry
		 */
		search : function(p_objEnvelope, p_blnExactIntersection)
		{
			var objRectQuery = new Rect(p_objEnvelope.getXMin(), p_objEnvelope.getYMin(), p_objEnvelope.width, p_objEnvelope.height);
			
			var objSuspectedSearchResObjects = this._treeData.search(objRectQuery);
			
			p_blnExactIntersection = p_blnExactIntersection != null ? p_blnExactIntersection : false;
					
			var arrSearchResObjects = [];
														
			if(objSuspectedSearchResObjects != null)
			{				
				objSuspectedSearchResObjects.forEach(function(objCurrentObj)
				{					
					var blnRes = false;
					
					if (!p_blnExactIntersection || objCurrentObj.geometry == null)
					{
						blnRes = true;	
					}
					else if(objCurrentObj.geometry.GeoType == NeWMI.Geometry.Base.AGeometry.EGeometryType.Point)
					{	
						blnRes = RelationalOpGeo.isPointInRectangle(objCurrentObj.geometry, p_objEnvelope);
					}
					else if (objCurrentObj.geometry.GeoType == NeWMI.Geometry.Base.AGeometry.EGeometryType.Rectangle)
					{
						blnRes = RelationalOpGeo.isRectanglesIntersected(objCurrentObj.geometry, p_objEnvelope, true, false);
					}	
					else if (objCurrentObj.geometry.GeoType == NeWMI.Geometry.Base.AGeometry.EGeometryType.Polygon)
					{
					    blnRes = RelationalOpGeo.isRectangleIntersectsPolygon(p_objEnvelope, objCurrentObj.geometry, true, false);
					}
					else if ((objCurrentObj.geometry.GeoType == NeWMI.Geometry.Base.AGeometry.EGeometryType.Polyline) ||
							 (objCurrentObj.geometry.GeoType == NeWMI.Geometry.Base.AGeometry.EGeometryType.Arrow))
					{
						blnRes = RelationalOpGeo.isPolylineIntersectsRectangle(objCurrentObj.geometry, p_objEnvelope, true);
					}	
					else if (objCurrentObj.geometry.GeoType == NeWMI.Geometry.Base.AGeometry.EGeometryType.Circle)
					{
						blnRes = RelationalOpGeo.isRectangleIntersectsCircle(p_objEnvelope, 
																			   objCurrentObj.geometry, 
																			   true);
					}
					else if (objCurrentObj.geometry.GeoType == NeWMI.Geometry.Base.AGeometry.EGeometryType.Ellipse)
					{
						blnRes = RelationalOpGeo.isRectangleIntersectsEllipse(p_objEnvelope, 
																			   objCurrentObj.geometry, 
																			   true);
					}
					
					if (blnRes)
					{
						arrSearchResObjects.push(objCurrentObj);
					}
				}, this);
			}		
			
			return arrSearchResObjects;
		},
		
	    /**
         * @event dataChanged
         * Fired when the datasource has changed
         * @param {NeWMI.Tool.EventObject} evt
         * @param {"dataChanged"} evt.type
         * @param {Object} evt.object The data of the event
         * @param {String} evt.object.type The change type  - One of the following strings: "add" | "remove" | "update"
         * @param {Array} evt.object.objects The objects who changed
         */
		_raiseDataSourceDataChanged : function(p_objParam)
		{			
			var objOnDataSrouceDataChanged = new EventObject(this);
			objOnDataSrouceDataChanged.type = "dataChanged";
			objOnDataSrouceDataChanged.object = p_objParam;
			objOnDataSrouceDataChanged.raise();
		}
	});
});