define(["dojo/_base/declare",
        "dojo/on",
        "esri/layers/layer",
        "NeWMI/Tool/EventObject",
        "NeWMI/Layer/Base/ALayer"], 
        function(declare, 
        		on,
        		esriLayer,
        		EventObject,
        		ALayer)
{
	var esriLayer = declare("NeWMI.Engine.ESRI.Layer", esriLayer, 
	{ 	 
		constructor : function(p_objMap, p_objLayer) 
		{
			this.map = p_objMap;
				
			this.customLayer = p_objLayer;
				
			this.id = p_objLayer.newmiProps.get(ALayer.Props.id);
				
			this.customLayerHandle = on(this.customLayer.newmiProps, EventObject.Type.propChange, dojo.hitch(this, esriLayer._propsChanged));
								
			this.loaded = true;
			this.onLoad(this);
		},
			
		_setMap: function(map, container) 
		{
            var layerDiv = document.createElement("div");
            layerDiv.id = "ESRI NeWMI Layer " + map.id + " " + this.id;
            layerDiv.style.position = "absolute";
				
            var objDrawObjects = this.customLayer.onLayerAdded(this.map, layerDiv);
            container.appendChild(layerDiv);
				
			objDrawObjects.engineLayer = this;
				
			return layerDiv;
		},
			
		_unsetMap: function(map, container) 
		{
		    var layerDiv = this.customLayer.getLayerDiv(this.map);
			this.customLayer.onLayerRemoved(this.map, layerDiv);
			container.removeChild(layerDiv);
		}
	});
	
	esriLayer._propsChanged = function(p_eventObject)
	{
		switch (p_eventObject.type)
		{
			case EventObject.Type.propChange:
				
				switch (p_eventObject.object.prop)
				{
					case ALayer.Props.visible:
					{
						this.setVisibility(p_eventObject.object.value);
					}
					break;
				}
				
				break;
			default:
		}
	};
	
	esriLayer.makeNeWMILayer = function (p_objLayer)
	{
		p_objLayer.newmiProps = new ALayer(p_objLayer.id, p_objLayer.title, false);
		
		on(p_objLayer.newmiProps, EventObject.Type.propChange, dojo.hitch(p_objLayer, esriLayer._propsChanged));
	};
	
	return esriLayer;
});