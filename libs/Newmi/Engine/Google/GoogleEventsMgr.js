/**
* @class NeWMI.Engine.Google.EventsMgr
* <p>Provides a Google map events manager.</p>
* We use this class for listening to map events, such as mouse up, extent changed,...
* @extends NeWMI.Map.Base.AEventsManager
*/
define(["dojo/_base/declare", "dojo/on", "NeWMI/Map/Base/AEventsManager", "NeWMI/Geometry/Point"],
		function(declare, on, AEventsManager, Point){
	return declare("NeWMI.Engine.Google.EventsMgr", AEventsManager,{ 
		
		"-chains-" : 
		{
			constructor: "manual"
		},
		
		constructor: function(p_objMap, p_objHandlerClass, p_hCallback) 
		{
			this.inherited(arguments);
			
			this.eventsFunctions = {};
			this.eventsFunctions[AEventsManager.EMapEvents.MouseUp] 	  = "newmiMouseUp";
			this.eventsFunctions[AEventsManager.EMapEvents.MouseMove] 	  = "newmiMouseMove";
			this.eventsFunctions[AEventsManager.EMapEvents.MouseDown] 	  = "newmiMouseDown";
			this.eventsFunctions[AEventsManager.EMapEvents.MouseDrag] 	  = "newmiMouseDrag";
			this.eventsFunctions[AEventsManager.EMapEvents.Panning]		  = "newmiPanning"; 
            this.eventsFunctions[AEventsManager.EMapEvents.Zooming]		  = "zoom_changed";
			this.eventsFunctions[AEventsManager.EMapEvents.ExtentChange]  = "bounds_changed";
			this.eventsFunctions[AEventsManager.EMapEvents.MapLayoutChange] = "newmiLayoutChanged";
			this.eventsFunctions[AEventsManager.EMapEvents.MouseDblClick] = "newmiDoubleClick";
			
			this.panDragState = {};
			this.panDragState.inProgress = false;
			
			this.mouseDrag = {};
			this.mouseDrag.inProgress = false;
			
			//this.zoomState = {};
			//this.zoomState.lastZoom = this.map.getZoom();
			
			this.googleDiv = this.map.core.getDiv();
			
			this._connectedEvents["helpers"] = [];
			this._connectedEvents["helpers"].push(dojo.connect(this.googleDiv, 'mouseenter', dojo.hitch(this, this.onGeneralMouseEnter)));
			this._connectedEvents["helpers"].push(dojo.connect(this.googleDiv, 'mouseleave', dojo.hitch(this, this.onGeneralMouseLeave)));
			
			this.mousePos = {};
			this.isMouseOnDiv = false;
		},
		
		onGeneralMouseEnter : function(evt)
		{
			this.isMouseOnDiv = true;
		},
		onGeneralMouseLeave : function(evt)
		{
			this.isMouseOnDiv = false;
			
			if (this.mouseDrag.inProgress)
			{
				this.onDragMouseUp(this.mouseDrag.evt);
				this.onMouseUp(this.mouseDrag.evt, true);
			}
		},
		
		_connectEvent: function(p_strEvent)
		{
			var arrEventsH = [];
			
			switch (p_strEvent)
			{
				case('newmiMouseDown'):
				{
					arrEventsH.push(dojo.connect(this.googleDiv, 'mousedown', dojo.hitch(this, this.onMouseDown)));
				}
				break;
				case('newmiMouseDrag'):
				{
					/*var arrEvents = [ ["mousedown", dojo.hitch(this, this.onDragMouseDown)], 
					                  ["mousemove", dojo.hitch(this, this.onMouseDrag)] ,
					                  ["mouseup", dojo.hitch(this, this.onDragMouseUp)] ];
					
					arrEventsH.push.apply(arrEventsH, this._connectToSetEvents(arrEvents));*/
					
					arrEventsH.push(dojo.connect(this.googleDiv, 'mousedown', dojo.hitch(this, this.onDragMouseDown)));
					arrEventsH.push(dojo.connect(this.googleDiv, 'mousemove', dojo.hitch(this, this.onMouseDrag)));
					arrEventsH.push(dojo.connect(this.googleDiv, 'mouseup', dojo.hitch(this, this.onDragMouseUp)));
				}
				break;
				case('newmiMouseMove'):
				{
					arrEventsH.push(dojo.connect(this.googleDiv, 'mousemove', dojo.hitch(this, this.onMouseMove)));
				}
				break;
				case('newmiMouseUp'):
				{
					arrEventsH.push(dojo.connect(this.googleDiv, 'mouseup', dojo.hitch(this, this.onMouseUp)));
				}
				break;
			    case ('newmiLayoutChanged'):
				{
					arrEventsH.push(google.maps.event.addListener(this.googleDiv, 'resize', dojo.hitch(this, this.onResize)));
				}
				break;
				case ('newmiPanning'):
				{
					var arrEvents = [ ["dragstart", dojo.hitch(this, this.onPanDragStart)], 
					                  ["center_changed", dojo.hitch(this.onPanCenterChanged)] ,
					                  ["dragend", dojo.hitch(this.onPanDragEnd)]];
					
					arrEventsH.push.apply(arrEventsH, this._connectToSetEvents(arrEvents));
				}
				break;
				case ('newmiDoubleClick'):
				{
					/*var arrEvents = [ ["dragstart", dojo.hitch(this, this.onPanDragStart)], 
					                  ["center_changed", dojo.hitch(this.onPanCenterChanged)] ,
					                  ["dragend", dojo.hitch(this.onPanDragEnd)]];
					
					arrEventsH.push.apply(arrEventsH, this._connectToSetEvents(arrEvents));*/
					
					arrEventsH.push(dojo.connect(this.googleDiv, 'dblclick', dojo.hitch(this, this.onMouseDblClick)));
				}
				break;
				default:
				{
					arrEventsH.push(google.maps.event.addListener(this.map.core, p_strEvent, dojo.hitch(this, this[p_strEvent])));
				}
				break;
			}

			return arrEventsH;
		},
		
		_connectToSetEvents : function (p_arrEvents)
		{
			var arrEventsH = [];
			
			p_arrEvents.forEach(function(item)
					{
						arrEventsH.push(google.maps.event.addListener(this.map.core, item[0], dojo.hitch(this, item[1])));
					}, this);
			
			return arrEventsH;
		},
		
		_disconnectEvent : function(p_strCurrEvent)
		{
			if (p_strCurrEvent == "helpers")
				return;
			
			var arrEventH = this._connectedEvents[p_strCurrEvent];
			
			arrEventH.forEach(function(item)
			{
				item.remove();	
			});

			delete this._connectedEvents[p_strCurrEvent];
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
					newmiEvt.screenPoint = evt.screenPoint;
					newmiEvt.mapPoint = evt.mapPoint;
					
					newmiEvt.button = evt.button;
					newmiEvt.altKey = evt.altKey;
					newmiEvt.ctrlKey = evt.ctrlKey;
					newmiEvt.shiftKey = evt.shiftKey;
				}
				break;
				case AEventsManager.EMapEvents.Panning:
				{
					var delta = {};
					var objCurrPosPixels = this.map.conversionsSvc.toScreen(this.panDragState.startPos.lng(), this.panDragState.startPos.lat());
										
					delta.x = objCurrPosPixels.x - this.panDragState.startPosPixels.x;
					delta.y = objCurrPosPixels.y - this.panDragState.startPosPixels.y;
					newmiEvt.extent = null;
					newmiEvt.delta = delta;
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
		
		//////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////
		
		onMouseDown : function (evt)
		{
			if (!this.isMouseOnDiv)
				return;
			
			evt.screenPoint = { "x": evt.offsetX, "y": evt.offsetY };
			evt.mapPoint = this.map.conversionsSvc.toMap(evt.offsetX, evt.offsetY);
			
			this._wrapEvent(AEventsManager.EMapEvents.MouseDown, evt);
		},
		
		onMouseMove : function (evt)
		{
			if (!this.isMouseOnDiv)
				return;
			
			evt.screenPoint = { "x": evt.offsetX, "y": evt.offsetY };
			evt.mapPoint = this.map.conversionsSvc.toMap(evt.offsetX, evt.offsetY);
			
			this._wrapEvent(AEventsManager.EMapEvents.MouseMove, evt);
		},

		
		onMouseUp : function (evt, force)
		{
			if (!force)
				if (!this.isMouseOnDiv)
					return;
			
			evt.screenPoint = { x: evt.offsetX, y: evt.offsetY };
			evt.mapPoint = this.map.conversionsSvc.toMap(evt.offsetX, evt.offsetY);
			
			this._wrapEvent(AEventsManager.EMapEvents.MouseUp, evt );
		},
		
		onMouseDblClick : function (evt)
		{
			if (!this.isMouseOnDiv)
				return;
		
			evt.screenPoint = { "x": evt.offsetX, "y": evt.offsetY };
			evt.mapPoint = this.map.conversionsSvc.toMap(evt.offsetX, evt.offsetY);
			
			this._wrapEvent(AEventsManager.EMapEvents.MouseDblClick, evt );
		},
		
		//////////////////////////////////////////////////////
		/////////////////////// Draging //////////////////////
		
		onDragMouseDown : function (evt)
		{
			this.mouseDrag.inProgress = true;
		},
		
		onMouseDrag : function (evt)
		{
			if (!this.isMouseOnDiv)
				return;
			
			if (this.mouseDrag.inProgress)
			{
			    evt.screenPoint = { "x": evt.offsetX, "y": evt.offsetY };
				evt.mapPoint = this.map.conversionsSvc.toMap(evt.offsetX, evt.offsetY);

				this.mouseDrag.evt = evt;
				
				this._wrapEvent(AEventsManager.EMapEvents.MouseDrag, evt);
			}
		},
		
		onDragMouseUp : function (evt)
		{
			this.mouseDrag.inProgress = false;
		},
		
		//////////////////////////////////////////////////////
		/////////////////////// Panning //////////////////////
		
		onPanDragEnd : function()
		{
			this.panDragState.inProgress = false;
			this.bounds_changed();
		},
		
		onPanDragStart : function()
		{
			this.panDragState.inProgress = true;
			
			this.panDragState.startPos = this.map.core.getCenter();
			this.panDragState.startPosPixels = this.map.conversionsSvc.toScreen(this.panDragState.startPos.lng(), this.panDragState.startPos.lat());
			
		},
		
		onPanCenterChanged : function ()
		{
			if (this.panDragState.inProgress)
				this._wrapEvent(AEventsManager.EMapEvents.Panning, {});
		},
		
		//////////////////////////////////////////////////////
		//////////////////////////////////////////////////////
		
		zoom_changed: function(extent, zoomFactor, anchor, level)
		{
			this._wrapEvent(AEventsManager.EMapEvents.Zooming, { } );
		},
		
		bounds_changed: function() 
		{
			if (!this.panDragState.inProgress)
			{
				this._wrapEvent(AEventsManager.EMapEvents.ExtentChange, { 'extent' : this.map.getExtent(), 'delta' : null, 'levelChange' : true, 'lod' : null } );
			}
		},
		
		onResize : function(extent, width, height)
		{
		    setTimeout(dojo.hitch(this, function(){

		        this._wrapEvent(AEventsManager.EMapEvents.MapLayoutChange, this.map.getControlLayout(true));
		    }), 0);
		}
	});
});