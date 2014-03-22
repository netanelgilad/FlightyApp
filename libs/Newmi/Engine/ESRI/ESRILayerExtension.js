define(["dojo/_base/declare", "dojo/_base/lang", "dojo/Evented", "NeWMI/Layer/Base/ALayer"], 
		function(declare, lang, Evented, ALayer)
{
	var ESRILayerExtension = declare("NeWMI.Engine.ESRI.ESRILayerExtension", null, {});
	
	ESRILayerExtension.extendMapLayer = function(type)
	{
		var tempLayer = new ALayer(null, null, false);
		lang.extend(type, tempLayer);
		
		/*tempLayer.NeWMIProps.engine_set_visible = function(p_bln)
		{
			if (p_bln)
				this.parent.hide();
			else
				this.parent.show();
		};*/
		
		/*
		for (var property in tempLayer) {
			if (tempLayer.hasOwnProperty(property)) {
				type.prototype[property] = tempLayer[property];
		    }
		}
		*/
		
		/*type.prototype.superConstructor = type.prototype.constructor;
		
		type.prototype.constructor = function()
		{
			type.prototype.superConstructor.call(this, null);
			
			
		};*/
		
		
	};
	                                                                                                                                                                                                                                 
	return ESRILayerExtension;
	
});

	