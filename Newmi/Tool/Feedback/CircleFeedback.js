define(["dojo/_base/declare", "NeWMI/Tool/Feedback/Base/AGeometryFeedback",
    "NeWMI/Service/Math/MeasurementSvc",
    "NeWMI/Geometry/Base/AGeometry",
    "NeWMI/Geometry/Point",
    "NeWMI/Geometry/Circle"],
         function (declare, AGeometryFeedback, MeasurementSvc, AGeometry,Point, Circle) {
	
	return declare("NeWMI.Tool.Feedback.CircleFeedback", AGeometryFeedback, 
	{	
		_createGeoInstance : function(p_eType)
		{
			return new Circle();			
		},
		
		_hitTest : function (p_objPnt)
		{
			if (this._createFeedback)
			{
				var objHitRes = new AGeometry.HitTestResult( { hitResult: AGeometry.HitTestResult.HitState.boundary });
				
				return objHitRes;
			}
			
			return this._geometry.hitTest(this._map, p_objPnt);
		},
		
		_updateDistanceFromCenter : function (p_objPnt)
		{
		    this._distanceFromCenter = MeasurementSvc.distancePnts(p_objPnt, { "x": this._geometry.x, "y": this._geometry.y });
		},

		mouseDrag : function(evt)
		{
			if (evt.button == 0 && this._hitResult.hitResult != AGeometry.HitTestResult.HitState.none)
			{
				if (this._hitResult.hitResult == AGeometry.HitTestResult.HitState.boundary)
				{
					this._updateDistanceFromCenter(evt.mapPoint);
					this._geometry.radius = this._distanceFromCenter;
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
		}
	});
});