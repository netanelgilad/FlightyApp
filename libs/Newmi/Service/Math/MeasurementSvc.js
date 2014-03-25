define(["dojo/_base/declare"], function(declare){
	
	var MeasurementSvc = declare("NeWMI.Service.Math.MeasurementSvc", null, {});

		MeasurementSvc.perp = function(p_dblX1, p_dblY1, p_dblX2, p_dblY2)
		{
			return (p_dblX1 * p_dblY2 - p_dblY1 * p_dblX2);
		};
		
		MeasurementSvc.dot = function(p_dblX1, p_dblY1, p_dblX2, p_dblY2)
		{
			return (p_dblX1 * p_dblX2 + p_dblY1 * p_dblY2);
		};
		
		MeasurementSvc.distancePnts = function(p_objFirstPoint, p_objSecondPoint)
		{
		    return Math.sqrt((p_objFirstPoint.x - p_objSecondPoint.x) * (p_objFirstPoint.x - p_objSecondPoint.x) +
		                    (p_objFirstPoint.y - p_objSecondPoint.y) * (p_objFirstPoint.y - p_objSecondPoint.y));
		};
		
		/// <summary>
		/// The function receive three points and check if the 
		/// the vector created by second and third points turn
		/// clockwise related to the vector created by first and
		/// second points.
		/// </summary>
		/// <param name="p_objFirstPointESRIoint">The first point.</param>
		/// <param name="p_objSecondPointESRIoint">The second point.</param>
		/// <param name="p_objThirdPointESRIoint">The third point.</param>
		/// <returns>TRUE if the second vector turn clockwise.</returns>
		MeasurementSvc.isRightTurnOnMap = function(p_objFirstPointESRIoint, p_objSecondPointESRIoint, p_objThirdPointESRIoint)
		{
		    var res = false;
		    if ((p_objThirdPointESRIoint.y - p_objSecondPointESRIoint.y) * (p_objSecondPointESRIoint.x - p_objFirstPointESRIoint.x) -
		        (p_objThirdPointESRIoint.x - p_objSecondPointESRIoint.x) * (p_objSecondPointESRIoint.y - p_objFirstPointESRIoint.y) < 0)
		    {
		        res = true;
		    }
		    return res;
		};

		MeasurementSvc.isRightTurn = function (p_objobjFirstPointPoint, p_objobjSecondPointPoint, p_objobjThirdPointPoint) {
		    var res = false;
		    if ((p_objobjSecondPointPoint.y - p_objobjThirdPointPoint.y) * (p_objobjSecondPointPoint.x - p_objobjFirstPointPoint.x) -
                (p_objobjThirdPointPoint.x - p_objobjSecondPointPoint.x) * (p_objobjFirstPointPoint.y - p_objobjSecondPointPoint.y) < 0)
		    {
		        res = true;
		    }
		    return res;
		};
		
		
		/// <summary>
		/// The function receives coordinates of three points and calculates the angle
		/// between the vector created by first and second points and
		/// the vector created by second and third points.<br/>
		/// The function returned the small "main" angle.
		/// </summary>
		/// <param name="p_dblStartPointX">The X coordinate of the first point.</param>
		/// <param name="p_dblStartPointY">The Y coordinate of the first point.</param>
		/// <param name="p_dblMidllePointX">The X coordinate of the second point.</param>
		/// <param name="p_dblMidllePointY">The Y coordinate of the second point.</param>
		/// <param name="p_dblEndPointX">The X coordinate of the third point.</param>
		/// <param name="p_dblEndPointY">The Y coordinate of the third point.</param>
		/// <param name="p_blnScreenYAxisDirection">Inverse Y Axis direction or not. Default value = true</param>
		/// <returns>The angle between the vectors created by input points.</returns>
		MeasurementSvc.getArrowBodyAngle = function(p_dblStartPointX,
		                                  	p_dblStartPointY,
		                                  	p_dblMidllePointX,
		                                  	p_dblMidllePointY,
		                                  	p_dblEndPointX,
		                                  	p_dblEndPointY)
		{
		    var dblX1 = p_dblStartPointX - p_dblMidllePointX;
		    var dblY1 = p_dblMidllePointY - p_dblStartPointY;
		    var dblX2 = p_dblEndPointX - p_dblMidllePointX;
		    var dblY2 = p_dblMidllePointY - p_dblEndPointY;
		    var dblLength1 = Math.sqrt(dblX1 * dblX1 + dblY1 * dblY1);
		    var dblLength2 = Math.sqrt(dblX2 * dblX2 + dblY2 * dblY2);
		
		    var dblAngle = 0;
		
		    if (dblLength1 == 0 || dblLength2 == 0)
		    {
		        dblAngle = 0;
		    }
		    else
		    {        
		        //dblY1 = -dblY1;
		        //dblY2 = -dblY2;
		        
		        var dblCosinusAngle = ((dblX1 * dblX2) + (dblY1 * dblY2)) /(dblLength1 * dblLength2);
		        dblAngle = Math.acos(dblCosinusAngle);
		    }
		
		    return dblAngle;
		};
		
		/// <summary>
		/// Returns the angle of the segment defined by two points. The 0 angle lies in the east direction.
		/// </summary>
		/// <param name="p_dblFirstPointX">First point X</param>
		/// <param name="p_dblFirstPointY">First point Y</param>
		/// <param name="p_dblSecondPointX">Second point X</param>
		/// <param name="p_dblSecondPointY">Second point Y</param>
		/// <param name="p_blnScreenYAxisDirection">Inverse Y Axis direction or not. Default value = true</param>
		/// <returns>The angle between segment and x - east axis, in radians</returns>
		MeasurementSvc.getTrigonometricAngle = function(p_dblFirstPointX, p_dblFirstPointY,
		                       p_dblSecondPointX, p_dblSecondPointY)
		{
		    var dblAngle = this.getAngle(p_dblFirstPointX, p_dblFirstPointY, p_dblSecondPointX, p_dblSecondPointY);
				    
		    dblAngle = (Math.PI / 2 - dblAngle);
		
		    if (dblAngle <= 0)
		    {
		        dblAngle = dblAngle + Math.PI * 2;
		    }
		    
		    return dblAngle;
		};
		
		MeasurementSvc.distance = function(p_dblFromX, p_dblFromY, p_dblToX, p_dblToY)
		        {
		            return Math.sqrt((p_dblFromX - p_dblToX) * (p_dblFromX - p_dblToX) +
		                            (p_dblFromY - p_dblToY) * (p_dblFromY - p_dblToY));
		};
		
		// <summary>
		// The method is a logical base of 4 GetAngle methods, and contains general angle calculation algorithm.<para></para>
		//				0
		//			-		-
		//		270		      90
		//			-		-
		//			   180
		// </summary>
		// <param name="p_dblFirstPointX">X value of From point.</param>
		// <param name="p_dblFirstPointY">Y value of From point.</param>
		// <param name="p_dblSecondPointX">X value of To point.</param>
		// <param name="p_dblSecondPointY">Y value of To point.</param>
		// <param name="p_blnScreenOrientationYAxis">Inverse Y Axis direction or not. Default value = true</param>
		// <returns>Angle in radians</returns>
		MeasurementSvc.getAngle = function(p_dblFirstPointX, p_dblFirstPointY,
							   p_dblSecondPointX, p_dblSecondPointY)
		{
			var dblAngle = 0;
			var dblDeltaX, dblDeltaY;
			var dblTanA;
		
			dblDeltaX = p_dblFirstPointX - p_dblSecondPointX;
			if (dblDeltaX == 0)
			{
				if (p_dblFirstPointY >= p_dblSecondPointY) //180
				{
					dblAngle = Math.PI;
				}
				else
				{
					dblAngle = 0; // 0* Pi/180 = 0
				}
			}
			else
			{
				//dblDeltaY = p_dblFirstPointY - p_dblSecondPointY;
				dblDeltaY = p_dblSecondPointY - p_dblFirstPointY;		
		
				dblTanA = dblDeltaY / dblDeltaX;
				dblAngle = Math.atan(dblTanA);
		
				if (dblDeltaX < 0) //<
				{
					dblAngle += Math.PI / 2;
				}
				else if (dblDeltaX > 0) //>
				{
					dblAngle += (Math.PI * 3 / 2);
				}
			}
			
			return dblAngle;
		};
		
	
	return MeasurementSvc;
});