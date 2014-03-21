/**
* @class NeWMI.Tool.EventObject
* <p>Represent NeWMI Event object.</p>
* <p>This object will be passed on every NeWMI event and contains all relevant data</p>
*/
define(["dojo/_base/declare",
         "dojo/on", 
         "dojo/_base/lang"], 
         function(declare, 
        		 on, 
        		 lang) {
	
	var EventObject = declare("NeWMI.Tool.EventObject", null, {
		
	    /**
        * @constructor
        * Creates new EventObject instance
        * @param {Object} p_objOwner The object which raising the event with this object
        */
		constructor: function(p_objOwner)
		{
		    /**
            * @property {NeWMI.Tool.EventObject.Type} type
            * The type of the event
            */
		    this.type = null;

		    /**
            * @property {Object} source
            * 
            */
		    this.source = null;

		    /**
            * @property {Object} destination
            * 
            */
		    this.destination = null;

		    /**
            * @property {Object} object
            * The data relevant to the specific event
            */
			this.object	 		= null;
			
		    /**
            * @property {Boolean} bubbles
            * 
            */
			this.bubbles = true;

		    /**
            * @property {Boolean} cancelable
            * 
            */
			this.cancelable = true;
			
		    /**
            * @property {Object} owner
            * The object which raising the event with this object
            */
			this.owner = p_objOwner;
		},
		
	    /**
        * @method raise
        * Firing an event with this object
        */
		raise: function()
		{
			if (this.type)
			{
				on.emit(this.owner, this.type, this);
			}
		}
	});

    /**
    * @method NeWMI.Tool.EventObject.raise
    * Firing an event with a given parameters
    * @param {Object} owner The object which raising the event with this object
    * @param {NeWMI.Tool.EventObject.Type} type The type of the event
    * @param {Object} params The data relevant to the specific event
    * @static
    */
	EventObject.raise = function (owner, type, params) {
	   
	    var eventObject = new EventObject(owner);
	        eventObject.type = type;
	        eventObject.object = params;
	        eventObject.raise();
	    
	}
	
    /** @enum {String} NeWMI.Tool.EventObject.Type 
    * The types of the events
    */
	EventObject.Type = {
		
	    /** Property changed */
	    propChange: "propChange",
	    /** Layer inserted */
	    layerInsert: "layerInsert",
	    /** Layer removed */
	    layerRemove: "layerRemove",
	    /** All layers removed */
	    layerRemovedAll: "layerRemovedAll",
	    layerFilter: "layerFilter",
	    /** Layer moved - Changed index*/
		layerMove: "layerMove",
		
	    
		layerOrder		:	"layerOrder",
		layerBaseMap	:	"layerBaseMap",
		
		cmdDelete		:	"cmdDelete",
		cmdVisible		:	"cmdVisible",
		cmdFilter		:	"cmdFilter"
	};
	
	return EventObject;
});