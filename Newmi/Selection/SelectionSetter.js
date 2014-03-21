/**
* @class NeWMI.Selection.SelectionSetter
* <p>NeWMI default implementation for the selection setter. </p>
* <p>This object is responsible for setting the selection in the layers</p>
* For customizing the setter, simple extend this object, override the wanted methods, and 
* set the NeWMI.Selection.SelectionManager.setterMgr to your new type 
* @inheritable
*/
define(["dojo/_base/declare", "NeWMI/Selection/SelectionManager"],
function(declare,
         SelectionManager)
{
    var SelectionSetter = declare("NeWMI.Selection.SelectionSetter", null, {

        /**
         * @constructor
         * Creates new SelectionSetter instance
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map using this selection query
		 */
        constructor : function(p_objMap)
        {
            this.map = p_objMap;
        },

        /**
        * @method set
        * Setting the selection in the layers
        * @param {Object[]} p_arrSelection 
        * @param {Object} p_arrSelection.item Each item in the array is an object of:
        * @param {NeWMI.Layer.Base.ACustomLayer} p_arrSelection.item.layer The layer that contains those objects that their selection has been changed
        * @param {NeWMI.Object.NeWMIObject[]} p_arrSelection.item.objects The objects which changed their selection status
        * @param {NeWMI.Selection.SelectionManager.SelectionType} p_eSelectionType The type of the selection change
        */
        set: function (p_arrSelection, p_eSelectionType) {
            p_arrSelection.forEach(function (objCurrSelection) {
                objCurrSelection.layer.setSelection(objCurrSelection.objects, p_eSelectionType, true);
            });

            this.map.selectionMgr._raiseSelectionChanged(p_arrSelection, p_eSelectionType);
        },

        /**
        * @method clear
        * Clearing the selection from all the layers
        */
        clear: function () {
            var arrLayersList = this.map.layersMgr.getAppLayersList().layersArrayList;

            arrLayersList.forEach(function (objCurrAppLayer) {
                objCurrAppLayer.clearSelection(true);
            });

            this.map.selectionMgr._raiseSelectionChanged(p_arrSelection, SelectionManager.SelectionType.clear);
        },
    });

    return SelectionSetter;
});

