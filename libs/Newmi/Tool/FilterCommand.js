define(["dojo/_base/declare",
        "dojox/collections/ArrayList",
        "dojo/dom-construct",
        "dojo/on",
        "dojo/_base/lang",
        "dijit/form/Button",
        "dojo/dom-style",
        "NeWMI/Service/Create/RandomSvc",
        "NeWMI/Layer/Base/ALayer",
        "NeWMI/Tool/Base/ACommand", 
        "NeWMI/Tool/CommandFeatures",
        "NeWMI/Layer/Base/ALayer",
        "NeWMI/Tool/EventObject"], 
        function(declare,
        		ArrayList,
        		domConstruct,
        		on,
        		lang,
        		Button,
        		domStyle,
        		RandomSvc,
        		ALayer,
        		ACommand,
        		CommandFeatures,
        		ALayer,
        		EventObject)
{
	var FilterCommand = declare("NeWMI.Tool.FilterCommand", ACommand,
	{ 

		"-chains-" : 
		{
			constructor: "manual"
		},

		constructor : function()
		{
			this.inherited(arguments, [[CommandFeatures.Filter]]);
			this.type = EventObject.Type.cmdFilter;
		},
		
		getDomElement: function(p_objLayer)
		{
			var objCmdId = this.id; 
			var objContext = this.context;
			var objFuncCallback = this.funcCallback;
			
			this.domElement = new Button({
				id: "delBtn_" + RandomSvc.guid(),
		        iconClass: "NeWMIFilterIcon",
				showLabel: false,
				type: "button",
				style: "margin: 0px; padding: 0px;",
	        	onClick: function(){
	        		
	        		objFuncCallback.call(objContext, objCmdId, null, p_objLayer);
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
			/*
			switch (p_cmdState)
			{
				case FilterCommand.state.Filtered:
					
					//p_objLayer.setFilter();
					
					break;
					
				case FilterCommand.state.UnFiltered:
					
					//p_objLayer.setFilter();
					
					break;
			}
			*/
		},
		
		getState : function(p_objLayer)
		{
			return p_objLayer.getFilter() ? FilterCommand.state.Filtered : FilterCommand.state.UnFiltered;
		}
	});
	
	FilterCommand.state = {
			
			Filtered: "Filtered",
			UnFiltered: "UnFiltered"
			
	};
	
	return FilterCommand;
});