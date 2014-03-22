/**
* @class NeWMI.Tool.Base.ACommand
* <p>Represent a command in the map.</p>
* <p>Command is An action which performed on the map. Such as Cancel Map Rotation Command, Zoom2X.</p>
* In order to create our customized command we must extend this object and add it to the NeWMI.Tool.ToolsManager.
* @abstract
* @inheritable
*/
define(["dojo/_base/declare",
        "dojox/collections/ArrayList", 
        "NeWMI/Service/Create/RandomSvc"], 
        function(declare,
        		ArrayList,
        		RandomSvc){

	var ACommand = declare("NeWMI.Tool.Base.ACommand", null,
	{
		constructor : function(p_arrFeatures)
		{
			this.id = "Command_" + RandomSvc.guid();
			this.caption = "";
			this.type = null;
			this.features = new ArrayList();
			this.features.addRange(p_arrFeatures);
			this.domElement = null;
			this.context = null;
			this.funcCallback = null;
		},
		
		init: function(p_objScope, p_funCallback)
		{
			
		},
		
		run : function(p_objDomElement, p_obj, p_cmdState)
		{
			
		},
		
		getDomElement: function(p_obj)
		{
		
		}
	});
	
	return ACommand;
});