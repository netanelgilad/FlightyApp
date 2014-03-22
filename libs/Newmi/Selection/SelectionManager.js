/**
* @class NeWMI.Selection.SelectionManager
* <p>NeWMI Selection Manager is the manager that managing all the work related to selection, such as fetching the objects in a given areas,
* clearing the selections or setting the new selections.</p>
* <p>The selection manager uses NeWMI.Selection.SelectionSetter and NeWMI.Selection.SelectionQuery for handling the different methods. and gives the option for customization.</p>
* Each map instance contains property NeWMI.Map.Base.ABasicMap.selectionMgr which provides an instance to this class.
* @evented
*/
define(["dojo/_base/declare",
        "dojo/Evented",
        "NeWMI/Tool/EventObject",
        "NeWMI/Selection/SelectionQuery",
        "NeWMI/Selection/SelectionSetter"],
	function (  declare,
                Evented,
                EventObject,
                SelectionQuery,
                SelectionSetter)
    {

    var SelectionMgr = declare("NeWMI.Selection.SelectionManager", Evented,
	{
	    /**
         * @constructor
         * Creates new SelectionManager instance
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map using this selection manager
		 */
		constructor : function(p_objMap)
		{
		    /**
            * @property {NeWMI.Map.Base.ABasicMap} map
            *
            * The map using this selection manager
            * @readonly
            */
			this.map = p_objMap;

		    /**
            * @property {NeWMI.Selection.SelectionQuery} queryMgr
            *
            * The selection query manager - Used for search for objects in given area
            */
			this.queryMgr = new SelectionQuery(p_objMap);

		    /**
            * @property {NeWMI.Selection.SelectionSetter} setterMgr
            *
            * The selection setter manager - Used for setting the selection results to the layers
            */
			this.setterMgr = new SelectionSetter(p_objMap);
		},
		
	    /**
        * @method getHitToleranceMapUnits
        * Returning the default tolerance configured in NeWMI.defaults.hitTolerance converted to map units
        * @return {Object} The tolerance in map units
        * @return {Number} return.width The horizontal tolerance in map units
        * @return {Number} return.height The vertical tolerance in map units
        */
		getHitToleranceMapUnits: function () {
		    var intTolerance = NeWMI.defaults.hitTolerance;
		    return this.map.conversionsSvc.toMapSize(intTolerance, intTolerance);
		},

	    /**
         * @event selectionChanged
         * Fired when the datasource has changed
         * @param {NeWMI.Tool.EventObject} evt
         * @param {"selectionChanged"} evt.type
         * @param {Object} evt.object The data of the event
         * @param {Object[]} evt.object.selection 
         * @param {Object} evt.object.selection.item Each item in the array is an object of:
         * @param {NeWMI.Layer.Base.ACustomLayer} evt.object.selection.item.layer The layer that contains those objects that their selection has been changed
         * @param {NeWMI.Object.NeWMIObject[]} evt.object.selection.item.objects The objects which changed their selection status
         * @param {NeWMI.Map.Base.ABasicMap} evt.object.map The map which the selection change has occurred
         * @param {NeWMI.Selection.SelectionManager.SelectionType} evt.object.type The type of the selection change
         * <pre><code>
         * map.selectionMgr.on('selectionChanged', this.onSelectionChanged);
         * .
         * .
         * .
         * function onSelectionChanged(evt)
         * {
         *    alert("selection has been changed");
         * }
         * </code></pre>
         */
		_raiseSelectionChanged: function (p_arrSelection, p_eSelectionType)
		{
			var objOnSelectionChanged = new EventObject(this);
			objOnSelectionChanged.type = "selectionChanged";
			objOnSelectionChanged.object = {
			    selection: p_arrSelection,
			    map: this.map,
			    type: p_eSelectionType
			};
			objOnSelectionChanged.raise();
		}
	});


    /** @enum {Number} NeWMI.Selection.SelectionManager.SelectionType 
    * The types of the selection changed status
    */
	SelectionMgr.SelectionType = {
	    /** New selection - All other selected are not selected anymore, and now this set are the new selected objects */
	    New: 1,
	    /** Add to selection - This set are added to all the rest of selected objects */
	    Add: 2,
	    /** Remove to selection - This set are removed from the selected objects */
	    Remove: 3,
	    /** Clear selection - All objects are removed from selection */
	    Clear: 4,
	};

	return SelectionMgr;
});