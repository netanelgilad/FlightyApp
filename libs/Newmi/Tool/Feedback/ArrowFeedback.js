define([ "dojo/_base/declare", 
         "NeWMI/Tool/Feedback/Base/AGeometryFeedback", 
         "NeWMI/Service/Math/MeasurementSvc",
         "NeWMI/Service/Math/RelationalOp",
         "NeWMI/Service/Math/InfoSvc", 
         "NeWMI/Service/Create/ArrowSvc",
         "NeWMI/Geometry/Point"], 
         function(declare, 
        		 AGeometryFeedback, 
        		 MeasurementSvc, 
        		 RelationalOp, 
        		 InfoSvc, 
        		 ArrowSvc,
        		 Point) {
	
	return declare("NeWMI.Tool.Feedback.ArrowFeedback", AGeometryFeedback, 
	{	
		_hitTest : function (p_objPnt)
		{						
			
					
			var dblTolerance = 5;
			var dblToleranceMap = this._map.conversionsSvc.toMapSize(dblTolerance);
			
			var objResult = ArrowSvc.GetArrowHittedPart(p_objPnt.x, 
					p_objPnt.y,
					this._geometry.points,		            
					this._geometry.getDrawingPoints(),
					dblToleranceMap);
					
			
			return new AGeometryFeedback.HitTestResult();
		},

		mouseDrag : function(evt)
		{
			if (evt.button == 0 && this._hitResult.hitResult != AGeometryFeedback.HitTestResult.HitState.none)
			{
				if (this._hitResult.hitResult == AGeometryFeedback.HitTestResult.HitState.boundary)
				{
					this._geometry.xRadius += this._hitResult._factorX * (evt.mapPoint.x - this._hitResult._lastMouse.x);
					this._geometry.yRadius += this._hitResult._factorY * (evt.mapPoint.y - this._hitResult._lastMouse.y);

					this._hitResult._lastMouse = evt.mapPoint;
				}
				else
				{
					this._geometry.x = evt.mapPoint.x + this._hitResult._offsetFromCenter.x;
					this._geometry.y = evt.mapPoint.y + this._hitResult._offsetFromCenter.y;
				}
				
				this._geometry.dataChanged();
				
				this._handleAutoScroll(evt);
			}
		},
		
		mouseUp : function(evt)
		{
			this._geometry.xRadius = Math.abs(this._geometry.xRadius);
			this._geometry.yRadius = Math.abs(this._geometry.yRadius);
			this._geometry.dataChanged();
			
			this.inherited(arguments);
		}
	});
});