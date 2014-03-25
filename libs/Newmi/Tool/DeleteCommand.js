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
        		EventObject)
{
	var DeleteCommand = declare("NeWMI.Tool.DeleteCommand", ACommand,
	{ 

		"-chains-" : 
		{
			constructor: "manual"
		},

		constructor : function(p_objLayerMgr)
		{
			this.inherited(arguments, [[CommandFeatures.Delete]]);
			this.layerMgr = p_objLayerMgr;
			this.type = EventObject.Type.cmdDelete;
		},
		
		getDomElement: function(p_objLayer)
		{
			var objCmdId = this.id; 
			var objContext = this.context;
			var objFuncCallback = this.funcCallback;
			
			this.domElement = new Button({
				id: "delBtn_" + RandomSvc.guid(),
		        iconClass: "dijitEditorIcon dijitEditorIconDelete",
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
			this.layerMgr.removeAppLayer.call(this.layerMgr, p_objLayer);
		},
		
		getState : function(p_objLayer)
		{
			return null;
		}
	});
	
	DeleteCommand.state = {
			
	
	};
	
	return DeleteCommand;
});