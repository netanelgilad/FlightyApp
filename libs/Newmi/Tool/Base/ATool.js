/**
* @class NeWMI.Tool.Base.ATool
* <p>Represent a tool in the map.</p>
* <p>tool is an interactive mode with the map. Such as navigation tool, Selection, Editing,...</p>
* In order to create our own customized tool we must extend this object and add it to the NeWMI.Tool.ToolsManager.
* @abstract
* @inheritable
* @evented
*/
define(["dojo/_base/declare", "dojo/Evented", "NeWMI/Service/Create/RandomSvc"], function (declare, Evented, RandomSvc) {

	var ATool = declare("NeWMI.Tool.Base.ATool", Evented,
	{
	    /**
        * @constructor
        * Creates new Tool instance
        * @param {NeWMI.Map.Base.AEventsManager.EMapEvents[]} [p_arrEventsNeeded] The events we want to listen when this tool is activated
        */
		constructor : function(p_arrEventsNeeded)
		{
		    /**
            * @property {String} id
            * The id of the tool
            */
		    this.id = "Tool_" + RandomSvc.guid();
		    /**
            * @property {String} caption
            * The caption of the tool
            */
		    this.caption = "";
		    /**
            * @property {NeWMI.Map.Base.ABasicMap} map
            * The map of the tool
            */
		    this.map = null;

		    /**
            * @property {NeWMI.Map.Base.AEventsManager} eventsMgr
            * The events manager of this tool
            */
		    this.eventsMgr = null;

			this.eventsNeeded = p_arrEventsNeeded || [];
		},
		
	    /**
        * @method init
        * This method is called automatically when adding the tool to the NeWMI.Tool.ToolsManager
        * @param {NeWMI.Map.Base.ABasicMap} The map of the tool
        */
		init : function (p_objMap)
		{
			this.map = p_objMap;
			this.eventsMgr = p_objMap.getEventMgr(this, this.onMapEvent);
		},
		
	    /**
        * @method activate
        * This method is called automatically when activating the tool from NeWMI.Tool.ToolsManager
        */
		activate : function()
		{
			this.eventsMgr.connect(this.eventsNeeded);
		},

	    /**
        * @method deactivate
        * This method is called automatically activating different tool from NeWMI.Tool.ToolsManager
        */
		deactivate : function()
		{
			this.eventsMgr.disconnectAll();
		},
		
	    /**
        * @method onMapEvent
        * This method is called automatically when one of the wanted events are raised. Override this method
        * @param {NeWMI.Tool.EventObject} evt The event object from the map
        */
		onMapEvent : function(evt)
		{
			// Should be implemented in the main class
		}
	});
		
	return ATool;
});