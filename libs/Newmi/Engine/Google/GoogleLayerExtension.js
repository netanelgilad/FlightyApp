define(["dojo/_base/declare", "dojo/_base/lang", "NeWMI/Layer/Base/ALayer"], 
		function(declare, lang, ALayer)
{
	var GoogleLayerExtension = declare("NeWMI.Engine.Google.GoogleLayerExtension", null, {});
	
	GoogleLayerExtension.extendMapLayer = function(type)
	{
		var tempLayer = new ALayer(null, null, false);
		
		/*
		for (var property in tempLayer) {
			if (tempLayer.hasOwnProperty(property)) {
				type.prototype[property] = tempLayer[property];
		    }
		}
		*/
		
		lang.extend(type, tempLayer);
		
	};
	
	return GoogleLayerExtension;
	
});

	