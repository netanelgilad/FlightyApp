/**
* @class NeWMI.Tool.PanTool
* <p>Represent the pan tool - The navigation tool</p>
* <p>When this tool is activated the user can drag the map and navigate</p>
* @extends NeWMI.Tool.Base.ATool
*/
define(["dojo/_base/declare",
        "NeWMI/Tool/Base/ATool"], 
        function(declare, 
        		ATool)
{
	return declare("NeWMI.Tool.PanTool", ATool,
	{ 

		"-chains-" : 
		{
			constructor: "manual"
		},

	    /**
        * @constructor
        * Creates new PanTool instance
        */
		constructor : function()
		{
			this.inherited(arguments);
			this.caption = "Pan";
		},
		
		activate : function()
		{
			this.inherited(arguments);
			
			this.map.enablePan();
		},
		
		deactivate : function()
		{
			this.inherited(arguments);
			
			this.map.disablePan();
		}
	});
});