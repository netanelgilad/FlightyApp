define(["dojo/_base/declare", 
        "NeWMI/Service/Math/MeasurementSvc",         
        "NeWMI/Service/Math/InfoSvc"], 
        function(declare, 
        		MeasurementSvc,         		
        		InfoSvc)
{
	
	var RelationalOp = declare("NeWMI.Service.Math.RelationalOp", null, {});

	RelationalOp.tolerance = 0.000004;
	
	// <summary>
	// Calculate the shortest distance between the point to the line
	// </summary>
	// <param name="p_dblPointX">The point X-Coordinate</param>
	// <param name="p_dblPointY">The point Y-Coordinate</param>
	// <param name="p_dblFromPointX">The first point of the line - X coordinate</param>
	// <param name="p_dblFromPointY">The first point of the line - Y coordinate</param>
	// <param name="p_dblToPointX">The second point of the line - X coordinate</param>
	// <param name="p_dblToPointY">The second point of the line - Y coordinate</param>
	// <returns>The shortest distance between the point to the line</returns>
	RelationalOp.distancePointFromLine = function(p_dblPointX, p_dblPointY, p_dblFromPointX,  p_dblFromPointY,  p_dblToPointX,  p_dblToPointY)
	{
		var A = p_dblPointX - p_dblFromPointX;
		var B = p_dblPointY - p_dblFromPointY;
		var C = p_dblToPointX - p_dblFromPointX;
		var D = p_dblToPointY - p_dblFromPointY;
		var d = Math.abs(A * D - C * B) / Math.sqrt(C * C + D * D);
		
		return d;
	};
		
	// <summary>
	// Tests if the point is inside a given rectangle
	// </summary>
	// <param name="p_dblX">Point2D to check X</param>
	// <param name="p_dblY">Point2D to check Y</param>
	// <param name="p_dblXMin">Input RectD XMin</param>
	// <param name="p_dblYMin">Input RectD YMin</param>
	// <param name="p_dblXMax">Input RectD XMax</param>
	// <param name="p_dblYMax">Input RectD YMax</param>
	// <returns>True if point is inside, false otherwise</returns>
	RelationalOp.isPointInRectangle = function(p_dblX, p_dblY,
									p_dblXMin, p_dblYMin,
									p_dblXMax, p_dblYMax)
	{
		var blnResult = false;
		if (p_dblX >= p_dblXMin &&
			p_dblX <= p_dblXMax &&
			p_dblY >= p_dblYMin &&
			p_dblY <= p_dblYMax)
		{
			blnResult = true;
		}
		
		return blnResult;
	};
		
		
	// <summary>
	// Checking if the point is on line with tolerance
	// </summary>
	// <param name="p_dblPointX">The point X-Coordinate</param>
	// <param name="p_dblPointY">The point Y-Coordinate</param>
	// <param name="p_dblFromPointX">The first point of the line - X coordinate</param>
	// <param name="p_dblFromPointY">The first point of the line - Y coordinate</param>
	// <param name="p_dblToPointX">The second point of the line - X coordinate</param>
	// <param name="p_dblToPointY">The second point of the line - Y coordinate</param>
	// <param name="p_dblTolerance">The tolerance value</param>
	// <param name="p_dblRealDistance">Returns the actual distance between point and segment.</param>
	// <returns>True, if the point is on the line, otherwise, false</returns>
	RelationalOp.isPointOnLine = function(p_dblPointX, p_dblPointY,
										p_dblFromPointX, p_dblFromPointY,
										p_dblToPointX, p_dblToPointY, p_dblTolerance)	
	{
		var dblRealDistance = RelationalOp.distancePointFromLine(p_dblPointX, p_dblPointY, p_dblFromPointX, p_dblFromPointY, p_dblToPointX, p_dblToPointY);
		
		var blnResult = false;
			
		if (dblRealDistance <= p_dblTolerance)
		{
			if (p_dblPointX >= Math.min(p_dblFromPointX - p_dblTolerance, p_dblToPointX - p_dblTolerance) &&
				p_dblPointX <= Math.max(p_dblFromPointX + p_dblTolerance, p_dblToPointX + p_dblTolerance) &&
				p_dblPointY >= Math.min(p_dblFromPointY - p_dblTolerance, p_dblToPointY - p_dblTolerance) &&
				p_dblPointY <= Math.max(p_dblFromPointY + p_dblTolerance, p_dblToPointY + p_dblTolerance))
			{
				blnResult = true;
			}
		}
		
		return { result: blnResult, distnace: dblRealDistance};
	};
		
	/// <summary>
	/// Method finds (x,y) coordinates of a point which is closest to a given point and is situated on a given line.
	/// </summary>
	/// <param name="p_dblPointX">X coordinate of a 3rd point</param>
	/// <param name="p_dblPointY">Y coordinate of a 3rd point</param>
	/// <param name="p_dblFromPointX">X coordinate of a 1rd point which defines line</param>
	/// <param name="p_dblFromPointY">Y coordinate of a 1rd point which defines line</param>
	/// <param name="p_dblToPointX">X coordinate of a 2nd point which defines line</param>
	/// <param name="p_dblToPointY">Y coordinate of a 2nd point which defines line</param>
	/// <param name="p_dblClosestPointX">X coordinate of found point</param>
	/// <param name="p_dblClosestPointY">Y coordinate of found point</param>
	RelationalOp.getClosestPointOnLineFromPoint = function(p_dblPointX, p_dblPointY,
														p_dblFromPointX, p_dblFromPointY,
														p_dblToPointX,p_dblToPointY)
	{
		//check if From and To points are same point
		if (p_dblFromPointX == p_dblToPointX && p_dblFromPointY == p_dblToPointY)
		{
		    return { "x": p_dblFromPointX, "y": p_dblFromPointY };
		}
		 
		var dblU = ((p_dblPointX - p_dblFromPointX) * (p_dblToPointX - p_dblFromPointX) + (p_dblPointY - p_dblFromPointY) * (p_dblToPointY - p_dblFromPointY)) / (Math.pow((p_dblToPointX - p_dblFromPointX), 2) + Math.pow((p_dblToPointY - p_dblFromPointY), 2));
		
		return {
		    "x": p_dblFromPointX + dblU * (p_dblToPointX - p_dblFromPointX),
		    "y": p_dblFromPointY + dblU * (p_dblToPointY - p_dblFromPointY)
		};
	};
		
		
	// <summary>
	// Intersection of 2 finite 2D segments
	// </summary>
	// <param name="p_dblFromX1">First Line first point X</param>
	// <param name="p_dblFromY1">First Line first point Y</param>
	// <param name="p_dblToX1">First Line second point X</param>
	// <param name="p_dblToY1">First Line second point Y</param>
	// <param name="p_dblFromX2">Second Line first point X</param>
	// <param name="p_dblFromY2">Second Line first point Y</param>
	// <param name="p_dblToX2">Second Line second point X</param>
	// <param name="p_dblToY2">Second Line second point Y</param>
	// <returns>True if intersect, false otherwise</returns>
		
	RelationalOp.isLinesIntersects = function(p_dblFromX1, p_dblFromY1, p_dblToX1, p_dblToY1,
									p_dblFromX2, p_dblFromY2, p_dblToX2, p_dblToY2)
	{
		var dblX1 = p_dblToX1 - p_dblFromX1; //u
		var dblY1 = p_dblToY1 - p_dblFromY1;
		var dblX2 = p_dblToX2 - p_dblFromX2;//v
		var dblY2 = p_dblToY2 - p_dblFromY2;
		var dblX3 = p_dblFromX1 - p_dblFromX2;//w
		var dblY3 = p_dblFromY1 - p_dblFromY2;
		
		var D = MeasurementSvc.perp(dblX1, dblY1, dblX2, dblY2);
		
		// test if they are parallel (includes either being a point)
		if (Math.abs(D) < 0.000000000001)
		{          // S1 and S2 are parallel
			if (MeasurementSvc.perp(dblX1, dblY1, dblX3, dblY3) != 0 || MeasurementSvc.perp(dblX2, dblY2, dblX3, dblY3) != 0)
			{
				return false;                   // they are NOT collinear
			}
			// they are collinear or degenerate
			// check if they are degenerate points
			var du = MeasurementSvc.dot(dblX1, dblY1, dblX2, dblY2);
			var dv = MeasurementSvc.dot(dblX2, dblY2, dblX2, dblY2);
			if (du == 0 && dv == 0)
			{           // both segments are points
				if (p_dblFromX1 != p_dblToX1 &&
					p_dblFromY1 != p_dblToY1)         // they are distinct points
				{
					return false;
				}
				else
				{
					return true;
				}
			}		
		
			if (du == 0)
			{                    // S1 is a single point
				if (RelationalOp.isPointOnLine(p_dblFromX1, p_dblFromY1, p_dblFromX2, p_dblFromY2, p_dblToX2, p_dblToY2, 0).result)  // but is not in S2
					return false;
				else
					return true;
			}
			if (dv == 0)
			{                    // S2 a single point
				if (RelationalOp.isPointOnLine(p_dblFromX2, p_dblFromY2, p_dblFromX1, p_dblFromY1, p_dblToX1, p_dblToY1, 0).result)  // but is not in S1
					return false;
				else
					return true;
			}
			// they are collinear segments - get overlap (or not)
			var t0, t1;                   // endpoints of S1 in eqn for S2
		
			var dblX4 = p_dblToX1 - p_dblFromX2;
			var dblY4 = p_dblToY1 - p_dblFromY2;
		
			if (dblX2 != 0)
			{
				t0 = dblX3 / dblX2;
				t1 = dblX4 / dblX2;
			}
			else
			{
				t0 = dblY3 / dblY2;
				t1 = dblY4 / dblY2;
			}
			if (t0 > t1)
			{                  // must have t0 smaller than t1
				var t = t0;
				t0 = t1;
				t1 = t;    // swap if not
			}
			if (t0 > 1 || t1 < 0)
			{
				return false;     // NO overlap
			}
			t0 = t0 < 0 ? 0 : t0;              // clip to min 0
			t1 = t1 > 1 ? 1 : t1;              // clip to max 1
			if (t0 == t1)
			{                 // intersect is a point            
				return true;
			}
		
			return true;
		}
		
		// the segments are skew and may intersect in a point
		// get the intersect parameter for S1
		var sI = MeasurementSvc.perp(dblX2, dblY2, dblX3, dblY3) / D;
		if (sI < 0 || sI > 1)               // no intersect with S1
			return false;
		
		// get the intersect parameter for S2
		var tI = MeasurementSvc.perp(dblX1, dblY1, dblX3, dblY3) / D;
		if (tI < 0 || tI > 1)               // no intersect with S2
			return false;
		
		return true;
	};
		
	// <summary>
	// Tests if two given rectangles intersect
	// </summary>
	// <param name="p_dblMinX1">1st rectangle MinX</param>
	// <param name="p_dblMinY1">1st rectangle MinY</param>
	// <param name="p_dblMaxX1">1st rectangle MaxX</param>
	// <param name="p_dblMaxY1">1st rectangle MaxY</param>
	// <param name="p_dblMinX2">2nd rectangle MinX</param>
	// <param name="p_dblMinY2">2nd rectangle MinY</param>
	// <param name="p_dblMaxX2">2nd rectangle MaxX</param>
	// <param name="p_dblMaxY2">2nd rectangle MaxY</param>
	// <returns>True if rectangles intersect</returns>
	RelationalOp.isRectanglesIntersected = function(p_dblMinX1, p_dblMinY1,
										p_dblMaxX1, p_dblMaxY1, 
										p_dblMinX2, p_dblMinY2,
										p_dblMaxX2, p_dblMaxY2)
	{
		var blnResult = true;
		
		if (p_dblMinX1 > p_dblMaxX2 ||
			p_dblMaxX1 < p_dblMinX2 ||
			p_dblMinY1 > p_dblMaxY2 ||
			p_dblMaxY1 < p_dblMinY2)
		{
			blnResult = false;
		}
		
		return blnResult;
	};
		
		
	// <summary>
	// Checking if the point is in the polygon
	// </summary>
	// <param name="p_objPoint">The point to check</param>
	// <param name="p_objPolygon">The polygon</param>
	// <returns>True if the point is in the polygon. otherwise, false.</returns>
	RelationalOp.isPointInPolygon = function(p_objPnt, p_arrPts)
	{
		var intIndex;
		var intInvertIndex;
		var blnInside = false;
		for (var intIndex = 0, intInvertIndex = p_arrPts.length - 1; intIndex < p_arrPts.length; intInvertIndex = intIndex++)
		{
			if (((p_arrPts[intIndex].y > p_objPnt.y) != (p_arrPts[intInvertIndex].y > p_objPnt.y)) &&
					(p_objPnt.x <
						(p_arrPts[intInvertIndex].x - p_arrPts[intIndex].x) *
						(p_objPnt.y - p_arrPts[intIndex].y) / (p_arrPts[intInvertIndex].y - p_arrPts[intIndex].y) + p_arrPts[intIndex].x))
				blnInside = !blnInside;
		}
		return blnInside;
	};
		
		
	// <summary>
	// Tests if the rectangle intersects the given polygon.
	// </summary>
	// <param name="p_objRect">Input rectangle</param>
	// <param name="p_objPolygon">Input Polygon</param>
	// <param name="p_blnIsTakeCareFullyContaining">Whether fully contained polygon is considered intersection</param>
	// <param name="p_blnCheckBoundsFirst">If true it will check intersection between the bounds of the polygon before</param>
	// <returns>True if the intersection exists</returns>
	RelationalOp.isRectangleIntersectsPolygon = function(p_dblXMin, p_dblYMin, p_dblXMax, p_dblYMax, p_arrPts, p_blnIsTakeCareFullyContaining, p_blnCheckBoundsFirst)
	{
		var intPointIndex = 0;
		var intNextPointIndex = 1;
		var blnIntersects = false;
			
		
		var blnIsRectIntersectsBounds = true;
		
		if (p_blnCheckBoundsFirst)
		{
			var objPolygonBoundBox = InfoSvc.getMultiPointBounds(p_arrPts, false).bounds;
			blnIsRectIntersectsBounds = RelationalOp.isRectanglesIntersected(p_dblXMin ,p_dblYMin, p_dblXMax, p_dblYMax,
									objPolygonBoundBox.x, objPolygonBoundBox.y, objPolygonBoundBox.getRight(), objPolygonBoundBox.getBottom());
		}
		
		if (blnIsRectIntersectsBounds)
		{
			while (intNextPointIndex < p_arrPts.length && !blnIntersects)
			{
				// Checking if the top line is intersects current polygon line
				blnIntersects = RelationalOp.isLinesIntersects(p_dblXMin, p_dblYMax,
						p_dblXMax, p_dblYMax,
												p_arrPts[intPointIndex].x,p_arrPts[intPointIndex].y,
												p_arrPts[intNextPointIndex].x,p_arrPts[intNextPointIndex].y);
		
				if (blnIntersects)
				{
					return true;
				}
		
				// Checking if the bottom line is intersects current polygon line
				blnIntersects = RelationalOp.isLinesIntersects(p_dblXMin, p_dblYMin,
						p_dblXMax, p_dblYMin,
												p_arrPts[intPointIndex].x,p_arrPts[intPointIndex].y,
												p_arrPts[intNextPointIndex].x,p_arrPts[intNextPointIndex].y);
		
				if (blnIntersects)
				{
					return true;
				}
		
				// Checking if the left line is intersects current polygon line
				blnIntersects = RelationalOp.isLinesIntersects(p_dblXMin, p_dblYMin,
						p_dblXMin, p_dblYMax,
												p_arrPts[intPointIndex].x,p_arrPts[intPointIndex].y,
												p_arrPts[intNextPointIndex].x,p_arrPts[intNextPointIndex].y);
		
				if (blnIntersects)
				{
					return true;
				}
		
				// Checking if the right line is intersects current polygon line
				blnIntersects = RelationalOp.isLinesIntersects(p_dblXMax, p_dblYMin,
						p_dblXMax, p_dblYMax,
												p_arrPts[intPointIndex].x,p_arrPts[intPointIndex].y,
												p_arrPts[intNextPointIndex].x,p_arrPts[intNextPointIndex].y);
				if (blnIntersects)
				{
					return true;
				}
		
				++intPointIndex;
				++intNextPointIndex;
			}
		
			if (!blnIntersects && p_blnIsTakeCareFullyContaining)
			{
				var blnisPointInPolygon = RelationalOp.isPointInPolygon({ x: p_dblXMax, y: p_dblYMin }, p_arrPts);
				if (blnisPointInPolygon)
				{
					blnIntersects = true;
				}
				else
				{
					var blnIsointInrect = RelationalOp.isPointInRectangle(p_arrPts[0].x,p_arrPts[0].y,
							p_dblXMin,p_dblYMin,p_dblXMax,p_dblYMax);
					if(blnIsointInrect)
					{
						blnIntersects = true;
					}
				}
			}
		}
		
		return blnIntersects;
	};
			
	// <summary>
	// Returns a point on a given polyline at a given length from the start
	// </summary>
	// <param name="p_arrPoints">Input polyline as point array</param>
	// <param name="p_dblLength">Input length</param>
	// <p
	// <param name="p_blnIsClosed">Is the points are polygon (Close)</param>
	// <returns>The point</returns>
	RelationalOp.getPointOnPolyline = function(p_arrPoints, p_dblLength, p_blnIsFromEnd, p_blnIsClosed)
	{
		var p_intSegIndex = 0;
		if (p_arrPoints.length < 2)
		{
			return null;
		}
		
		var intFactor = 1;
		var intPointsCount = p_arrPoints.length;
			
		
		// Reversing the operation
		if (p_blnIsFromEnd)
		{
			intFactor = -1;
		
			if (!p_blnIsClosed)
			{
				p_intSegIndex = intPointsCount - 1;
			}
		}
		
		var intNextPntIndex = (intPointsCount + p_intSegIndex + intFactor) % intPointsCount;
		
		var dblCurrSegLength = MeasurementSvc.distance(p_arrPoints[p_intSegIndex].x, p_arrPoints[p_intSegIndex].y, p_arrPoints[intNextPntIndex].x, p_arrPoints[intNextPntIndex].y);
		
		var dblCurrTotalLength = 0;
		var intCurrPtCount = 0;
		
		// Jumping over segments and locating the segment which the 
		// wanted length (Point2D) end
		while (dblCurrTotalLength + dblCurrSegLength < p_dblLength && intCurrPtCount < intPointsCount)
		{
			dblCurrTotalLength += dblCurrSegLength;
		
			p_intSegIndex = intNextPntIndex;
			intNextPntIndex = (intPointsCount + p_intSegIndex + intFactor) % intPointsCount;
				
			dblCurrSegLength = MeasurementSvc.distance(p_arrPoints[p_intSegIndex].x, p_arrPoints[p_intSegIndex].y, p_arrPoints[intNextPntIndex].x, p_arrPoints[intNextPntIndex].y);
		
			++intCurrPtCount;
		}
		
		// What is the rest of the length on this segment
		var dblLengthLeft = p_dblLength - dblCurrTotalLength;
		
		if (dblLengthLeft < 0)
		{
			return null;
		}
		
		intNextPntIndex = (intPointsCount + p_intSegIndex + intFactor) % intPointsCount;
		
		var objRetVal = RelationalOp.getPointOnLine(
			p_arrPoints[p_intSegIndex],
			p_arrPoints[intNextPntIndex],
			dblLengthLeft);
		
		// Segment index is from the first point of the segment. when we run from the end to the beginning we need to decrease it
		// so it will have the first point of the segment and not the second.
		if (p_blnIsFromEnd)
		{
			p_intSegIndex = intNextPntIndex;
		}
			
		return [objRetVal, p_intSegIndex];
	};
		
		
	// <summary>
	// Returns a point on a line at a given distance from the line start
	// </summary>
	// <param name="p_objFirstPoint">Line's first point</param>
	// <param name="p_objSecPoint">Line's second point</param>
	// <param name="p_dblDistance">Input distance</param>
	// <returns>The point</returns>
	RelationalOp.getPointOnLine = function(p_objFirstPoint, p_objSecPoint, p_dblDistance)
	{
		if (p_dblDistance == 0)
		{
			return [p_objFirstPoint.x,p_objFirstPoint.y];
		}
		
		var dblRadAngle = MeasurementSvc.getAngle(p_objFirstPoint.x, p_objFirstPoint.y, p_objSecPoint.x, p_objSecPoint.y);
		
		var dblDegAngle = dblRadAngle * (180 / Math.PI); 
			
		dblRadAngle = dblRadAngle - (Math.PI / 2);
		
		var dblCalcedX = p_objFirstPoint.x + p_dblDistance * Math.cos(dblRadAngle);
		var dblCalcedY = p_objFirstPoint.y - p_dblDistance * Math.sin(dblRadAngle);
		
		return { 'x':dblCalcedX, 'y':dblCalcedY };
	};
		
	RelationalOp.getPolylineLength = function(p_arrPoints, p_blnAsPolygon)
	{
		var dblLength = 0;
		for (var intCurrIdx = 0; intCurrIdx < p_arrPoints.length - 1; intCurrIdx++)
		{
		    dblLength += MeasurementSvc.distance(p_arrPoints[intCurrIdx].x, p_arrPoints[intCurrIdx].y, p_arrPoints[intCurrIdx + 1].x, p_arrPoints[intCurrIdx + 1].y);
		}
		
		if (p_blnAsPolygon && p_arrPoints.length > 0)
		{
		    dblLength += MeasurementSvc.distance(p_arrPoints[p_arrPoints.length - 1].x, p_arrPoints[p_arrPoints.length - 1].y, p_arrPoints[0].x, p_arrPoints[0].y);
		}
		
		return dblLength;
	};
		
	RelationalOp.getPointOnPolylineRatio = function(p_arrPoints, p_dblRatio)
	{
		var dblLength = RelationalOp.getPolylineLength(p_arrPoints);
		
		dblLength *= p_dblRatio;
		
		return RelationalOp.getPointOnPolyline(p_arrPoints, dblLength, false, false);
	};
		
	// <summary>
	// The function test if input's line and polygon has intersection.
	// </summary>
	// <param name="p_objPolyline">Input line.</param>
	// <param name="p_objPolygon">Input polygon.</param>
	// <param name="p_blnCheckBoundFirst">if true - Bounding intersection will be checked first</param>
	// <param name="p_blnIncludeFullContaining">Indicates if the case of full line containing will return true.</param>
	// <returns>True if any intersection exists.</returns>
	RelationalOp.isPolylineIntersectsPolygon = function(p_arrPolylinePts, p_arrPolygonPts, p_blnCheckBoundFirst, p_blnIncludeFullContaining)
	{
		var intPointIndex;
		var intNextPointIndex;
		var blnIntersects = false;	
		var objFromPoint;
		var objToPoint;
		
		var blnIsBoundsIntersected = true;
		
		if (p_blnCheckBoundFirst)
		{
			var objSourceBoundBox = InfoSvc.getMultiPointBounds(p_arrPolylinePts, false).bounds;
			var objQuereBoundBox = InfoSvc.getMultiPointBounds(p_arrPolygonPts, false).bounds;
			blnIsBoundsIntersected = RelationalOp.isRectanglesIntersected(objSourceBoundBox.x, objSourceBoundBox.y,
					objSourceBoundBox.getRight(), objSourceBoundBox.getBottom(), objQuereBoundBox.x,
					objQuereBoundBox.y, objQuereBoundBox.getRight(), objQuereBoundBox.getBottom());
		}
		
		if (blnIsBoundsIntersected)
		{
			for (var intLineIndex = 0; intLineIndex < p_arrPolylinePts.length - 1; intLineIndex++)
			{
				intPointIndex = 0;
				intNextPointIndex = 1;
		
				objFromPoint = p_arrPolylinePts[intLineIndex];
				objToPoint = p_arrPolylinePts[intLineIndex + 1];
				while (intNextPointIndex < p_arrPolygonPts.length && !blnIntersects)
				{
					// Checking if the line is intersects current polygon line
					blnIntersects = RelationalOp.isLinesIntersects(objFromPoint.x,objFromPoint.y,
						objToPoint.x, objToPoint.y,
						p_arrPolygonPts[intPointIndex].x,p_arrPolygonPts[intPointIndex].y,
						p_arrPolygonPts[intNextPointIndex].x,p_arrPolygonPts[intNextPointIndex].y);
		
					if (blnIntersects)
					{
						return true;
					}
					++intPointIndex;
					++intNextPointIndex;
				}
		
				if (!blnIntersects)
				{
					// Check the last polygon's line
					blnIntersects = RelationalOp.isLinesIntersects(objFromPoint.x,objFromPoint.y,
															objToPoint.x,objToPoint.y,
															p_arrPolygonPts[p_arrPolygonPts.length - 1].x, p_arrPolygonPts[p_arrPolygonPts.length - 1].y,
															p_arrPolygonPts[0].x,p_arrPolygonPts[0].y);
				}
		
				if (blnIntersects)
				{
					return true;
				}
		
			}
		
			if (!blnIntersects && p_blnIncludeFullContaining)
			{
				if (RelationalOp.isPointInPolygon(p_arrPolylinePts[0], p_arrPolygonPts))
				{
					blnIntersects = true;
				}
			}
		}
		
		return blnIntersects;
	};
		
		
	// <summary>
	// Tests if a given polyline intersects or is contained by the rectangle
	// </summary>
	// <param name="p_objPolyline">Intersecting polyline as an array of points</param>
	// <param name="p_objRect">The rectangle</param>
	// <param name="p_blnIncludeFullContaining"></param>
	// <returns>True if the polyline intersects or contained by the rectangle</returns>
	RelationalOp.isPolylineIntersectsRectangle = function(p_arrPts, p_dblXMin, p_dblYMin, p_dblXMax, p_dblYMax, p_blnIncludeFullContaining)
	{
		var arrRectPolygon = [{ "x": p_dblXMin, "y": p_dblYMax }, { "x": p_dblXMax, "y": p_dblYMax },
			                    { "x": p_dblXMax,"y" : p_dblYMin}, { "x": p_dblXMin,"y" :p_dblYMin} ];
		
		return RelationalOp.isPolylineIntersectsPolygon(p_arrPts,
												arrRectPolygon, 
												true, 
												p_blnIncludeFullContaining);
	};
		
	RelationalOp.isRectangleIntersectsEllipse = function(p_dblMinX, p_dblMinY,
									            p_dblMaxX, p_dblMaxY,
									            p_dblEllipseCenterX, p_dblEllipseCenterY,
									            p_dblEllipseXRadius, p_dblEllipseYRadius,
									            p_dblEllipseAngle,
									            p_blnCheckBounds)
    {
		p_blnCheckBounds = p_blnCheckBounds != null ? p_blnCheckBounds : true;
		var blnIsRectIntersects = true;

		// Not checking for rotated ellipse
		if (p_blnCheckBounds && p_dblEllipseAngle == 0)
		{
			blnIsRectIntersects = RelationalOp.isRectanglesIntersected(p_dblMinX, p_dblMinY, p_dblMaxX, p_dblMaxY,
					p_dblEllipseCenterX - p_dblEllipseXRadius, p_dblEllipseCenterY - p_dblEllipseYRadius,
					p_dblEllipseCenterX + p_dblEllipseXRadius, p_dblEllipseCenterY + p_dblEllipseYRadius);
		}

		if (blnIsRectIntersects)
		{
			var objSeg1 = [{ "x": p_dblMinX, "y": p_dblMinY },{ "x": p_dblMaxX, "y": p_dblMinY } ];
			var objSeg2 = [objSeg1[1], { "x": p_dblMaxX, "y": p_dblMaxY } ];
			var objSeg3 = [objSeg2[1], { "x": p_dblMinX, "y": p_dblMaxY } ];
			var objSeg4 = [ objSeg3[1], objSeg1[0] ];

			if (this.isLineIntersectsEllipse(objSeg1, p_dblEllipseCenterX, p_dblEllipseCenterY, p_dblEllipseXRadius, p_dblEllipseYRadius, p_dblEllipseAngle, false) ||
					this.isLineIntersectsEllipse(objSeg2, p_dblEllipseCenterX, p_dblEllipseCenterY, p_dblEllipseXRadius, p_dblEllipseYRadius, p_dblEllipseAngle, false) ||
					this.isLineIntersectsEllipse(objSeg3, p_dblEllipseCenterX, p_dblEllipseCenterY, p_dblEllipseXRadius, p_dblEllipseYRadius, p_dblEllipseAngle, false) ||
					this.isLineIntersectsEllipse(objSeg4, p_dblEllipseCenterX, p_dblEllipseCenterY, p_dblEllipseXRadius, p_dblEllipseYRadius, p_dblEllipseAngle, false) ||
					this.isPointInRectangle(p_dblEllipseCenterX, p_dblEllipseCenterY, p_dblMinX, p_dblMinY, p_dblMaxX, p_dblMaxY) ||
					this.isPointInEllipse(p_dblMinX, p_dblMinY, p_dblEllipseCenterX, p_dblEllipseCenterY, p_dblEllipseXRadius, p_dblEllipseYRadius, p_dblEllipseAngle))
			{
				return true;
			}
		}

		return false;
};
		
	RelationalOp.isPointInEllipse = function(
                p_dblXPoint,
                p_dblYPoint,
                p_dblXEllipseCenter,
                p_dblYEllipseCenter,
                p_dblRadiusA,
                p_dblRadiusB,
                p_dblAngle)
            {
                return (InfoSvc.getDistancePointToEllipseByFormula(
                    p_dblXPoint,
                    p_dblYPoint,
                    p_dblXEllipseCenter,
                    p_dblYEllipseCenter,
                    p_dblRadiusA,
                    p_dblRadiusB,
                    p_dblAngle)
                    <= 1);
            };
	
	RelationalOp.isLineIntersectsEllipse = function(p_objPts,
            p_dblXEllipseCenter,
            p_dblYEllipseCenter,
            p_dblRadiusA,
            p_dblRadiusB,
            p_dblEllipseRotation,
            p_blnCheckBounds)
        {
		
			p_blnCheckBounds = p_blnCheckBounds || true;
            var blnResult = false;
       
            var objFromPoint;
            var objToPoint;

            var objQueryBoundBox = InfoSvc.getEllipseBoundBox(p_dblXEllipseCenter, p_dblYEllipseCenter,
                p_dblRadiusA, p_dblRadiusB, p_dblEllipseRotation);

            var blnBoundsIntersects = true;
            if (p_blnCheckBounds)
            {
                var objSourceBoundBox = InfoSvc.getMultiPointBounds(p_objPts, false).bounds;
                blnBoundsIntersects = RelationalOp.isRectanglesIntersected(objSourceBoundBox.x, objSourceBoundBox.y, objSourceBoundBox.getRight(), objSourceBoundBox.getBottom(), 
                		objQueryBoundBox.x, objQueryBoundBox.y, objQueryBoundBox.getRight(), objQueryBoundBox.getBottom());
            }

          
            var dblXMin, dblXMax, dblYMin, dblYMax;

            if (blnBoundsIntersects)
            {
                for (var intPointIndex = 0; intPointIndex < p_objPts.length - 1; intPointIndex++)
                {
                    objFromPoint = p_objPts[intPointIndex];
                    objToPoint = p_objPts[intPointIndex + 1];

                    dblXMin = Math.min(objFromPoint.x, objToPoint.x);
                    dblXMax = Math.max(objFromPoint.x, objToPoint.x);

                    dblYMin = Math.min(objFromPoint.y, objToPoint.y);
                    dblYMax = Math.max(objFromPoint.y, objToPoint.y);

                 
                    if (RelationalOp.isRectanglesIntersected(dblXMin, dblYMin, dblXMax,dblYMax,
                        objQueryBoundBox.x,
                        objQueryBoundBox.y,
                        objQueryBoundBox.getRight(),
                        objQueryBoundBox.getBottom()))
                    {
                        var blnIsFromPointInEllipse = RelationalOp.isPointInEllipse(objFromPoint.x,
                            objFromPoint.y, p_dblXEllipseCenter, p_dblYEllipseCenter, p_dblRadiusA, p_dblRadiusB, p_dblEllipseRotation);
                        if (blnIsFromPointInEllipse)
                        {
                            blnResult = true;
                            break;
                        }
                        else if (RelationalOp.isPointInEllipse(objToPoint.x,
                            objToPoint.y, p_dblXEllipseCenter, p_dblYEllipseCenter, p_dblRadiusA, p_dblRadiusB, p_dblEllipseRotation))
                        {
                            blnResult = true;
                            break;
                        }
                        else
                        {
                            //In case of same X we can't use the regular formula
                            if (objToPoint.x == objFromPoint.x)
                            {
                                // We calculate the intersections Y values with this X
                                var arrRetVal = InfoSvc.getEllipseY(p_dblRadiusA, p_dblRadiusB, p_dblXEllipseCenter, p_dblYEllipseCenter, -p_dblEllipseRotation, objFromPoint.x);
                                var dblY1 = arrRetVal [0];
                                var dblY2 = arrRetVal [1];

                                var dblLineBottomY = objFromPoint.y;
                                var dblLineTopY = objToPoint.y;
                                if (objToPoint.y < objFromPoint.y)
                                {
                                    dblLineTopY = objFromPoint.y;
                                    dblLineBottomY = objToPoint.y;
                                }

                                // Check if those Y's are between the Y's of the line
                                if ((dblY1 >= dblLineBottomY && dblY1 <= dblLineTopY) ||
                                    (dblY2 >= dblLineBottomY && dblY2 <= dblLineTopY))
                                {
                                    blnResult = true;
                                }
                            }
                            else
                            {
                                var dblDeltaM = (objToPoint.y - objFromPoint.y) / (objToPoint.x - objFromPoint.x);

                                objFromPoint = dojo.clone(objFromPoint);
                                objToPoint = dojo.clone(objToPoint);
                                
                                objFromPoint.x -= p_dblXEllipseCenter;
                                objFromPoint.y -= p_dblYEllipseCenter;
                                objToPoint.x -= p_dblXEllipseCenter;
                                objToPoint.y -= p_dblYEllipseCenter;

                                var dblTempA, dblTempB, dblTempC;
                                var arrRetVal = InfoSvc.getEllipseImplicitParametrs(p_dblXEllipseCenter,
                                                            p_dblYEllipseCenter,
                                                            p_dblRadiusA,
                                                            p_dblRadiusB,
                                                            p_dblEllipseRotation);
                                dblTempA = arrRetVal[0];
                                dblTempB = arrRetVal[1];
                                dblTempC = arrRetVal[2];
                                
                                var dblF = objFromPoint.y - dblDeltaM * objFromPoint.x;

                                var dblA = dblTempA + dblTempB * dblDeltaM + dblTempC * dblDeltaM * dblDeltaM;
                                var dblB = dblTempB * dblF + 2 * dblTempC * dblDeltaM * dblF;
                                var dblC = dblTempC * dblF * dblF - 1;

                                if ((dblB * dblB) >= (4 * dblA * dblC))
                                {
                                	var dblSQRT = Math.sqrt(dblB * dblB - 4 * dblA * dblC);

                                    // Trying to get the other point +dblSQRT
                                    var dblResultX = (-dblB + dblSQRT) / (2 * dblA);
                                    var dblResultY = dblDeltaM * dblResultX + dblF;

                                    // Trying to get the other point -dblSQRT
                                    var dblResultX2 = (-dblB - dblSQRT) / (2 * dblA);
                                    var dblResultY2 = dblDeltaM * dblResultX2 + dblF;

                                    var dblRealDistance;
                                    if (RelationalOp.isPointOnLine(dblResultX, dblResultY, objFromPoint.x, objFromPoint.y,
                                                      objToPoint.x, objToPoint.y, RelationalOp.tolerance).result ||
                                                      RelationalOp.isPointOnLine(dblResultX2, dblResultY2, objFromPoint.x, objFromPoint.y,
                                                      objToPoint.x, objToPoint.y, RelationalOp.tolerance).result)
                                    {
                                        blnResult = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return blnResult;
        }
	
    /// <summary>
    /// The function test if source and query has intersection.
    /// </summary>
    /// <param name="p_objSourcePolygon">Source polygon.</param>
    /// <param name="p_objQueryPolygon">Query polygon.</param>
    /// <param name="p_blnIncludeFullContaining">Indicates if the case of full polygon's containing will return true.</param>
    /// <returns>True if any intersection exists.</returns>
	RelationalOp.isPolygonsIntersect = function (p_objSourcePolygon, p_objQueryPolygon, p_blnIncludeFullContaining, p_blnCheckBounds, params)
	{
	    var blnIntersects = false;

	    var objTempPoint;

	    params = params || {};

	    var objSourceBoundBox;
	    var objQuereBoundBox;

	    if (p_blnCheckBounds) {
	        objSourceBoundBox = params.sourceBounds || InfoSvc.getMultiPointBounds(p_objSourcePolygon, false).bounds;
	        objQuereBoundBox = params.QueryBounds || InfoSvc.getMultiPointBounds(p_objQueryPolygon, false).bounds;
	    }

	    if (!p_blnCheckBounds || RelationalOp.isRectanglesIntersected(objSourceBoundBox, objQuereBoundBox))
	    {
	        for (var intPointIndex = 0; intPointIndex < p_objSourcePolygon.length - 1; intPointIndex++)
	        {
	            if (RelationalOp.isLineIntersectsPolygon(p_objSourcePolygon[intPointIndex], p_objSourcePolygon[intPointIndex + 1], p_objQueryPolygon, false))
	            {
	                blnIntersects = true;
	                break;
	            }
	        }
	        if (!blnIntersects && RelationalOp.isLineIntersectsPolygon(p_objSourcePolygon[p_objSourcePolygon.length - 1], p_objSourcePolygon[0], p_objQueryPolygon, false))
	        {
	            blnIntersects = true;
	        }
	        if (!blnIntersects && p_blnIncludeFullContaining)
	        {
	            if (RelationalOp.isPointInPolygon(p_objSourcePolygon[0], p_objQueryPolygon) ||
                    RelationalOp.isPointInPolygon(p_objQueryPolygon[0], p_objSourcePolygon))
	            {
	                blnIntersects = true;
	            }
	        }
	    }

	    return blnIntersects;
	}

    /// <summary>
    /// Tests if a given line intersects or is contained by the polygon
    /// </summary>
    /// <param name="p_objFromPoint">From point of the query line.</param>
    /// <param name="p_objToPoint">To point of the query line.</param>
    /// <param name="p_objPolygon">Input polygon.</param>
    /// <param name="p_blnIncludeFullContaining">Indicates if the answer will test if the line fully contained in the polygon. </param>
    /// <returns>True if the line intersects or contained by the polygon.</returns>
	RelationalOp.isLineIntersectsPolygon = function(p_objFromPoint, p_objToPoint, p_objPolygon, p_blnIncludeFullContaining)
	{
	    return RelationalOp.isPolylineIntersectsPolygon([p_objFromPoint, p_objToPoint],
                                                p_objPolygon,
                                                false,
                                                p_blnIncludeFullContaining);
        }


	return RelationalOp;
});

