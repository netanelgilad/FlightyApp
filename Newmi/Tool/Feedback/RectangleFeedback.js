


define(["dojo/_base/declare", "NeWMI/Tool/Feedback/Base/AGeometryFeedback", "NeWMI/Service/Math/MeasurementSvc", "NeWMI/Geometry/Rectangle"],
         function (declare, AGeometryFeedback, MeasurementSvc, Rectangle) {
	
             return declare("NeWMI.Tool.Feedback.RectangleFeedback", AGeometryFeedback,
	{						
		_createGeoInstance : function()
		{
		    return new Rectangle();
		},
		
		mouseDown: function (evt) {
		    if (this._createFeedback) {
		        this._geometry.xCenter = evt.mapPoint.x;
		        this._geometry.yCenter = evt.mapPoint.y;
		        this._geometry.width = 0;
		        this._geometry.height = 0;
		        this._geometry.dataChanged();
		    }

		    this.inherited(arguments);
		},

		mouseDrag : function(evt)
		{
		    if (evt.button == 0 && this._hitResult.hitResult != NeWMI.Geometry.Base.AGeometry.HitTestResult.HitState.none)
			{
		        if (this._hitResult.hitResult == NeWMI.Geometry.Base.AGeometry.HitTestResult.HitState.boundary ||
					this._hitResult.hitResult == NeWMI.Geometry.Base.AGeometry.HitTestResult.HitState.content)
		        {
		            //console.log(evt.mapPoint.y + " -- " + this._hitResult._lastMousePos.y);
		            this._geometry.move(evt.mapPoint.x - this._hitResult._lastMousePos.x, evt.mapPoint.y - this._hitResult._lastMousePos.y);
		            this._hitResult._lastMousePos = evt.mapPoint;
		        }
		        else {
		            this._geometry.setPoint(this._hitResult.index, evt.mapPoint.x, evt.mapPoint.y);
		        }
                /*
				else if (this._hitResult.index == 0)
				{
				    this._geometry.setLimitValues({ "xmin": evt.mapPoint.x, "ymin": evt.mapPoint.y });					
				}
				else if (this._hitResult.index == 1)
				{
				    this._geometry.setLimitValues({ "xmax": evt.mapPoint.x, "ymin": evt.mapPoint.y });					
				}
				else if (this._hitResult.index == 2)
				{
				    this._geometry.setLimitValues({ "xmax": evt.mapPoint.x, "ymax": evt.mapPoint.y });					
				}
				else if (this._hitResult.index == 3)
				{
				    this._geometry.setLimitValues({ "xmin": evt.mapPoint.x, "ymax": evt.mapPoint.y });					
				}

				this._geometry.dataChanged();*/
				
				this._handleAutoScroll(evt);
			}
		},
		
		mouseUp : function(evt)
		{
		    this._geometry.width = Math.abs(this._geometry.width);
		    this._geometry.height = Math.abs(this._geometry.height);
			this._geometry.dataChanged();
			
			this.inherited(arguments);
		}		
	});
});