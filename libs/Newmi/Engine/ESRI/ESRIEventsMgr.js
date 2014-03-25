/**
* @class NeWMI.Engine.ESRI.EventsMgr
* <p>Provides a ESRI map events manager.</p>
* We use this class for listening to map events, such as mouse up, extent changed,...
* @extends NeWMI.Map.Base.AEventsManager
*/
define(["dojo/_base/declare", "dojo/on", "NeWMI/Map/Base/AEventsManager", "NeWMI/Geometry/Point"], function (declare, on, AEventsManager, Point) {
	return declare("NeWMI.Engine.ESRI.EventsMgr", AEventsManager,{ 
		
		"-chains-" : 
		{
			constructor: "manual"
		},
		
		constructor: function(p_objMap, p_objHandlerClass, p_hCallback) 
		{
			this.inherited(arguments);
			
			this.eventsFunctions = {};
			this.eventsFunctions[AEventsManager.EMapEvents.MouseDown] 	= "mouse-down";
			this.eventsFunctions[AEventsManager.EMapEvents.MouseUp] 	= "mouse-up";
			this.eventsFunctions[AEventsManager.EMapEvents.MouseMove] 	= "mouse-move";
			this.eventsFunctions[AEventsManager.EMapEvents.MouseDrag] 	= "mouse-drag";
			this.eventsFunctions[AEventsManager.EMapEvents.MouseDblClick] = "dbl-click";
			this.eventsFunctions[AEventsManager.EMapEvents.KeyDown] 	= "key-down";
			this.eventsFunctions[AEventsManager.EMapEvents.KeyUp] 		= "key-up";
			this.eventsFunctions[AEventsManager.EMapEvents.Panning]		= "pan"; 
            this.eventsFunctions[AEventsManager.EMapEvents.Zooming]		= "zoom";
			this.eventsFunctions[AEventsManager.EMapEvents.ExtentChange]= "extent-change";
			this.eventsFunctions[AEventsManager.EMapEvents.MapLayoutChange] = "newmiLayoutChange";
		},
		
		_connectEvent: function(p_strEvent)
		{
		    var objEvents;

		    switch (p_strEvent)
		    {
		        case ('newmiLayoutChange'):
		        {
		            objEvents = [];
		            objEvents.push(this.map.core.on('resize', dojo.hitch(this, this.newmiLayoutChange)));
		            objEvents.push(this.map.core.on('reposition', dojo.hitch(this, this.newmiLayoutChange)));
		        }
		        break;
		        default:
		        {
		            objEvents = this.map.core.on(p_strEvent, dojo.hitch(this, this[p_strEvent.replace('-', '_')]));
		        }
		    }

		    return objEvents;
		},
		
		_wrapEvent : function(p_eEventType, evt)
		{			
			var newmiEvt = {};
			
			switch (p_eEventType)
			{
				case AEventsManager.EMapEvents.MouseDown:
				case AEventsManager.EMapEvents.MouseDrag:
				case AEventsManager.EMapEvents.MouseUp:
				case AEventsManager.EMapEvents.MouseMove:
				case AEventsManager.EMapEvents.MouseDblClick:
				{
				    newmiEvt.screenPoint = this.map.conversionsSvc.pageToControl(evt.pageX, evt.pageY);
				    newmiEvt.mapPoint = new Point({ "x": evt.mapPoint.x, "y": evt.mapPoint.y });

					newmiEvt.button = evt.button;
					newmiEvt.altKey = evt.altKey;
					newmiEvt.ctrlKey = evt.ctrlKey;
					newmiEvt.shiftKey = evt.shiftKey;
				}
				break;
				default:
				{
					newmiEvt = evt;
				}
				break;
			}
			
			newmiEvt.coreEvt = evt;
			
			this.inherited(arguments, [ p_eEventType, newmiEvt] );

			this._raiseCallback(newmiEvt);
		},
		
		dbl_click : function (evt)
		{
			this._wrapEvent(AEventsManager.EMapEvents.MouseDblClick, evt);
		},
		
		mouse_down : function (evt)
		{
			this._wrapEvent(AEventsManager.EMapEvents.MouseDown, evt);
		},
		
		mouse_up : function (evt)
		{
			this._wrapEvent(AEventsManager.EMapEvents.MouseUp, evt);
		},
		
		mouse_move : function (evt)
		{
			this._wrapEvent(AEventsManager.EMapEvents.MouseMove, evt);
		},
		
		mouse_drag : function (evt)
		{
			this._wrapEvent(AEventsManager.EMapEvents.MouseDrag, evt);
		},
		
		key_down : function (evt)
		{
			this._wrapEvent(AEventsManager.EMapEvents.KeyDown, evt);
		},
		
		key_up : function (evt)
		{
			this._wrapEvent(AEventsManager.EMapEvents.KeyUp, evt);
		},
		
		pan: function(evt)
		{
			this._wrapEvent(AEventsManager.EMapEvents.Panning, { 'extent' : evt.extent, 'delta' : evt.delta } );
		},
		
		zoom: function(evt)
		{
			this._wrapEvent(AEventsManager.EMapEvents.Zooming, { 'extent' : evt.extent, 'zoomFactor' : evt.zoomFactor, 'anchor' : evt.anchor, 'level' : evt.level } );
		},
		
		extent_change: function(evt) 
		{
			this._wrapEvent(AEventsManager.EMapEvents.ExtentChange, { 'extent' : evt.extent, 'delta' : evt.delta, 'levelChange' : evt.levelChange, 'lod' : evt.lod } );
		},
		
		newmiLayoutChange: function (evt)
		{
		    this._wrapEvent(AEventsManager.EMapEvents.MapLayoutChange, this.map.getControlLayout(true));
		}
	});
});