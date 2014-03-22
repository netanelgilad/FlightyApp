/**
* @class NeWMI.Tool.DistanceTool
* <p>Represent the distance tool in the map.</p>
* <p>This tool is waiting for the user to click points on the map and drawing on each segments the distance of it</p>
* @extends NeWMI.Tool.CreateTool
*/
define(["dojo/_base/declare",
        "NeWMI/Tool/CreateTool",
        "NeWMI/Geometry/Base/AGeometry",
        "NeWMI/Tool/Base/AFeedbackTool",
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Draw/Draw2D"],
        function(declare,
        		CreateTool,
        		AGeometry,
        		AFeedbackTool,
                AEventsManager,
                MeasurementSvc,
                Draw2D)
{
	var DistanceTool = declare("NeWMI.Tool.DistanceTool", CreateTool,
	{ 
		"-chains-" : 
		{
			constructor: "manual"
		},

	    /**
        * @constructor
        * Creates new DistanceTool instance
        */
		constructor : function()
		{
		    this._feedbackLayer = new DistanceTool.Layer();

			this.inherited(arguments);
			
			this.caption = "Distance";
		},

	    /**
        * @method setTextStyle
        * Setting the style of the text showed on the segments
        * @param {Object} params Contains the properties as they are in the Canvas (Context '2d'), and their values
        */
		setTextStyle : function(params)
		{
		    dojo.mixin(this._feedbackLayer.textStyle, params);
		},

	    /*_onFeedbackLayerAdded: function () {
	        this.start(AGeometry.EGeometryType.Polyline, false);
	    },*/

		deactivate: function () {
		    this.inherited(arguments);

		    if (this._feedbackLayer) {
		        this._feedbackLayer.end();
		    }
		},

	    onMapEvent : function(evt)
	    {
	        if (!this.isStarted && evt.eventType == AEventsManager.EMapEvents.MouseDown) {
	            this._feedbackLayer.end();
	            this.start(AGeometry.EGeometryType.Polyline, false);
	        }

	        this.inherited(arguments);
	    },


	    /**
        * @method finish
        * Finishing the distance mode
        */
	    finish: function () {
	        this._feedback.end();

	        this.isStarted = false;

	        this._feedbackLayer.refresh(this.map);
	    }
	});

	DistanceTool.Layer = declare("NeWMI.Tool.DistanceTool.Layer", AFeedbackTool.Layer,
    {
        "-chains-" : 
		{
		    constructor: "manual"
		},

        constructor : function()
        {
            this.inherited(arguments);

            this.textStyle = {
                fillStyle : 'black',
                font: '12pt Arial',
                textBaseline : 'bottom',
                textAlign : 'center'
            };
        },

        draw2D: function (p_objMap, p_objContext)
        {
            this.inherited(arguments);

            if (this.geometry && this.geometry.points.length) {

                var objCurrPnt = this.geometry.points[0];
                var objCurrPntPixel = p_objMap.conversionsSvc.toScreen(objCurrPnt.x, objCurrPnt.y);
                var objCurrNextPt;
                var objCurrNextPtPixel;

                var angleSwitched;

                var dblTotalDistance = 0;

                Draw2D.setContextParams(p_objContext, this.textStyle);

                for (var intCurrPt = 1; intCurrPt < this.geometry.points.length; intCurrPt++) {
                    objCurrNextPt = this.geometry.points[intCurrPt];
                    objCurrNextPtPixel = p_objMap.conversionsSvc.toScreen(objCurrNextPt.x, objCurrNextPt.y);

                    // Getting the angle of the segment for the text 
                    var dblSegAngle = MeasurementSvc.getTrigonometricAngle(objCurrPntPixel.x, objCurrPntPixel.y, objCurrNextPtPixel.x, objCurrNextPtPixel.y);

                    // Flipping the text so it will not be upside down between some angles
                    if (dblSegAngle > Math.PI / 2 && dblSegAngle < Math.PI * 1.5) {
                        dblSegAngle += Math.PI;
                        angleSwitched = true;
                    }
                    else {
                        angleSwitched = false;
                    }
                    
                    var dblSegDistance = MeasurementSvc.distance(objCurrPnt.x, objCurrPnt.y, objCurrNextPt.x, objCurrNextPt.y);

                    dblTotalDistance += dblSegDistance;

                    var screenPnt = { x: (objCurrPntPixel.x + objCurrNextPtPixel.x) / 2, y: (objCurrPntPixel.y + objCurrNextPtPixel.y) / 2 };

                    p_objContext.save();
                    Draw2D.rotateAtPoint(p_objContext, screenPnt.x, screenPnt.y, dblSegAngle);
                    p_objContext.fillText(dblSegDistance.toFixed(2).toString(), screenPnt.x, screenPnt.y - 10);
                    p_objContext.restore();

                    objCurrPnt = objCurrNextPt;
                    objCurrPntPixel = objCurrNextPtPixel;
                }

                // Drawing the total distance
                if (this.geometry.points.length > 1) {
                    
                    p_objContext.textAlign = angleSwitched ? 'right' : 'left';
                    p_objContext.fillText(dblTotalDistance.toFixed(2).toString(), objCurrPntPixel.x + (angleSwitched ? -10 : 10), objCurrPntPixel.y);
                }
            }
        }
    });

	return DistanceTool;
});