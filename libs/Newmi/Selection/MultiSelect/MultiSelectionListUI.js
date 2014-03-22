define(["dojo/_base/declare", 
        "dojo/Evented",
        "NeWMI/Tool/EventObject",
        "NeWMI/Layer/Base/ACustomLayer",
        "NeWMI/Layer/Base/ALayersManager",
        "NeWMI/Draw/Draw2D",
        "NeWMI/Draw/Types/Rect",
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Service/Math/InfoSvc",
        "NeWMI/Selection/SelectionManager"],
function (declare,
            Evented,
            EventObject,
            ACustomLayer,
            ALayersManager,
            Draw2D,
            Rect,
            MeasurementSvc,
            InfoSvc,
            SelectionManager)
{
    var MultiSelectionListUI = declare("NeWMI.Selection.MultiSelect.MultiSelectionListUI", Evented,
	{
	    /// [ map, getObjectsImagesFunc ]
	    constructor: function (p_objMap) {

	        this.map = p_objMap;

	        this._layer = new MultiSelectionListUI.Layer();
	    },

	    show: function (p_objStartPoint, p_objObjects) {

	        if (!this.getObjectsImages)
	            return;

	        this.activated = true;

	        // Getting the images from the application
	        var objImages = this.getObjectsImages(p_objObjects);

	        this._layer.show(this.map, p_objStartPoint, p_objObjects, objImages);

	        this.map.layersMgr.insertLayer(ALayersManager.LayersTypes._Additional, this._layer);
	    },

	    close: function () {

	        this._layer.close(dojo.hitch(this, function () {
	            this.activated = false;

	            this.map.layersMgr.removeLayer(ALayersManager.LayersTypes._Additional, this._layer);
	        }));
	    },

	    click: function (p_objScreenPnt, p_ePressedButton, p_objCancelSelectionRect) {

	        var blnClickedOutside = true;
	        if (this.activated) {
	            blnClickedOutside = !this._layer.click(this.map, p_objScreenPnt, p_ePressedButton, p_objCancelSelectionRect);
	        }

	        return blnClickedOutside;
	    }
	});

    MultiSelectionListUI.Layer = declare("NeWMI.Tool.SelectionTool.Layer", ACustomLayer,
	{
	    "-chains-" : 
		{
		    constructor: "manual"
		},
		
	    constructor : function(params)
	    {
	        this.inherited(arguments, [false, true]);
	        
	        params = params || {};

	        this.ctxParams = dojo.clone(params);

	        this.ctxParams.lineWidth = this.ctxParams.lineWidth || 2;
	        this.ctxParams.strokeStyle = this.ctxParams.strokeStyle || "rgba(51,153,255, 1)";

	        this.animationDuration = 250;

	        this._graphics = {};
	    },

	    show: function (p_objMap, p_objStartPos, p_objObjects, p_objImages) {

	        var firstImage;
	        for (var strCurrkey in p_objImages) {
	            firstImage = p_objImages[strCurrkey];
	            break;
	        }

	        var paddingItems = 5;
	        var spaceBetweenItems = 5;

            // Calculating how many selection items will fit on the screen
	        var objScreenSize = p_objMap.getControlLayout();

	        var objImageSize = { width: firstImage.width, height: firstImage.height };
	        var intMaxPicsInScreen = Math.floor((objScreenSize.width - paddingItems) / (objImageSize.width + spaceBetweenItems));

	        var intPaddingX = 0;

	        var intImagesCount = Object.keys(p_objImages).length;

	        if (intMaxPicsInScreen > intImagesCount)
	        {
	            var intTotalWidthOfImages = intImagesCount * (spaceBetweenItems + objImageSize.width) + paddingItems;
	            intPaddingX = (objScreenSize.width - intTotalWidthOfImages) / 2;
	        }

	        var intY = objScreenSize.height - objImageSize.height / 2 - paddingItems;
            
	        var intCurrSelPos = 0;

	        this._graphics = {};

            // Creating the graphic items of the selection
	        p_objObjects.forEach(function (item) {
	            item.objects.forEach(function (objCurrObj) {
	                var objGraphic = {};
	                objGraphic.layer = item.layer;
	                objGraphic.object = objCurrObj;
	                objGraphic.image = p_objImages[objCurrObj.id];

	                // Calculating the start position of the animation
	                var objPP = objCurrObj.geometry.getPresentationPoint();
	                objGraphic.startPositionGeo = objPP;
	                objGraphic.startPosition = p_objMap.conversionsSvc.toScreen(objPP.x, objPP.y);
                    
	                // Calculating the end position of the animation by angle and distance. The animation will raise from 0 distance to endDistance
	                var intX = (objScreenSize.width + objImageSize.width / 2 - paddingItems) - (intCurrSelPos * (objImageSize.width + spaceBetweenItems)) - objImageSize.width - intPaddingX;

	                var dblAngle = Math.PI / 2 - MeasurementSvc.getAngle(objGraphic.startPosition.x, objGraphic.startPosition.y, intX, intY);

	                var dblDist = MeasurementSvc.distance(objGraphic.startPosition.x, objGraphic.startPosition.y, intX, intY);

	                objGraphic.cosSin = { cos: Math.cos(dblAngle), sin: Math.sin(dblAngle) };
	                objGraphic.endDistance = dblDist;

	                intCurrSelPos = (intCurrSelPos + 1) % intMaxPicsInScreen;

	                this._graphics[objCurrObj.id] = objGraphic;

	                // It's time to go to the next row (From down upwards)
	                if (intCurrSelPos == 0) {
	                    intY -= objImageSize.height + spaceBetweenItems;
	                }

	            }, this);
	        }, this);

	        this._startShowingAnimation = true;
	    },

	    close: function (p_objFunc) {

	        this._startClosingAnimation = true;

	        this._raiseEndCallBack = true;
	        this._endCallback = p_objFunc;
	        this.refresh();
	    },

	    _animationEnded: function () {
	        if (this._raiseEndCallBack && this._endCallback) {
	            this._raiseEndCallBack = false;
	            this._endCallback();
	        }
	    },

	    draw2D: function (p_objMap, p_objContext) {

	        var mapLayout = p_objMap.getControlLayout();

	        // Making the screen whiter abit
	        p_objContext.fillStyle = "rgba(255, 255, 255, 0.5)";
	        p_objContext.fillRect(0, 0, mapLayout.width, mapLayout.height);

            // If we want to start showing animation
	        if (this._startShowingAnimation) {
	            this._startShowingAnimation = false;

	            this._intAnimDirection = 0;
	            this._lngStartTime = new Date().getTime();
	        }
            // If we want to start closing animation
	        else if (this._startClosingAnimation) {
	            this._startClosingAnimation = false;

	            this._lastHitObject = null;

	            this._intAnimDirection = -1;
	            this._lngStartTime = new Date().getTime();
	        }
	        
	        var dblFrameTime = (new Date().getTime() - this._lngStartTime);

	        // 0 to 1 percentage of the animation
	        var dblAnimPercentage = Math.abs(Math.min(1, dblFrameTime / this.animationDuration) + this._intAnimDirection);

	        p_objContext.globalAlpha = dblAnimPercentage;

	        for (var intcurrKey in this._graphics) {

	            var objGraphic = this._graphics[intcurrKey];

	            objGraphic.currPosition = {
	                x: objGraphic.startPosition.x + dblAnimPercentage * (objGraphic.endDistance * objGraphic.cosSin.cos),
	                y: objGraphic.startPosition.y + dblAnimPercentage * (objGraphic.endDistance * objGraphic.cosSin.sin)
	            };

	            Draw2D.imageCenter(p_objContext, objGraphic.image, objGraphic.currPosition.x, objGraphic.currPosition.y, objGraphic.image.width, objGraphic.image.height);

	            objGraphic.bounds = new Rect(objGraphic.currPosition.x - objGraphic.image.width / 2,
                                              objGraphic.currPosition.y - objGraphic.image.height / 2,
                                              objGraphic.image.width,
                                              objGraphic.image.height);
	        }

	        if (this._lastHitObject) {

	            var objScreenPnt = p_objMap.conversionsSvc.toScreen(this._lastHitObject.startPositionGeo.x, this._lastHitObject.startPositionGeo.y);

	            p_objContext.lineWidth = 3;
	            p_objContext.strokeStyle = "black";
	            p_objContext.beginPath();
	            p_objContext.moveTo(objScreenPnt.x, objScreenPnt.y);
	            p_objContext.lineTo(this._lastHitObject.currPosition.x, this._lastHitObject.currPosition.y - objGraphic.bounds.height / 2);
	            p_objContext.stroke();
	        }

	        if ((this._intAnimDirection == -1 && dblAnimPercentage <= 0) ||
                (this._intAnimDirection == 1 && dblAnimPercentage >= 1)) {
	            this._animationEnded();
	        }
	        else {
	            var me = this;
	            setTimeout(function () {
	                me.refresh(p_objMap);
	            }, 1);
	        }
	    },



	    click: function (p_objMap, p_objScreenPnt, p_ePressedButton, p_objCancelSelectionRect)
	    {
	        var blnPressedOnSomething = false;
	        var objItemToRemove = null;

	        for (var intCurrGraphicKey in this._graphics) {
	            var objCurrGraphic = this._graphics[intCurrGraphicKey];

	            if (objCurrGraphic.bounds.contains(p_objScreenPnt)) {
	                if (p_ePressedButton == 1/*ContextMenuMouseButton*/) {
	                    /*if (OnContextMenu != null)
                        {
                            OnContextMenu(objCurrItem.Layer, objCurrItem.Item, p_objPnt);
                        }*/
	                }
	                else {
	                    if (p_objCancelSelectionRect && p_objCancelSelectionRect.contains({ x: p_objScreenPnt.x - objCurrGraphic.bounds.x, y: p_objScreenPnt.y - objCurrGraphic.bounds.y })) {
	                        objItemToRemove = objCurrGraphic;

	                        if (this._lastHitObject === objCurrGraphic) {
	                            this._lastHitObject = null;
	                        }
	                    }
	                    else {
	                        /*if (OnPressedItem != null)
                            {
                                OnPressedItem(objCurrItem.Layer, objCurrItem.Item, p_objPnt);
                            }*/

	                        this._lastHitObject = objCurrGraphic;
	                        this.refresh(this.map);
	                    }

	                    blnPressedOnSomething = true;
	                    break;
	                }
	            }
	        }
        
	        if (blnPressedOnSomething)
	        {
	            if (objItemToRemove != null)
	            {
	                var objSelection = [];
	                objSelection.push( { 
	                    layer: objItemToRemove.layer, 
	                    objects : [ objItemToRemove.object ] 
	                });
            
	                p_objMap.selectionMgr.setterMgr.set(objSelection, SelectionManager.SelectionType.Remove);
	                delete this._graphics[objItemToRemove.object.id];

	                if (Object.keys(this._graphics).length == 0)
	                {
	                    blnPressedOnSomething = false;   
	                }
	                else
	                {
	                    this.refresh(p_objMap);
	                }
	            }
	        }
	        else
	        {
	            blnPressedOnSomething = false;
	        }

	        return blnPressedOnSomething;
	    }
	});

    return MultiSelectionListUI;
});