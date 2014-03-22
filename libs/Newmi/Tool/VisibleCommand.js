define(["dojo/_base/declare",
        "dojox/collections/ArrayList",
        "dojo/dom-construct",
        "dojo/on",
        "dojo/_base/lang",
        "dijit/form/CheckBox",
        "NeWMI/Service/Create/RandomSvc",
        "NeWMI/Layer/Base/ALayer",
        "NeWMI/Tool/Base/ACommand", 
        "NeWMI/Tool/CommandFeatures",
        "NeWMI/Tool/EventObject"], 
        function(declare,
        		ArrayList,
        		domConstruct,
        		on,
        		lang,
        		CheckBox,
        		RandomSvc,
        		ALayer,
        		ACommand,
        		CommandFeatures,
        		EventObject)
{
	var VisibleCommand = declare("NeWMI.Tool.VisibleCommand", ACommand,
	{ 

		"-chains-" : 
		{
			constructor: "manual"
		},

		constructor : function()
		{
			this.inherited(arguments, [[CommandFeatures.Visible]]);
			this.type = EventObject.Type.cmdVisible;
		},
		
		getDomElement: function(p_objLayer)
		{
			var objCmdId = this.id; 
			var objContext = this.context;
			var objFuncCallback = this.funcCallback;
			
			this.domElement = new CheckBox({
				id: "visBtn_" + RandomSvc.guid(),
		        checked: p_objLayer.newmiProps.get(ALayer.Props.visible),
		        //iconClass: "dijitCheckBoxIcon",
	        	onChange: function(val){
	        		
	        		var objNextState = val ? VisibleCommand.state.Visible : VisibleCommand.state.Hidden;
	        		
	        		objFuncCallback.call(objContext, objCmdId, objNextState, p_objLayer);
	        	}
		    });
			
			return this.domElement;
		},
		
		init: function(p_objContext, p_funCallback)
		{
			this.context = p_objContext;
			this.funcCallback = p_funCallback;
		},
		
		run : function(p_objLayer, p_cmdState)
		{
			switch (p_cmdState)
			{
				case VisibleCommand.state.Visible:
					
					p_objLayer.newmiProps.set(ALayer.Props.visible, true);
					p_objLayer.refresh();
					
					break;
					
				case VisibleCommand.state.Hidden:
					
					p_objLayer.newmiProps.set(ALayer.Props.visible, false);
					p_objLayer.refresh();
					
					break;
			}
		},
		
		getState : function(p_objLayer)
		{
			return p_objLayer.newmiProps.get(ALayer.Props.visible) ? VisibleCommand.state.Visible : VisibleCommand.state.Hidden;
		}
	});
	
	VisibleCommand.state = {
			
			Visible: "Visible",
			Hidden: "Hidden"
			
	};
	
	return VisibleCommand;
});