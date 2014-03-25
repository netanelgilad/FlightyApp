/**
* @class NeWMI.Tool.ToolsManager
* <p>Represent the tools manager in NeWMI.</p>
* <p>This object is responsible for all the tools in the map. All the tools need to be added to it, and activating the tools will be trough it.</p>
* Each map instance contains the property NeWMI.Map.Base.ABasicMap.toolsMgr which holds the map tools manager.
* <pre><code>
* // Adding the tools once
* var panTool = NeWMI.Tool.PanTool(); 
* var editTool = new NeWMI.Tool.EditTool();
* map.toolsMgr.add(panTool);
* map.toolsMgr.add(editTool);
* .
* .
* .
* // Activating the pan (navigation) tool
* map.toolsMgr.activate(panTool);
* </code></pre>
*/
define(["dojo/_base/declare", "dojox/collections/Dictionary", "NeWMI/Modules/ToolModule"], function (declare, Dictionary) {

	return declare("NeWMI.Tool.ToolsManager", null,
	{
		constructor : function(p_objMap)
		{
		    this.map = p_objMap;

		    /**
            * @property {dojox.collections.Dictionary} tools 
            *
            * The tools which had been added to the tools manager
            * The keys in this dictionary are the Ids of the NeWMI.Tool.Base.ATool and the value are the tools.
            * @readonly
            */
		    this.tools = new Dictionary();

		    /**
            * @property {NeWMI.Tool.Base.ATool} currentTool 
            *
            * The current activated tool
            * @readonly
            */
			this.currentTool = null;
		},
		
	    /**
        * @method add
        *
        * Adding the tool to the tools manager
        * @param {NeWMI.Tool.Base.ATool} p_objTool The tool to add
        */
		add : function (p_objTool)
		{
			if (!this.tools.containsKey(p_objTool.id))
			{
				p_objTool.init(this.map);
				this.tools.add(p_objTool.id, p_objTool);
			}
		},
		
	    /**
        * @method remove
        *
        * Removing a tool from the tools manager
        * @param {NeWMI.Tool.Base.ATool} p_objTool The tool to remove
        */
		remove : function (p_objTool)
		{
			this.tools.remove(p_objTool.id);
		},
		
	    /**
        * @method activate
        *
        * Activating a given tool
        * @param {NeWMI.Tool.Base.ATool|String} p_objTool The tool\ID (of the tool) we want to activate
        */
		activate : function (p_objTool)
		{
			if (this.currentTool == p_objTool)
				return;
				
			if (this.currentTool != null)
			{
				this.currentTool.deactivate();
			}
			if (typeof p_objTool === 'string') {
			    p_objTool = this.tools.item(p_objTool);
			}

			if (p_objTool != null) {
			    this.currentTool = p_objTool;
			    this.currentTool.activate();
			}
		}
	});
});
	