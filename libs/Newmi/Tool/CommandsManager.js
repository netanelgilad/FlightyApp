define(["dojo/_base/declare",
        "dojo/on",
        "dojo/Evented",
        "dojox/collections/Dictionary", 
        "dojox/collections/ArrayList",
        "NeWMI/Tool/EventObject"], 
        function(declare,
        		on,
        		Evented,
        		Dictionary,
        		ArrayList,
        		EventObject){

	return declare("NeWMI.Tool.CommandsManager", Evented,
	{
		constructor : function()
		{
			this.commands = new Dictionary();
			this.commandsFeatures = new Dictionary();
		},
		
		add : function (p_objCommand)
		{
			if (!this.commands.containsKey(p_objCommand.id))
			{
				p_objCommand.init(this, this.execute);
				this.commands.add(p_objCommand.id, p_objCommand);
				
				p_objCommand.features.forEach(function(objItem){
					
					if (!this.commandsFeatures.containsKey(objItem))
					{
						this.commandsFeatures.add(objItem, new ArrayList([p_objCommand.id]));
					}
					else
					{
						var arrFeatures = this.commandsFeatures.item(objItem);
						if (!arrFeatures.contains(p_objCommand.id))
						{
							arrFeatures.add(p_objCommand.id);
						}
					}
					
				}, this);
			}
		},
		
		remove : function (p_objCommand)
		{
			this.commands.remove(p_objCommand.id);
			
			p_objCommand.features.forEach(function(objItem){
				
				if (this.commandsFeatures.containsKey(objItem))
				{
					var arrFeatures = this.commandsFeatures.item(objItem);
					arrFeatures.remove(p_objCommand.id);
				}
				
			}, this);
		},
		
		execute : function (p_objCommandId, p_cmdState, p_object)
		{
			var objCmd = this.commands.item(p_objCommandId);
			
			if (objCmd && p_object)
			{
				objCmd.run(p_object, p_cmdState);
				
				var eventObject = new EventObject(this);
				eventObject.type = objCmd.type;
				eventObject.source = objCmd;
				eventObject.object = { features: objCmd.features, state: p_cmdState, layer: p_object };
				eventObject.raise();
			}
		}
	});
});
	