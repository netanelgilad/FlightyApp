/**
* @class NeWMI.Layer.Base.ACustomObjectsLayer
* <p>Represents abstract custom NeWMI Layer with objects.</p>
* <p>In addition to NeWMI.Layer.Base.ACustomLayer, this layer contains list of NeWMI.Object.NeWMIObject, which are
* being indexed and allowing various of querying methods</p>
* @extends NeWMI.Layer.Base.ACustomLayer
*/
define(["dojo/_base/declare",
        "NeWMI/Layer/Base/ACustomLayer", 
        "NeWMI/Object/DataSource", 
        "NeWMI/Draw/Draw2D", 
        "dojox/collections/Dictionary",
        "NeWMI/Selection/SelectionManager"],
        function (declare,
        		ACustomLayer, 
        		DataSource, 
        		Draw, 
        		Dictionary,
                SelectionManager)
{
	return declare("NeWMI.Layer.Base.ACustomObjectsLayer", ACustomLayer,
	{ 
	    /**
        * @constructor
        * Creates new ACustomObjectsLayer instance
        * @param {Boolean} [p_blnIsGL=false] Is the layer support GL
        * @param {Boolean} [p_blnIs2D=false] Is the layer support html5 simple context
        */
		constructor : function(p_blnIsGL, p_blnIs2D)
		{
			this.inherited(arguments, [p_blnIsGL, p_blnIs2D]);
			
		    /**
            * @property {NeWMI.Object.DataSource} dataSource
            * The layer data source object. Through this object we can access the layer objects NeWMI.Object.NeWMIObject.
            */
			this.dataSource = new DataSource(this.id, []);
			
			this._connects = [];
			this._connects.push(this.dataSource.on("dataChanged", dojo.hitch(this, this.onDataSourceDataChanged)));
			
		    /**
            * @property {dojox.collections.Dictionary} selection
            * The layer selection objects. The keys are the selected objects ids, and the values are the objects. 
            */
			this.selection = new Dictionary();
			
		    /**
            * @property {Boolean} [useView=false]
            * If true, means that the draw will pass trough the NeWMI.Layer.Base.ACustomObjectsLayer.view first,
            * and then back to regular draw cycle. For example NeWMI.Layer.Views.ClusterLayerView
            */
			this.useView = false;

		    /**
            * @property {NeWMI.Layer.Views.Base.ALAyerView} view
            * A different way to view the layer. For example check NeWMI.Layer.Views.ClusterLayerView
            */
			this.view = null;
		},
		
		
		////////////////////////////////////
		
	    /**
        * @method search
        * Searching for a given objects in a given geometry - in this layer
        *
        * @param {NeWMI.Geometry.Rectangle} p_objGeo The area we want to search for the object in
		* @param {Boolean} [p_blnExactSearch=false] Send true when we want to perform query of the real geometry. Send false when we want fast querying, less accurate, geometries bounds rectangles intersections
        */
		search : function (p_objGeo, p_blnExactSearch)
		{
			var objQueryResInLayer; 
			
			if (this.useView && this.view)
			{
				objQueryResInLayer = this.view.search(p_objGeo, p_blnExactSearch);
			}
			else
			{
				objQueryResInLayer = this.dataSource.search(p_objGeo, true);
			}
			
			return objQueryResInLayer;
		},
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////   Selection /////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
	    /**
        * @method setSelection
        * Setting the selection in the layer
        *
        * @param {NeWMI.Object.NeWMIObject[]} p_arrObjectsToSelect Array of the objects to set their selection
		* @param {NeWMI.Selection.SelectionManager.SelectionType} [p_eSelectionType=NeWMI.Selection.SelectionManager.SelectionType.New] The type of selection to set for this objects
        * @param {Boolean} [p_blnPerformRefresh=false] If true, it will refresh the layer in all the maps after setting this selection
        */
		setSelection : function (p_arrObjectsToSelect, p_eSelectionType, p_blnPerformRefresh)
		{
		    p_eSelectionType = p_eSelectionType || SelectionManager.SelectionType.New;

            // Clearing the selection in case we need
		    if (p_eSelectionType == SelectionManager.SelectionType.Clear ||
                p_eSelectionType == SelectionManager.SelectionType.New) {
			    this.selection.clear();
			}
			
            // Add items to selection
		    if (p_eSelectionType == SelectionManager.SelectionType.New ||
                p_eSelectionType == SelectionManager.SelectionType.Add) {
			    p_arrObjectsToSelect.forEach(function (objCurrSelObject) {
			        this.selection.add(objCurrSelObject.id, objCurrSelObject);
			    }, this);
			}
            // Remove Item from the selection
		    else if (p_eSelectionType == SelectionManager.SelectionType.Remove) {
			    p_arrObjectsToSelect.forEach(function (objCurrSelObject) {
			        this.selection.remove(objCurrSelObject.id);
			    }, this);
			}
			
			if (p_blnPerformRefresh)
			{
				this.refresh();
			}
		},
		
	    /**
        * @method clearSelection
        * Clearing\Removing all the selection in the layer
        *
        * @param {Boolean} [p_blnPerformRefresh=false] If true, it will refresh the layer in all the maps after setting this selection
        */
		clearSelection : function(p_blnPerformRefresh)
		{
			this.selection.clear();
			
			if (p_blnPerformRefresh)
			{
				this.refresh();
			}
		},

	    /**
        * @method isSelected
        * Checking if a given object\id is selected
        *
        * @param {Object} param The parameter
        * @param {Object} [param.id] The object id
        * @param {NeWMI.Object.NeWMIObject} [param.object] The object
        */
		isSelected: function (param) {
		    param = param || {};

		    if (param.id) {
		        return this.selection.item(param.id) != null;
		    } else if (param.object) {
		        return this.selection.item(param.object.id) != null;
		    }

		    return false;
		},
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////   Draw //////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		draw2D : function(p_objMap, p_objContext)
		{
			var objExtent = p_objMap.getExtent();
			objExtent.scale(1.1, 1.1);
			var arrToDraw = this.dataSource.search(objExtent, false);

			if (this.useView && this.view)
			{
				// Drawing the view and setting the array of objects to draw again with the
				// return value which is the objects that still need to be drawn
				arrToDraw = this.view.draw(p_objMap, p_objContext, arrToDraw);
			}
			
			this.drawObjects2D(p_objMap, p_objContext, arrToDraw);
			
			this.inherited(arguments);
		},
		
	    /**
        * @method drawObjects2D
        * Drawing the layer in 2D rendering mode. This method need to be override in order to perform some context draw.<p/>
        * Called automatically every draw cycle by NeWMI.<p/>
        *
        * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map that the layer is in and requested redraw
        * @param {Object} p_objContext The canvas's context object
        * @param {NeWMI.Object.NeWMIObject[]} p_arrObjToDraw The objects to draw
        * @protected
        */
		drawObjects2D : function (p_objMap, p_objContext, p_arrObjToDraw)
		{
			// Implement by the developer
		},
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////   Events //////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
	    /**
        * @method onDataSourceDataChanged
        * Called when the datasource has been changed. 
        * Event callback from NeWMI.Object.DataSource.dataChanged
        *
        * @param {Object} p_objParam Check NeWMI.Object.DataSource.dataChanged documentation
        * @protected
        */
		onDataSourceDataChanged : function (p_objParam)
		{
			if (p_objParam.object.type == "remove")
			{
				p_objParam.object.objects.forEach(function(item)
				{
					this.selection.remove(item.id);
				}, this);
			}
		},
		
		onLayerRemoved : function(map, container) 
		{
			this.inherited(arguments);
			
			this._connects.forEach(function (item)
			{
				item.remove();
			});
		}
	});
});