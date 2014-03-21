define([ "dojo/_base/declare"], function(declare) {
	
	var CommandFeatures = declare("NeWMI.Tool.CommandFeatures", null, {});
	
	CommandFeatures.Visible = "Visible";
	CommandFeatures.Opacity = "Opacity";
	CommandFeatures.Size 	= "Size";
	CommandFeatures.Filter 	= "Filter";
	CommandFeatures.Delete 	= "Delete";
	
	return CommandFeatures;
});