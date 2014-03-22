/**
* @class NeWMI.Selection.SelectionQuery
* <p>NeWMI default implementation for the selection query. </p>
* <p>This object is responsible for the querying objects in a given area</p>
* For customizing the querying, simple extend this object, override the wanted method, and 
* set the NeWMI.Selection.SelectionManager.queryMgr to your new type 
* @inheritable
*/
define(["dojo/_base/declare",
        "NeWMI/Layer/GroupLayer"],
function(declare,
        GroupLayer)
{
    var SelectionQuery = declare("NeWMI.Selection.SelectionQuery", null, {

        /**
         * @constructor
         * Creates new SelectionQuery instance
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map using this selection query
		 */
        constructor: function (p_objMap) {

            /**
            * @property {NeWMI.Map.Base.ABasicMap} map
            *
            * The map using this selection query
            */
            this.map = p_objMap;
        },

        /**
        * @method query
        * Searching in all the layers for the objects within the given geometry - Search will be performs only on layers from type NeWMI.Layer.Base.ACustomObjectsLayer.
        * @param {NeWMI.Geometry.Rectangle} p_objGeo The rectangle to search the objects in 
        * @return {Object[]} The objects which are intersects or inside the given geometry
        * @return {Object} return.item Each item in the array is an object of:
        * @return {NeWMI.Layer.Base.ACustomLayer} return.item.layer The layer that contains those objects that their selection has been changed
        * @return {NeWMI.Object.NeWMIObject[]} return.item.objects The objects which changed their selection status
        */
        query: function (p_objGeo) {
            var arrQueryRes = [];

            var arrLayersList = this.map.layersMgr.getAppLayersList().layersArrayList;

            arrLayersList.forEach(function (objCurrAppLayer) {
                if (objCurrAppLayer.newmiProps.visible) {
                    var objLayersToSearch = [];
                    if (objCurrAppLayer.search != null) {
                        objLayersToSearch.push(objCurrAppLayer);
                    }
                    else if (objCurrAppLayer instanceof GroupLayer) {
                        objLayersToSearch = objCurrAppLayer.getAllLayers();
                    }

                    objLayersToSearch.forEach(function (item) {
                        var objQueryResInLayer = item.search(p_objGeo, true);

                        arrQueryRes.push({ layer: item, objects: objQueryResInLayer });
                    }, this);
                }
            });

            return arrQueryRes;
        },
    });

    return SelectionQuery;
});

