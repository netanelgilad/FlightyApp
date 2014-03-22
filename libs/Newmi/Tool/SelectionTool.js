/**
* @class NeWMI.Tool.SelectionTool
* <p>Represent the selection tool in the map.</p>
* <p>The tool is waiting for the user to draw a shape on the map and then setting the objects within or intersects it</p>
* This tool is using the NeWMI.Selection.SelectionManager for querying and setting the selection.
* @extends NeWMI.Tool.Base.ATool
*/
define(["dojo/_base/declare", 
        "NeWMI/Tool/Base/ATool", 
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Layer/Base/ACustomLayer",
        "NeWMI/Geometry/Base/AGeometry",
        "NeWMI/Geometry/Rectangle",
        "NeWMI/Draw/Draw2D",
        "NeWMI/Layer/Base/ALayersManager",
        "NeWMI/Tool/Feedback/GeometryFeedbackFactory",
        "NeWMI/Selection/MultiSelect/MultiSelectionTool"],
        function(declare, 
        		ATool, 
        		AEventsManager,
        		ACustomLayer,
                AGeometry,
        		Rectangle,
        		Draw2D,
        		ALayersManager,
        		GeometryFeedbackFactory,
                MultiSelectionTool)
{
	var SelectionTool = declare("NeWMI.Tool.SelectionTool", ATool,
	{ 

		"-chains-" : 
		{
			constructor: "manual"
		},

	    /**
        * @constructor
        * Creates new SelectionTool instance
        */
		constructor : function()
		{
			this.inherited(arguments, [[AEventsManager.EMapEvents.MouseDown, AEventsManager.EMapEvents.MouseDrag, AEventsManager.EMapEvents.MouseUp]]);
			
			this.id = "Tool_NeWMI_Selection";
			
			this.caption = "Selection";
			
		    /**
            * @property {NeWMI.Geometry.Base.AGeometry.EGeometryType} geoType
            * The geometry type for the selection geometry
            */
			this.geoType = AGeometry.EGeometryType.Rectangle;

			this._selectionLayer = new SelectionTool.Layer();
			this._feedback = null;

		    /**
            * @property {Object} multiSelection
            * @property {Boolean} multiSelection.show=true If true, when selecting more then one object it will perform a multi selection Handling. See NeWMI.Selection.MultiSelect.MultiSelectionTool.
            * @property {NeWMI.Draw.Types.Rect} [multiSelection.cancelRect] The rectangle in the objects images of the 'remove from selection' button
            * @property {Function} [multiSelection.getObjectsImages] Showing multi selection
            * @property {Function} multiSelection.maxSelection=20 The maximum selection items to show on the screen
            * Parameters for multi selection handling
            */
			this.multiSelection = {
			    show: true,
			    cancelRect: null,
			    getObjectsImages: null,
			    maxSelection: 20,
			};
		},
		
		activate : function()
		{
			this.inherited(arguments);
			
			this.map.layersMgr.insertLayer(ALayersManager.LayersTypes._Additional, this._selectionLayer);
			this.map.disablePan();
		},
		
		deactivate : function()
		{
			this.inherited(arguments);
			
			this.map.layersMgr.removeLayer(ALayersManager.LayersTypes._Additional, this._selectionLayer);
			this.map.enablePan();
		},

		onMapEvent : function(evt)
		{
			switch (evt.eventType)
			{
				case AEventsManager.EMapEvents.MouseDown:
				{
					this._onMouseDown(evt);
					break;
				}
				case AEventsManager.EMapEvents.MouseDrag:
				{
					this._onMouseDrag(evt);
					break;
				}
				case AEventsManager.EMapEvents.MouseUp:
				{
					this._onMouseUp(evt);
					break;
				}
			}
		},
		
		_onMouseDown : function(evt)
		{	
		    //var objRect = new Rectangle({ xCenter: evt.mapPoint.x, yCenter: evt.mapPoint.y, width: 0, height: 0 });
		    //this._selectionLayer.selectionGeo = objRect;
		    //this._feedback = GeometryFeedbackFactory.create(this.map, objRect);

		    this._feedback = GeometryFeedbackFactory.create(this.map, this.geoType);
		    this._selectionLayer.selectionGeo = this._feedback._geometry;

			this._feedback.mouseDown(evt);
		},
		_onMouseDrag : function(evt)
		{
		    if (this._selectionLayer.selectionGeo != null)
		    {
				this._feedback.mouseDrag(evt);
				this._selectionLayer.refresh();
		    }
		},
		_onMouseUp : function(evt)
		{			
		    if (this._selectionLayer.selectionGeo != null)
		    {
				this._feedback.mouseUp(evt);
				this._feedback.end();
				this._feedback = null;
				
				var objSelectionRect = this._selectionLayer.selectionGeo;
				objSelectionRect.fixLimitValues();
				
				if (objSelectionRect == null)
				{
					return;
				}
				
				this._selectionLayer.selectionGeo = null;
				this._selectionLayer.refresh();
				
				this._performSelection(objSelectionRect);
		    }
		},
		
		_performSelection : function(p_objSelectionRect)
		{
		    var hitToleranceMapUnits = this.map.selectionMgr.getHitToleranceMapUnits();

            // Inflating the rectangle incase we need
		    p_objSelectionRect.width = p_objSelectionRect.width || 2 * hitToleranceMapUnits.width;
		    p_objSelectionRect.height = p_objSelectionRect.height || 2 * hitToleranceMapUnits.height;
			p_objSelectionRect.dataChanged();
			
			var arrSelected = this.map.selectionMgr.queryMgr.query(p_objSelectionRect);
			
			this.lastSelectionQueryGeo = p_objSelectionRect;
			
			this.map.selectionMgr.setterMgr.set(arrSelected);
			
            // Popping the multi selection layout incase we need to
			if (this.multiSelection.show && this.multiSelection.getObjectsImages) {

			    if (!this.multiSelection.tool) {
			        this.multiSelection.tool = new MultiSelectionTool({ map: this.map, maxSelection: this.multiSelection.maxSelection });
			    }

			    if (this.multiSelection.tool.canActivate(arrSelected)) {

			        this.multiSelection.tool.prepare({
			            lastTool: this,
			            getObjectsImagesFunc: this.multiSelection.getObjectsImages,
			            startPoint: p_objSelectionRect.getPresentationPoint(),
			            cancelRect: this.multiSelection.cancelRect,
			            objects: arrSelected
			        });
			        
			        this.map.toolsMgr.add(this.multiSelection.tool);

			        this.map.toolsMgr.activate(this.multiSelection.tool);
			    }
			}
			
			return arrSelected;
		}
	});
	
	SelectionTool.Layer = declare("NeWMI.Tool.SelectionTool.Layer", ACustomLayer,
	{
		"-chains-" : 
		{
			constructor: "manual"
		},
		
		constructor : function()
		{
			this.inherited(arguments, [false, true]);
			this.selectionGeo = null;
			this.lineWidth = 1;
			this.strokeStyle = "rgba(51,153,255, 1)";
			this.fillStyle = "rgba(51,153,255, 0.2)";
		},
				
		draw2D : function(p_objMap, p_objContext)
		{
		    if (this.selectionGeo != null)
			{
				p_objContext.lineWidth = this.lineWidth;
				p_objContext.strokeStyle = this.strokeStyle;
				p_objContext.fillStyle = this.fillStyle;
			
				Draw2D.geometry(p_objMap, p_objContext, this.selectionGeo, function () { this.fill(); this.stroke(); });
			}
		}
	});
	
	return SelectionTool;
});