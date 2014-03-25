define([ "dojo/_base/declare", 
         "NeWMI/Tool/Feedback/Base/AGeometryFeedback", 
         "NeWMI/Service/Math/MeasurementSvc",
         "NeWMI/Service/Math/RelationalOp",
         "NeWMI/Service/Math/InfoSvc",
         "NeWMI/Geometry/Base/AGeometry",
         "NeWMI/Geometry/Point",
         "NeWMI/Geometry/Ellipse"], 
         function(declare, 
        		 AGeometryFeedback, 
        		 MeasurementSvc, 
        		 RelationalOp, 
        		 InfoSvc,
                 AGeometry,
        		 Point,
        		 Ellipse) {
	
	return declare("NeWMI.Tool.Feedback.EllipseFeedback", AGeometryFeedback, 
	{	
		_createGeoInstance : function(p_eType)
		{
		    return new Ellipse({
		        "x": 0,
		        "y": 0,
		        "xRadius": 0,
		        "yRadius": 0
		    });
		},
		
		_hitTest : function (p_objPnt)
		{			
		    if (this._createFeedback) {
		        var objHitResult = new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.boundary });
		        objHitResult._hitPoint = p_objPnt;
		        objHitResult._xRadius = this._geometry.xRadius;
		        objHitResult._yRadius = this._geometry.yRadius;
		        objHitResult._factorX = 1;
		        objHitResult._factorY = 1;

		        return objHitResult;
		    }
			
		
		    return this._geometry.hitTest(this._map, p_objPnt);

		},

		mouseDrag : function(evt)
		{
			if (evt.button == 0 && this._hitResult.hitResult != AGeometry.HitTestResult.HitState.none)
			{
				if (this._hitResult.hitResult == AGeometry.HitTestResult.HitState.boundary)
				{
					// In case the geometry is rotated - instead of do allot of calculation different we are just manipulate the pressed point
					var objNewMapPnt = InfoSvc.getPointAfterRotation(this._hitResult._hitPoint, evt.mapPoint, Math.PI / 2 - this._geometry.angle);
					
					this._geometry.xRadius = this._hitResult._xRadius + this._hitResult._factorX * (objNewMapPnt.x - this._hitResult._hitPoint.x);
					this._geometry.yRadius = this._hitResult._yRadius + this._hitResult._factorY * (objNewMapPnt.y - this._hitResult._hitPoint.y);
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
		
		mouseDown : function(evt)
		{
			if (this._createFeedback)
			{
				this._geometry.x = evt.mapPoint.x;
				this._geometry.y = evt.mapPoint.y;
				this._geometry.dataChanged();
			}
			
			this.inherited(arguments);
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