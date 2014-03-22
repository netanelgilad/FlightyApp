define(["dojo/_base/declare",
        "dojo/Evented",
        "NeWMI/Tool/Base/ATool",
        "NeWMI/Tool/SelectionTool",
        "NeWMI/Tool/EventObject",
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Geometry/Rectangle"], 
        function(declare, 
        		Evented,
        		ATool,
        		SelectionTool,
        		EventObject,
        		AEventsManager,
        		Rectangle)
{
	return declare("NeWMI.Tool.ExtendedSelectionTool", [ ATool, Evented ],
	{ 

		"-chains-" : 
		{
			constructor: "manual"
		},

		constructor : function()
		{
			this.inherited(arguments, [[ AEventsManager.EMapEvents.MouseDown, AEventsManager.EMapEvents.MouseDrag, AEventsManager.EMapEvents.MouseUp ]]);
			
			this.caption = "Extended Selection Tool";
			
			this.selectionTool = new SelectionTool();
			
			this.selectionTool.eventsNeeded = [];

			this._skipEvents = false;
		},
		
		init : function(p_objMap)
		{
			this.inherited(arguments);
			
			this.selectionTool.init(p_objMap);
		},
		
		_setActiveTool : function (p_objTool)
		{
			if (this._activeTool === p_objTool)
				return;
				
			if (this._activeTool)
				this._activeTool.deactivate();
			
			 this._activeTool = p_objTool;
			 
			 if (this._activeTool)
				 this._activeTool.activate();
		},
		
		activate : function()
		{
			this.inherited(arguments);
			this._setActiveTool(this.selectionTool);
			this.map.enablePan();
		},
		
		deactivate : function()
		{
			this.inherited(arguments);
			this._setActiveTool(null);
			this.map.disablePan();
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
			this._skipEvents = false;
			
			if (evt.ctrlKey)
			{
				this.map.disablePan(true);

				this.selectionTool.onMapEvent(evt);
			}
			else
			{
				this._skipEvents = true;
				
				var arrSelected = [];
				
				if (evt.button == 0)
				{
					arrSelected = this.selectionTool._performSelection(evt.mapPoint.getEnvelope());
				}
				this._raiseOnClickEvent(arrSelected);
				
				var intSelection = 0;
				arrSelected.forEach(function(item)
				{
					intSelection += item.objects.length;
				});
				
				if (intSelection > 0)
				{
					this.map.disablePan(true);
					// Working for ESRI !!!
					//this.map.core.navigationManager.mouseEvents.onMouseUp(evt.coreEvt);
					//this.map.core.navigationManager.mouseEvents.

					//evt.coreEvt.stopPropagation();
					//evt.coreEvt.cancelBubble = true;
					//this.map.core.onMouseUp(evt.coreEvt);
				}
					
			}
		},
		
		_onMouseDrag : function(evt)
		{
			if (this._skipEvents)
				return;
			
			this.selectionTool._onMouseDrag(evt);
		},
		_onMouseUp : function(evt)
		{	
			if (this._skipEvents)
				return;
			
			this.selectionTool._onMouseUp(evt);
		},
		
		_raiseOnClickEvent : function (p_arrSelection)
		{
			var objOnDataSrouceDataChanged = new EventObject(this);
			objOnDataSrouceDataChanged.type = "OnClick";
			objOnDataSrouceDataChanged.object = p_arrSelection;
			objOnDataSrouceDataChanged.raise();
		}
	});
});