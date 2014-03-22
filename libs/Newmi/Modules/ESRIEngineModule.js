define(["dojo/_base/declare",
        "esri/layers/layer",
        "NeWMI/Engine/ESRI/ESRIMap",
        "NeWMI/Engine/ESRI/ESRILayerExtension"
], function(declare, esriLayer) {
	
	var EngineModule = declare("NeWMI.Modules.ESRIEngineModule", null, {});
	
	//NeWMI.Engine.ESRI.ESRILayerExtension.extendMapLayer(esriLayer);
	
	return EngineModule;
});