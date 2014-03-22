/**
* @class NeWMI.Layer.Base.ALayer
* <p>Represents the NeWMI layer properties. Each layer in NeWMI contains single instance of this object at property called newmiProps</p>
* @evented
*/
define(["dojo/_base/declare",
        "dojo/Evented",
        "dojox/collections/ArrayList", 
        "NeWMI/Service/Create/RandomSvc",
        "NeWMI/Tool/EventObject"], 
        function(declare,
        		Evented,
        		ArrayList, 
        		RandomSvc,
        		EventObject){
	var ALayer = declare("NeWMI.Layer.Base.ALayer", Evented,{ 
		
	    /**
        * @constructor
        * Creates new ALayer instance
        * @param {String} [p_objID="NeWMILayer_" + RandomSvc.guid();] The layer id
        * @param {String} [p_objTitle=""] The layer title
        * @param {Boolean} [p_blnIsNeWMILayer=false] If true, means that this layer is NeWMI layer and not the engine (esri, Google,...)
        */
		constructor: function(p_objID, p_objTitle, p_blnIsNeWMILayer) 
		{
		    /**
            * @property {String} [p_objID="NeWMILayer_" + RandomSvc.guid();] 
            * The layer id
            */
		    this.id = p_objID || "NeWMILayer_" + RandomSvc.guid();

		    /**
            * @property {String} [p_objTitle=""] 
            * The layer title
            */
		    this.title = p_objTitle || "";

		    /**
            * @property {Boolean} [p_blnIsNeWMILayer=false] 
            * If true, means that this layer is NeWMI layer and not the engine (esri, Google,...)
            */
		    this.isNeWMI = (p_blnIsNeWMILayer != null) ? p_blnIsNeWMILayer : false;

		    /**
            * @property {Boolean} [visible=true] 
            * The layer title
            * @readonly
            */
			this.visible = true;

			this.isBase = false;
			this.features = new ArrayList();
			this.image = "";
		},
		
	    /**
         * @event dataChanged
         * Fired when the datasource has changed
         * @param {NeWMI.Tool.EventObject} evt The event object
         * @param {NeWMI.Tool.EventObject.Type} evt.type Equals NeWMI.Tool.EventObject.Type.propChange
         * @param {Object} evt.object The specific event data
         * @param {NeWMI.Layer.Base.ALayer.Props} evt.object.prop The property that changed
         * @param {Object} evt.object.value The new value
         */
		_propRaiseChange : function(p_prop, p_val)
		{
			var eventObject = new EventObject(this);
			eventObject.type = EventObject.Type.propChange;
			eventObject.source = this.owner;
			eventObject.object = { prop: p_prop, value: p_val };
			eventObject.raise();
		},
		
		// Properties
			
	    /**
        * @method get_id
        * Returning the layer id
        *
        * @return {String} The layer id
        */
		get_id : function() { return this.id; },
		
	    /**
        * @method get_title
        * Returning the layer titke
        *
        * @return {String} The layer title
        */
		get_title: function () { return this.title; },

	    /**
        * @method set_title
        * Sets the layer title
        *
        * @param {String} p_val The layer title
        */
		set_title : function(p_val) { this.title = p_val; this._propRaiseChange(ALayer.Props.title, p_val); },
		
	    /**
        * @method get_isNeWMI
        * Returning if the layer is NeWMI or engine
        *
        * @return {Boolean} True if the layer is NeWMI layer
        */
		get_isNeWMI : function() { return this.isNeWMI; },
		
		get_isBase : function() { return this.isBase; },
		
		get_features : function() { return this.features; },
		set_features : function(p_val) { this.features.clear(); this.features.addRange(p_val || []); this._propRaiseChange(ALayer.Props.features, p_val); },
		
	    /**
        * @method get_visible
        * Gets the layer visibility
        *
        * @return {Boolean} True if the layer is visible
        */
		get_visible: function () { return this.visible; },

	    /**
        * @method set_visible
        * Sets the layer visibility
        *
        * @param {Boolean} p_val The layer visibility
        */
		set_visible : function(p_val) { this.visible = p_val; this._propRaiseChange(ALayer.Props.visible, p_val); },
		
		get_image : function() { return this.image; },
		set_image : function(p_val) { this.image = p_val; this._propRaiseChange(ALayer.Props.image, p_val); },
			
		
	    /**
        * @method set
        * Sets the layer property
        *
        * @param {NeWMI.Layer.Base.ALayer.Props} p_prop The layer property to set
        * @param {Object} p_val The property value
        */
		set : function(p_prop, p_val)
		{
			if (ALayer.Props.hasOwnProperty(p_prop))
			{
				if (this["set_" + p_prop]){
					this["set_" + p_prop].call(this, p_val);
				}
			}			
		},
		
	    /**
        * @method get
        * Gets the layer property
        *
        * @param {NeWMI.Layer.Base.ALayer.Props} p_prop The layer property to get
        * @return {Object} The property value
        */
		get : function(p_prop)
		{
			if (ALayer.Props.hasOwnProperty(p_prop))
			{
				if (this["get_" + p_prop]){
					return this["get_" + p_prop].call(this);
				}
			}
		}
		
	});
	
    /** @enum {String} NeWMI.Layer.Base.ALayer.Props 
    * The layer properties
    */
	ALayer.Props = {
            /** The layer id */
	    id: "id",
	    /** The layer title */
	    title: "title",
	    /** Is the layer NeWMI layer or engine layer */
		isNeWMI: "isNeWMI",
		features: "features",
	    /** Is the layer shown or not */
		visible: "visible",
		image: "image",
		isBase: "isBase"
	};
	
	return ALayer;
});