/**
* @class NeWMI.Tool.CreateTool
* <p>Represent the creation tool in the map.</p>
* <p>This tool is getting the geometry type to create, starting the mode of creation. When the user finished the creation it is firing an event.</p>
* @extends NeWMI.Tool.Base.AFeedbackTool
* @evented
* <pre><code>
* var createTool = new NeWMI.Tool.CreateTool();
* map.toolsMgr.add(createTool);
* createTool.on('creationFinished', this.onFinish);
* .
* .
* .
* map.toolsMgr.activate(createTool);
* createTool.start(NeWMI.Geometry.Base.AGeometry.EGeometryType.Ellipse);
* .
* .
* .
* function onFinish(evt)
* {
*   var myNewObject = new NeWMI.Object.NeWMIObject();
*   myNewObject.id = Math.random().toString();
*   myNewObject.geometry = evt.object;
*   myNewObject.boundsRect = myNewObject.geometry.getEnvelope().getRect();
* 
*   // Notifying the datasource to add the object
*   _layer.dataSource.addObject(myNewObject);
* }
* </code></pre>
*/
define(["dojo/_base/declare",
        "dojo/Evented",
        "NeWMI/Tool/Base/AFeedbackTool", 
        "NeWMI/Geometry/Base/AGeometry",
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Tool/EventObject"], 
        function(declare,
        		Evented,
        		AFeedbackTool, 
        		AGeometry,
        		AEventsManager,
        		EventObject)
{
	return declare("NeWMI.Tool.CreateTool", [ AFeedbackTool, Evented] ,
	{ 
		"-chains-" : 
		{
			constructor: "manual"
		},

	    /**
        * @constructor
        * Creates new CreateTool instance
        */
		constructor : function()
		{
			this.inherited(arguments);
			
			this.eventsNeeded.push(AEventsManager.EMapEvents.MouseDblClick);

			this.caption = "Create";
			
			this._feedbackLayer.drawRotateSign = false;
		},
		
		onMapEvent : function(evt)
		{
			if (!this.isStarted)
				return;
			
			if (evt.eventType == AEventsManager.EMapEvents.MouseDblClick)
			{
				// Because we are using the double click as the finish creation there are two points being added in the end of the 
				// poly, so here we'll remove one of them
				if (this._feedbackLayer.geometry.GeoType == AGeometry.EGeometryType.Polyline ||
					this._feedbackLayer.geometry.GeoType == AGeometry.EGeometryType.Polygon)
				{
					this._feedbackLayer.geometry.points.pop();
					this._feedbackLayer.geometry.dataChanged();
				}
				
				this.finish();
			}
			else
			{
				this.inherited(arguments);
			}
		},
		
		activate : function()
		{
			this.inherited(arguments);			
			this._feedbackLayer.showGeometry = false;
		},

	    /**
        * @method start
        * Starting to create the geometry
        * @param {NeWMI.Geometry.Base.AGeometry.EGeometryType} p_objGeo The geometry type to create
        */
		start : function(p_objGeo, p_blnFocusMap)
		{
		    this.inherited(arguments);
            
			this._feedbackLayer.showGeometry = false;
			this._focusMapAfterFinish = p_blnFocusMap;
		},
		
		_onMouseDown : function(evt)
		{
			this._feedbackLayer.showGeometry = true;
			
			this.inherited(arguments);
		},
		
		_onMouseUp : function(evt)
		{		
			this.inherited(arguments);
			
			if (this._feedbackLayer.geometry.GeoType != AGeometry.EGeometryType.Polyline &&
				this._feedbackLayer.geometry.GeoType != AGeometry.EGeometryType.Polygon)
			{
				this.finish();
			}
		},
		

	    /**
        * @method finish
        * Finishing the creation mode
        * @return The created geometry
        */
		finish : function(p_blnForceFinish)
		{
			var objNewGeometry = this._feedbackLayer.geometry;
			
			this._feedbackLayer.showGeometry = false;
			
			if ((objNewGeometry.GeoType == AGeometry.EGeometryType.Polyline && objNewGeometry.points.length < 2) ||
				(objNewGeometry.GeoType == AGeometry.EGeometryType.Polygon && objNewGeometry.points.length < 3))
			{
				objNewGeometry = null;
			}
			
			if (!p_blnForceFinish && objNewGeometry == null)
				return;
			
			this.inherited(arguments);
			
			if (this.isInputStarted) {
			    this._raiseCreatefinished(objNewGeometry);
			}
			else {
			    this._raiseCreatefinished(null);
			}
			
			if (this._focusMapAfterFinish)
			{
			
			}
			
			return objNewGeometry;
		},

	    /**
         * @event creationFinished
         * This even will be fired when creation of the geometry is finished
         * @param {NeWMI.Tool.EventObject} evt
         * @param {"creationFinished"} evt.type
         * @param {NeWMI.Geometry.Base.AGeometry} evt.object The new created geometry
         */
		_raiseCreatefinished : function(p_objNewGeometry)
		{
			var objOnCreationFinished = new EventObject(this);
			objOnCreationFinished.type = "creationFinished";
			objOnCreationFinished.object = p_objNewGeometry;
			objOnCreationFinished.raise();
		}
	});
});