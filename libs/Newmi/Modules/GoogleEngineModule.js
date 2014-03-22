define(["dojo/_base/declare",
        "NeWMI/Engine/Google/GoogleLayer",
        "NeWMI/Engine/Google/GoogleMap",
        "NeWMI/Engine/Google/GoogleLayerExtension"
], function(declare, googleLayer) {
	
	var EngineModule = declare("NeWMI.Modules.GoogleEngineModule", null, {});
	
	//NeWMI.Engine.Google.GoogleLayerExtension.extendMapLayer(googleLayer);
	//NeWMI.Engine.Google.GoogleLayerExtension.extendMapLayer(gmaps.ags.MapOverlay);
	//NeWMI.Engine.Google.GoogleLayerExtension.extendMapLayer(gmaps.ags.MapType);
	
	return EngineModule;
});