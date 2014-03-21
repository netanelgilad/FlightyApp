define(["dojo/_base/declare", 
        "dojo/on",
        "NeWMI/Tool/EventObject",
        "NeWMI/Layer/Base/ALayer",
        "NeWMI/Service/Create/RandomSvc"], 
        function(declare, 
        		on,
        		EventObject,
        		ALayer,
        		RandomSvc)
    {
	var googleLayer = declare("NeWMI.Engine.Google.Layer", google.maps.OverlayView, { 

		 
			constructor : function(p_objMap, p_objLayer, p_intIdx) 
			{
				this.newmiMap = p_objMap;
				this.customLayer = p_objLayer;
				
				this.id = p_objLayer.newmiProps.get(ALayer.Props.id);
				
				this.customLayerHandle = on(this.customLayer.newmiProps, EventObject.Type.propChange, dojo.hitch(this, googleLayer._propsChanged));
				
				this.pos = p_intIdx;
				
				var me = this;
				this._listeners = [];
			},
			
			onAdd : function()
			{
			    var layerDiv = document.createElement("div");
			    layerDiv.id = "Google NeWMILayer " + this.newmiMap.id + " " + this.id;
			    layerDiv.style.position = "absolute";
			    layerDiv.style.zIndex = this.pos;
				
			    var objDrawObjects = this.customLayer.onLayerAdded(this.newmiMap, layerDiv);
				objDrawObjects.engineLayer = this; 
				
				var panes = this.getPanes();
				panes.overlayLayer.appendChild(layerDiv);
				
				var me = this;
				this._listeners.push(
				    google.maps.event.addListener(this.getMap(), 'center_changed', 
				    		function() 
				    		{ 
				    			me.draw(); 
				    		})
				  );
				
				this._projection = this.getProjection();
			},
			
			onRemove : function() 
			{
			    var objLayerDiv = this.customLayer.getLayerDiv(this.newmiMap);

			    this.customLayer.onLayerRemoved(this.newmiMap, objLayerDiv);

			    objLayerDiv.parentNode.removeChild(objLayerDiv);
				
				// Label is removed from the map, stop updating its position/text.
				for (var i = 0; i < this._listeners.length; ++i) 
				{
					google.maps.event.removeListener(this._listeners[i]);
				}
			},
			
			draw : function()
			{
				var position = this._projection.fromLatLngToDivPixel(this.newmiMap.core.getBounds().getSouthWest());
				
				// Moving back what Google overlay view move
				var div = this.customLayer.getLayerDiv(this.newmiMap);
				div.style.left = position.x + 'px';
				div.style.top = position.y - this.newmiMap.getControlLayout().height + 'px';
			}
		});
	
	googleLayer._propsChanged = function(p_eventObject)
	{
		switch (p_eventObject.type)
		{
			case EventObject.Type.propChange:
				
				switch (p_eventObject.object.prop)
				{
					case ALayer.Props.visible:

					    if (this.setVisible) {
					        this.setVisible(p_eventObject.object.value);
					    }
						
						break;
						
					default:
				}
				break;
			default:
		}
	};
	
	googleLayer.makeNeWMILayer = function (p_objLayer)
	{
		p_objLayer.newmiProps = new ALayer(p_objLayer.id, p_objLayer.title, false);
		
		on(p_objLayer.newmiProps, EventObject.Type.propChange, dojo.hitch(p_objLayer, googleLayer._propsChanged));
	};
	
	return googleLayer;
});