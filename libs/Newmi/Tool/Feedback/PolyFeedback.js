define([ "dojo/_base/declare", 
         "NeWMI/Tool/Feedback/Base/AGeometryFeedback", 
         "NeWMI/Service/Math/MeasurementSvc", 
         "NeWMI/Service/Math/RelationalOp", 
         "NeWMI/Service/Math/RelationalOpGeo", 
         "NeWMI/Geometry/Base/AGeometry",
         "NeWMI/Geometry/Polyline",
         "NeWMI/Geometry/Polygon"], 
         function(declare, AGeometryFeedback, MeasurementSvc, RelationalOp, RelationalOpGeo, AGeometry, Polyline, Polygon) {
	
	return declare("NeWMI.Tool.Feedback.PolyFeedback", AGeometryFeedback, 
	{		
		_createGeoInstance : function(p_eType)
		{
			if (p_eType == AGeometry.EGeometryType.Polyline)
			{
				return new Polyline();
			}
			else
			{
				return new Polygon();
			}
		},

		_hitTest: function (p_objPnt) {
		    if (this._createFeedback) {
		        var objHitRes = new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.vertex, index: this._geometry.getDrawingPoints().length });

		        return objHitRes;
		    }

		    return this._geometry.hitTest(this._map, p_objPnt);
		},
		
		mouseDown : function(evt)
		{
			this.inherited(arguments);
			
			if (this._createFeedback)
			{
				// Setting add point flag
				evt.ctrlKey = true;
			}
			
			if (evt.button == 0 && this._hitResult.hitResult != AGeometry.HitTestResult.HitState.none)
			{
				if (evt.ctrlKey)
				{
				    if (this._hitResult.hitResult == AGeometry.HitTestResult.HitState.boundary ||
						this._hitResult.hitResult == AGeometry.HitTestResult.HitState.vertex)
					{
						if (this._geometry.GeoType != AGeometry.EGeometryType.Rectangle)
						{
						    if (this._hitResult.hitResult == AGeometry.HitTestResult.HitState.boundary)
							{
								this._hitResult.index++;
							}
							else if (this._geometry.GeoType != AGeometry.EGeometryType.Polygon &&
									this._hitResult.hitResult == AGeometry.HitTestResult.HitState.vertex &&
									this._hitResult.index == this._geometry.points.length - 1)
							{
								this._hitResult.index++;
							}

							this._geometry.points.splice(this._hitResult.index, 0, dojo.clone(evt.mapPoint));
							this._geometry.dataChanged();
							
							this._hitResult.hitResult = AGeometry.HitTestResult.HitState.vertex;
						}
					}
				}
				else if (evt.shiftKey)
				{
				
				}
			}
		},
				
		mouseDrag : function(evt)
		{
		    if (evt.button == 0 && this._hitResult.hitResult != AGeometry.HitTestResult.HitState.none)
			{
				
		        if (this._hitResult.hitResult == AGeometry.HitTestResult.HitState.boundary ||
					this._hitResult.hitResult == AGeometry.HitTestResult.HitState.content)
				{
					this._geometry.move(evt.mapPoint.x - this._hitResult._lastMousePos.x, evt.mapPoint.y - this._hitResult._lastMousePos.y);
					this._hitResult._lastMousePos = evt.mapPoint;
				}
				else
				{
					this._geometry.points[this._hitResult.index] = dojo.clone(evt.mapPoint);
				}
				
				this._geometry.dataChanged();
				
				this._handleAutoScroll(evt);
			}
		}
		
		
	});
});