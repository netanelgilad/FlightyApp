define([ "dojo/_base/declare", 
         "NeWMI/Tool/Feedback/Base/AGeometryFeedback", 
         "NeWMI/Service/Math/MeasurementSvc",
         "NeWMI/Geometry/Base/AGeometry",
         "NeWMI/Geometry/Point"], 
         function(declare, AGeometryFeedback, MeasurementSvc,AGeometry, Point) {
	
	return declare("NeWMI.Tool.Feedback.PointFeedback", AGeometryFeedback, 
	{	
		_hitTest : function (p_objPnt)
		{
			return new AGeometry.HitTestResult( { hitResult: AGeometry.HitTestResult.HitState.vertex } );		
		},
		
		mouseDown : function(evt)
		{
			this.inherited(arguments);
			
			this.mouseDrag(evt);
		},
				
		mouseDrag : function(evt)
		{
			if (evt.button == 0 && this._hitResult.hitResult == AGeometry.HitTestResult.HitState.vertex)
			{
				this._geometry.x = evt.mapPoint.x;
				this._geometry.y = evt.mapPoint.y;
				this._geometry.dataChanged();
				
				this._handleAutoScroll(evt);
			}
		},
		
		_createGeoInstance : function()
		{
		    return Point({ "x": 0, "y": 0 });
		}
	});
});