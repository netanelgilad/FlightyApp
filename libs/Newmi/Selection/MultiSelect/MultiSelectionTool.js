/**
* @class NeWMI.Selection.MultiSelect.MultiSelectionTool
* Tool for handling multi selection UI. This tool is spreading the given selected objects on the screen, and allowing the user to see an image for each object which a connected line between the image
* to the real object. In addition it allows to user to remove some objects from the selection graphically.
* @extends NeWMI.Tool.Base.ATool
*/
define(["dojo/_base/declare",
        "NeWMI/Tool/Base/ATool",
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Selection/MultiSelect/MultiSelectionListUI"],
        function (declare,
        		ATool,
                AEventsManager,
                MultiSelectionListUI) {
            return declare("NeWMI.Selection.MultiSelect.MultiSelectionTool", ATool,
            {

                "-chains-":
                {
                    constructor: "manual"
                },

                /**
                 * @constructor
                 * Creates new MultiSelectionTool instance
		         * @param {Object} p_objParams The initial parameters
                 * @param {NeWMI.Map.Base.ABasicMap} p_objParams.map The map who use this tool
                 * @param {Number} p_objParams.maxSelection The maximum selection items to show on the screen
		         */
                constructor: function (p_objParams) {
                    this.inherited(arguments, [[AEventsManager.EMapEvents.MouseDown, AEventsManager.EMapEvents.MouseUp]]);

                    p_objParams = p_objParams || {};

                    this.id = "Tool_NeWMI_MultiSelectionTool";

                    this.caption = "MultiSelectionTool";

                    this.ui = new MultiSelectionListUI(p_objParams.map);

                    /**
                    * @property {Number} maxSelection
                    *
                    * The maximum selection items to show on the screen
                    */
                    this.maxSelection = p_objParams.maxSelection;
                },

                /**
                * @method canActivate
                * Checking if the given selection set is valid for starting this tool
                * @param {Object[]} p_objSelection The selection set
                * @param {Object} p_objSelection.item Each item in the array is an object of:
                * @param {NeWMI.Layer.Base.ACustomLayer} p_objSelection.item.layer The layer that contains those objects that their selection has been changed
                * @param {NeWMI.Object.NeWMIObject[]} p_objSelection.item.objects The objects which changed their selection status
                * @return {Boolean} True, if the given selection set is valid for starting this tool
                */
                canActivate: function (p_objSelection) {

                    if (p_objSelection) {

                        var intObjCount = 0;
                        for (var intCurrSelectionItem = 0; intCurrSelectionItem < p_objSelection.length; intCurrSelectionItem++) {
                            var item = p_objSelection[intCurrSelectionItem];

                            intObjCount += item.objects.length

                            if (this.maxSelection && this.maxSelection < intObjCount)
                            {
                                return false;
                            }
                            else if (!this.maxSelection && intObjCount > 1) {
                                return true;
                            }
                        }
                    }

                    if (this.maxSelection && this.maxSelection >= intObjCount && intObjCount > 1) {
                        return true;
                    }

                    return false;
                },

                /**
                * @method prepare
                * Preparing this tool for activation
                * @param {Object} params parameters The parameters
                * @param {NeWMI.Tool.Base.ATool} params.lastTool The last tool before activating this tool
                * @param {NeWMI.Geometry.Point} params.startPosition The point the multi selection starting at
                * @param {Object[]} params.objects The selection set
                * @param {Object} params.objects.item Each item in the array is an object of:
                * @param {NeWMI.Layer.Base.ACustomLayer} params.objects.item.layer The layer that contains those objects that their selection has been changed
                * @param {NeWMI.Object.NeWMIObject[]} params.objects.item.objects The objects which changed their selection status
                * @param {NeWMI.Draw.Types.Rect} params.cancelRect The last tool before activating this tool
                * @param {Function} params.getObjectsImagesFunc The callback for getting the images of the objects. The callback will get as parameter the selection set as described here (parameter 'objects')
                * and will return an object that it's properties are the id's of the selected object, and the value will be the image.
                */
                prepare: function (params) {
                    
                    params = params || {};

                    this.lastTool = params.lastTool;
                    this.startPosition = params.startPosition;
                    this.objects = params.objects;
                    this.cancelRect = params.cancelRect;

                    this.ui.getObjectsImages = params.getObjectsImagesFunc;
                },

                activate: function () {
                    this.inherited(arguments);

                    this.ui.show(this.startPosition, this.objects);
                    this.map.disablePan();
                },

                deactivate: function () {
                    this.inherited(arguments);

                    this.ui.close();
                },
                
                onMapEvent: function (evt) {
                    switch (evt.eventType) {
                        case AEventsManager.EMapEvents.MouseDown:
                            {
                                this._onMouseDown(evt);
                                break;
                            }
                        case AEventsManager.EMapEvents.MouseUp:
                            {
                                this._onMouseUp(evt);
                                break;
                            }
                    }
                },

                _onMouseDown: function (evt) {
                    this.cancelTool = this.ui.click(evt.screenPoint, evt.button, this.cancelRect);
                },

                _onMouseUp: function (evt) {
                    if (this.cancelTool) {
                        this.map.toolsMgr.activate(this.lastTool);
                    }
                }
            });
        });