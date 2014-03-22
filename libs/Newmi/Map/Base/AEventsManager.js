/**
* @class NeWMI.Map.Base.AEventsManager
* <p>Provides a map events manager.</p>
* <p>We use this class for listening to map events, such as mouse up, extent changed,...</p>
* Each map instance contains the method NeWMI.Map.Base.ABasicMap.getEventMgr which returns new instance of this class
* @abstract
*/
define(["dojo/_base/declare", "dojo/on"], function (declare, on) {
	var EventsManager = declare("NeWMI.Map.Base.AEventsManager", null,{ 
		
			constructor: function(p_objMap, p_objHandlerClass, p_hCallback) 
			{
			    /**
                * @property {NeWMI.Map.Base.ABasicMap} map
                *
                * The map connected to this events manager
                * @readonly
                */
			    this.map = p_objMap;

				this._connectedEvents = {};
				this._owner = p_objHandlerClass;
				this._hCallback = p_hCallback;
			},
			
			////////////////////////////////////////////////////////////////////////////////////
	        //////////////////////////////////// Connect ////////////////////////////////////////

	        /**
		    * @method connect
            * Connecting the event manager to event\events
            *
		    * @param {Array|String} p_arrEvents The event name or array of names for the events we want to listen to
		    */
			connect : function (p_arrEvents)
			{	
				// In case we got only one item that it's not in array
				if (!(p_arrEvents instanceof Array))
				{
					p_arrEvents = [ p_arrEvents ];
				}
				
				for (var intCurrEventIdx = 0; intCurrEventIdx < p_arrEvents.length; intCurrEventIdx++)
				{
					var strCurrEvent = this.eventsFunctions[p_arrEvents[intCurrEventIdx]];

					// Not connecting twice to the same event
					if(!this._connectedEvents.hasOwnProperty(strCurrEvent))
					{
						this._connectedEvents[strCurrEvent] = this._connectEvent(strCurrEvent);
					}
				}
			},
			
			_raiseCallback : function(evt)
			{
				this._hCallback.call(this._owner, evt);
			},
			
			_connectEvent: function(p_strEvent)
			{
				//return on(this.map.core, p_strEvent, this[p_strEvent]);
				return dojo.connect(this.map.core, p_strEvent, this, this[p_strEvent]);
			},
			
	       /**
           * @method disconnect
           * Disconnecting the event manager from given event\events
           *
           * @param {Array|String} p_arrEvents The event name or array of names for the events we want to stop listening to
           */
			disconnect : function (p_arrEvents)
			{
			    // In case we got only one item that it's not in array
			    if (!(p_arrEvents instanceof Array)) {
			        p_arrEvents = [p_arrEvents];
			    }

				for (var intCurrEventIdx = 0; intCurrEventIdx < p_arrEvents.length; intCurrEventIdx++)
				{
					var strCurrEvent = this.eventsFunctions[p_arrEvents[intCurrEventIdx]];

					// Not connecting twice to the same event
					if(this._connectedEvents.hasOwnProperty(strCurrEvent))
					{
						this._disconnectEvent(strCurrEvent);
					}
				}
			},

	        /**
            * @method disconnectAll
            * Disconnecting from all the events we listened to
            */
			disconnectAll : function()
			{
				for (var strCurrEvent in this._connectedEvents)
				{
					this._disconnectEvent(strCurrEvent);
				}
			},
			
			_disconnectEvent : function(p_strCurrEvent)
			{
				var eventHandler = this._connectedEvents[p_strCurrEvent];
				
				if (eventHandler instanceof Array) {
				    eventHandler.forEach(function (item) {
				        dojo.disconnect(item);
				    }, this);
				}
				else {
				    dojo.disconnect(eventHandler);
				}
				
				//this._connectedEvents[p_strCurrEvent].remove();
				delete this._connectedEvents[p_strCurrEvent];
			},
			
			_wrapEvent : function(p_eEventType, evt)
			{
				evt.eventType = p_eEventType;
				evt.map = this.map;
			}
		});
	
    /** @enum {String} NeWMI.Map.Base.AEventsManager.EMapEvents 
    * The types of the geometries NeWMI provides
    */
	EventsManager.EMapEvents = 
	{
	    /** Mouse Down event */
	    MouseDown: '_mouseDown',
	    /** Mouse Move event */
	    MouseMove: '_mouseMove',
	    /** Mouse Drag event = When mouse pressed and moved at the same time */
	    MouseDrag: '_mouseDrag',
	    /** Mouse Up event */
	    MouseUp: '_mouseUp',
	    /** Mouse double click event */
	    MouseDblClick: '_mouseDblClick',
	    /** Keyboard key down event */
	    KeyDown: '_keyDown',
	    /** Keyboard key up event */
	    KeyUp: '_keyUp',
	    /** Map panning event - raised while the map is being dragged */
	    Panning: '_panning',
	    /** Map changed Zoom event */
	    Zooming: '_zooming',
	    /** Map changed Extent event */
	    ExtentChange: '_extentChange',
	    /** Map changed layout event */
		MapLayoutChange : '_mapLayoutChange',
	};
	
	return EventsManager; 
});