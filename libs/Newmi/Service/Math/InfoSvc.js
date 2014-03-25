define(["dojo/_base/declare",
    "NeWMI/Service/Math/ConversionsSvc",
    "NeWMI/Service/Math/MeasurementSvc",
    "NeWMI/Draw/Types/Rect"],
		function(declare, 
				ConversionsSvc, 
				MeasurementSvc,
                Rect) {
	
	var InfoSvc = declare("NeWMI.Service.Math.InfoSvc", null, {});

	InfoSvc.getDistancePointToEllipseByFormula = function(
							p_dblXPoint,
				            p_dblYPoint,
				            p_dblXEllipseCenter,
				            p_dblYEllipseCenter,
				            p_dblRadiusA,
				            p_dblRadiusB,
				            p_dblAngle)
	{
		// Ellipse formula
        var dblX = p_dblXEllipseCenter - p_dblXPoint;
        var dblY = p_dblYEllipseCenter - p_dblYPoint;
        var dblSinBeta = Math.sin(-p_dblAngle);
        var dblCosBeta = Math.cos(-p_dblAngle);
        var objDistance = Math.pow((dblX * dblCosBeta + dblY * dblSinBeta) / p_dblRadiusA, 2) +
                    	  Math.pow((-dblX * dblSinBeta + dblY * dblCosBeta) / p_dblRadiusB, 2);

        return objDistance;
	};
	
	InfoSvc.getPointOnEllipseByAngle = function(p_dblEllipseCenterX,
            p_dblEllipseCenterY,
            p_dblRadiusX,
            p_dblRadiusY,
            p_dblEllipseRotationAngle,
            p_dblPointAngle)
        {
            
            var dblSinBeta = Math.sin(-p_dblEllipseRotationAngle);
            var dblCosBeta = Math.cos(-p_dblEllipseRotationAngle);
            var dblSinAlpha = Math.sin(p_dblPointAngle);
            var dblCosAlpha = Math.cos(p_dblPointAngle);

            var objResult = {"x": p_dblEllipseCenterX + (p_dblRadiusX * dblCosAlpha * dblCosBeta - p_dblRadiusY * dblSinAlpha * dblSinBeta),
            		    "y": p_dblEllipseCenterY + (p_dblRadiusX * dblCosAlpha * dblSinBeta + p_dblRadiusY * dblSinAlpha * dblCosBeta)};

            return objResult;
        };
	
	/// <summary>
    /// Calculates Bounding box for a given ellipse
    /// </summary>
    /// <param name="p_dblXEllipseCenter">The x coordinates of the ellipse's center</param>
    /// <param name="p_dblYEllipseCenter">The y coordinates of the ellipse's center</param>
    /// <param name="p_dblRadiusA">The horizontal radius of the ellipse</param>
    /// <param name="p_dblRadiusB">The vertical radius of the ellipse</param>
    /// <param name="p_dblEllipseRotationAngle">The angle of the ellipse in Radians. The direction of the rotation is clockwise</param>
	InfoSvc.getEllipseBoundBox = function (p_dblXEllipseCenter,
       p_dblYEllipseCenter,
       p_dblRadiusA,
       p_dblRadiusB,
       p_dblEllipseRotationAngle)
    {		
		var halfWidth, halfHeight;

        if (p_dblEllipseRotationAngle == 0)
        {
            halfWidth = p_dblRadiusA;
            halfHeight = p_dblRadiusB;            
        }
        else
        {
            var ux = p_dblRadiusA * Math.cos(p_dblEllipseRotationAngle);
            var uy = p_dblRadiusA * Math.sin(p_dblEllipseRotationAngle);
            var vx = p_dblRadiusB * Math.cos(p_dblEllipseRotationAngle + (Math.PI / 2));
            var vy = p_dblRadiusB * Math.sin(p_dblEllipseRotationAngle + (Math.PI / 2));

            halfWidth = Math.sqrt(ux * ux + vx * vx);
            halfHeight = Math.sqrt(uy * uy + vy * vy);
        }
        
        return new Rect(p_dblXEllipseCenter - halfWidth,
            p_dblYEllipseCenter - halfHeight,
            halfWidth * 2,
            halfHeight * 2);
    };
    
    InfoSvc.getEllipseY = function (p_dblRadiusX,
            p_dblRadiusY,
            p_dblXCenter,
            p_dblYCenter,
            p_dblEllipseAngle,
            p_dblXValue)
        {
            p_dblTopIntersection = -Number.MinValue;
            p_dblBottomIntersection = -Number.MinValue;

            p_dblXValue -= p_dblXCenter;

            var dblSinBeta = Math.sin(p_dblEllipseAngle);
            var dblCosBeta = Math.cos(p_dblEllipseAngle);

            var a = p_dblRadiusX;
            var b = p_dblRadiusY;
            var z = dblSinBeta;
            var t = dblCosBeta;
            var r = p_dblXValue * t;
            var l = p_dblXValue * z;

            var A = b * b * z * z + a * a * t * t;
            var B = 2 * (b * b * z * r - a * a * t * l);
            var C = b * b * r * r + a * a * l * l - a * a * b * b;

            var dblY = p_dblYCenter;

            if (A != 0)
            {
                p_dblBottomIntersection = ((-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A)) + p_dblYCenter;
                p_dblTopIntersection = ((-B - Math.sqrt(B * B - 4 * A * C)) / (2 * A)) + p_dblYCenter;
            }
            
            return [p_dblTopIntersection, p_dblBottomIntersection];
        };
        
        InfoSvc.getEllipseImplicitParametrs = function (p_dblXEllipseCenter,
                p_dblYEllipseCenter,
                p_dblRadiusA,
                p_dblRadiusB,
                p_dblEllipseRotationAngle)
        {

            //Internal calculation uses counterclockwise direction.
            //p_dblEllipseRotationAngle = 2 * Math.PI - p_dblEllipseRotationAngle;

            if (p_dblEllipseRotationAngle < 0)
            {
                p_dblEllipseRotationAngle += 2 * Math.PI;
            }

            var dblCos = Math.cos(p_dblEllipseRotationAngle);
            var dblSin = Math.sin(p_dblEllipseRotationAngle);

            dblA = (Math.pow(dblCos, 2) / (p_dblRadiusA * p_dblRadiusA)) + (Math.pow(dblSin, 2) / (p_dblRadiusB * p_dblRadiusB));
            dblB = -2 * dblCos * dblSin * (1 / (p_dblRadiusA * p_dblRadiusA) - 1 / (p_dblRadiusB * p_dblRadiusB));
            dblC = (Math.pow(dblSin, 2) / (p_dblRadiusA * p_dblRadiusA)) + (Math.pow(dblCos, 2) / (p_dblRadiusB * p_dblRadiusB));

            return [dblA, dblB, dblC];
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
        InfoSvc.getClosestPointOnLineFromPoint = function(p_dblPointX, p_dblPointY,
            p_dblFromPointX, p_dblFromPointY,
            p_dblToPointX, p_dblToPointY)
        {
            //check if From and To points are same point
            if (p_dblFromPointX == p_dblToPointX && p_dblFromPointY == p_dblToPointY)
            {
                return { x: p_dblFromPointX, y: p_dblFromPointY };
            }
            try
            {
                var dblU = ((p_dblPointX - p_dblFromPointX) * (p_dblToPointX - p_dblFromPointX) + (p_dblPointY - p_dblFromPointY) * (p_dblToPointY - p_dblFromPointY)) / (Math.pow((p_dblToPointX - p_dblFromPointX), 2) + Math.pow((p_dblToPointY - p_dblFromPointY), 2));

                return { x: (p_dblFromPointX + dblU * (p_dblToPointX - p_dblFromPointX)),
                         y: p_dblFromPointY + dblU * (p_dblToPointY - p_dblFromPointY) };
            }
            catch (ex)
            {
            }
            
            return null;
        }

        /// <summary>
        /// Returns the closest point on an ellipse to a reference point
        /// </summary>
        /// <param name="p_dblXPoint">The point to check</param>
        /// <param name="p_dblYPoint">The point to check</param>
        /// <param name="p_dblXEllipseCenter">The ellipse center</param>
        /// <param name="p_dblYEllipseCenter">The ellipse center</param>
        /// <param name="p_dblRadiusA">The ellipse first radius</param>
        /// <param name="p_dblRadiusB">The ellipse second radius</param>
        /// <param name="p_intAngle">Ellipse rotation angle</param>
        /// <param name="p_dblDistanceToEllipse">OUT - The distance from the ellipse boundary to the point</param>
        /// <returns>The closest point on the ellipse</returns>
        InfoSvc.getClosestPointToEllipse = function(p_dblXPoint,
                                      p_dblYPoint,
                                      p_dblXEllipseCenter,
                                      p_dblYEllipseCenter,
                                      p_dblRadiusA,
                                      p_dblRadiusB,
                                      p_dblAngle)
        {
            // Moving the line to the axis - because the ellipse is centered in the axis
            var objLinePointA = { "x" : p_dblXPoint - p_dblXEllipseCenter,
                "y" : p_dblYPoint - p_dblYEllipseCenter};

            // Calculating the slope of the line
            var dblLineA = (objLinePointA.y) / (objLinePointA.x);

            // Helpers
            var dblCos = Math.cos(p_dblAngle);
            var dblSin = Math.sin(p_dblAngle);

            // Using ellipse formula centered at (0,0) 
            // http://www.maa.org/joma/Volume8/Kalman/General.html
            var dblEllipseA = (dblCos * dblCos) / (p_dblRadiusA * p_dblRadiusA) +
                                 (dblSin * dblSin) / (p_dblRadiusB * p_dblRadiusB);
            var dblEllipseB = 2 * dblCos * dblSin * (1 / (p_dblRadiusA * p_dblRadiusA) - 1 / (p_dblRadiusB * p_dblRadiusB)) * dblLineA;
            var dblEllipseC = dblLineA * dblLineA * ((dblSin * dblSin) / (p_dblRadiusA * p_dblRadiusA) + (dblCos * dblCos) / (p_dblRadiusB * p_dblRadiusB));

            var dblEllipsePow2X = 1 / (dblEllipseA - dblEllipseB + dblEllipseC);
            var dblEllipseX1 = Math.sqrt(dblEllipsePow2X);
            var dblEllipseX2 = -dblEllipseX1;

            var dblEllipseY1 = dblLineA * dblEllipseX1;
            var dblEllipseY2 = dblLineA * dblEllipseX2;

            var objFirstPoint = {
                "x": dblEllipseX1 + p_dblXEllipseCenter,
                "y": dblEllipseY1 + p_dblYEllipseCenter
            };
            var objSecondPoint = {
                "x": dblEllipseX2 + p_dblXEllipseCenter,
                "y": dblEllipseY2 + p_dblYEllipseCenter
            };

            // Returning the shorter distance point
            var dblDistanceFromFirst = MeasurementSvc.distance(objFirstPoint.x, objFirstPoint.y, p_dblXPoint, p_dblYPoint);
            var dblDistanceFromSecond = MeasurementSvc.distance(objSecondPoint.x, objSecondPoint.y, p_dblXPoint, p_dblYPoint);

            var objPoint = objSecondPoint;
            var dblDistance = dblDistanceFromSecond;
            if (dblDistanceFromFirst < dblDistanceFromSecond)
            {
            	objPoint = objFirstPoint;
            	dblDistance = dblDistanceFromFirst;
            }
            
            return { point : objPoint, distance : dblDistance};
        };
        
        InfoSvc.calcCentroid = function(p_objMultiPoint)
		{
		
			var dblSumA = 0;
			var dblSumX = 0;
			var dblSumY = 0;
		
		    for (var intCurrPointIdx = 0; intCurrPointIdx < p_objMultiPoint.length; intCurrPointIdx++)
		    {       
		    	var intNextPointIdx = (intCurrPointIdx + 1) % p_objMultiPoint.length;
		
		        // Centroid formula
				var dblCurrArea = p_objMultiPoint[intCurrPointIdx].x * p_objMultiPoint[intNextPointIdx].y -
		                  p_objMultiPoint[intNextPointIdx].x * p_objMultiPoint[intCurrPointIdx].y;
		        dblSumA += dblCurrArea / 2;
		        dblSumX += ((p_objMultiPoint[intCurrPointIdx].x + p_objMultiPoint[intNextPointIdx].x) *
		                    dblCurrArea) / 6;
		        dblSumY += ((p_objMultiPoint[intCurrPointIdx].y + p_objMultiPoint[intNextPointIdx].y) *
		                  dblCurrArea) / 6;
		    }
			
		    var A = dblSumA;
		    var X = dblSumX / A;
		    var Y = dblSumY / A;
				   		    
		    return { x: X, y: Y };
		};
		
     // <summary>
		// The function returns the bounding box of the polygon and calculates the centroid of the polygon.
		// </summary>
		// <param name="p_objMultiPoint">MultiPoint array</param>
		// <param name="blnCalculateCentroid">If true, a centroid will be calculated</param>
		// <param name="p_objCentroid">The calculated centroid</param>
		// <returns>The bounding box</returns>
		InfoSvc.getMultiPointBounds = function(p_arrPts,
										 blnCalculateCentroid)
		{
		    var objResult = {};

			var dblRight = -Number.MAX_VALUE;
			var dblTop = -Number.MAX_VALUE;
			var dblLeft = Number.MAX_VALUE;
			var dblBottom = Number.MAX_VALUE;
		
		
			var dblSumA = 0;
			var dblSumX = 0;
			var dblSumY = 0;
		
			for (var intCurrPointIdx = 0;
				intCurrPointIdx < p_arrPts.length;
				intCurrPointIdx++)
			{
				//#region Centroid
		
				if (blnCalculateCentroid == true)
				{
					var intNextPointIdx = (intCurrPointIdx + 1) % p_arrPts.length;
		
					// Centroid formula
					var dblCurrArea = p_arrPts[intCurrPointIdx].x * p_arrPts[intNextPointIdx].y -
							  p_arrPts[intNextPointIdx].x * p_arrPts[intCurrPointIdx].y;
					dblSumA += dblCurrArea / 2;
					dblSumX += ((p_arrPts[intCurrPointIdx].x + p_arrPts[intNextPointIdx].x) *
								dblCurrArea) / 6;
					dblSumY += ((p_arrPts[intCurrPointIdx].y + p_arrPts[intNextPointIdx].y) *
							  dblCurrArea) / 6;
				}
				//#endregion
		
				//#region Cheking for the limits points
		
				if (dblRight < p_arrPts[intCurrPointIdx].x)
				{
					dblRight = p_arrPts[intCurrPointIdx].x;
				}
				if (dblLeft > p_arrPts[intCurrPointIdx].x)
				{
					dblLeft = p_arrPts[intCurrPointIdx].x;
				}
		
				if (dblTop < p_arrPts[intCurrPointIdx].y)
				{
					dblTop = p_arrPts[intCurrPointIdx].y;
				}
				if (dblBottom > p_arrPts[intCurrPointIdx].y)
				{
					dblBottom = p_arrPts[intCurrPointIdx].y;
				}
		
				//#endregion
			}
					
			var objCentroid = null;
			
			if (blnCalculateCentroid)
			{
				var A = dblSumA;
				var X = dblSumX / (A);
				var Y = dblSumY / (A);
		
				objResult.centroid = { x: X, y: Y };
			}
		
			objResult.bounds = new Rect(dblLeft,
                                        dblBottom,
                                        dblRight - dblLeft,
                                        dblTop - dblBottom);
			
			return objResult;
		};
		
		InfoSvc.getPointAfterRotation = function(p_objBasePoint, p_objSourcePoint, p_dblRotationAngleInDegree)
		{
			var dblRadius;
			var dblCurrentAngle;
			var dblNewAngle;
			var dblRotationRadians;
			var objRotatedPoint;
			try
			{
				dblRotationRadians = p_dblRotationAngleInDegree;
				
				//get distance from origin to source point   
				dblRadius = MeasurementSvc.distance(p_objBasePoint.x, p_objBasePoint.y, p_objSourcePoint.x, p_objSourcePoint.y);
				//get current angle of orientation   
				dblCurrentAngle = MeasurementSvc.getAngle(p_objBasePoint.x, p_objBasePoint.y, p_objSourcePoint.x, p_objSourcePoint.y);

				// add rotation value to theta to get new angle of orientation   
				dblNewAngle = (dblCurrentAngle - dblRotationRadians);

				//return new point   
				objRotatedPoint = {
				    "x": p_objBasePoint.x + dblRadius * Math.cos(dblNewAngle),
				    "y": p_objBasePoint.y - dblRadius * Math.sin(dblNewAngle)
				};

				return objRotatedPoint;
			}
			catch (e)
			{
				return p_objSourcePoint;
			}
		};
		
		 /// <summary>
        /// Returns a point on a given polyline according to the ratio from its length
        /// </summary>
        /// <param name="p_arrPoints">Input polyline</param>
        /// <param name="p_dblRatio">The ratio. Must be between 0 and 1</param>
        /// <param name="p_intSegIndex">Out - The segment which the return point is on</param>
        /// <returns>The point on the polyline</returns>
        InfoSvc.getPointOnPolylineRatio = function (p_arrPoints, p_dblRatio)
        {
            var dblLength = this.getPolylineLength(p_arrPoints);

            dblLength *= p_dblRatio;

            return this.getPointOnPolyline(p_arrPoints, dblLength, false, false);
        };
        
      /// <summary>
        /// Returns a polyline length
        /// </summary>
        /// <param name="p_arrPoints">Input polyline as points array</param>
        /// <param name="p_blnAsPolygon">If true, the length will include the segment between the last point to the first</param>
        /// <returns>Polyline length</returns>
        InfoSvc.getPolylineLength = function (p_arrPoints, p_blnAsPolygon)
        {
        	p_blnAsPolygon = p_blnAsPolygon || false;
        	
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
        }

        /// <summary>
        /// Returns a point on a given polyline at a given length from the start
        /// </summary>
        /// <param name="p_arrPoints">Input polyline as point array</param>
        /// <param name="p_dblLength">Input length</param>
        /// <p
        /// <param name="p_blnIsClosed">Is the points are polygon (Close)</param>
        /// <returns>The point</returns>
        InfoSvc.getPointOnPolyline = function(p_arrPoints, p_dblLength, p_blnIsFromEnd, p_blnIsClosed)
        {
        	var intSegIndex = 0;
            if (p_arrPoints.length < 2)
            {
                return {};
            }

            var intFactor = 1;
            var intPointsCount = p_arrPoints.length;

            // Reversing the operation
            if (p_blnIsFromEnd)
            {
                intFactor = -1;

                if (!p_blnIsClosed)
                {
                    intSegIndex = intPointsCount - 1;
                }
            }

            var intNextPntIndex = (intPointsCount + intSegIndex + intFactor) % intPointsCount;

            var dblCurrSegLength = MeasurementSvc.distance(p_arrPoints[intSegIndex].x, p_arrPoints[intSegIndex].y, p_arrPoints[intNextPntIndex].x, p_arrPoints[intNextPntIndex].y);

            var dblCurrTotalLength = 0;
            var intCurrPtCount = 0;

            // Jumping over segments and locating the segment which the 
            // wanted length (Point2D) end
            while (dblCurrTotalLength + dblCurrSegLength < p_dblLength && intCurrPtCount < intPointsCount)
            {
                dblCurrTotalLength += dblCurrSegLength;

                intSegIndex = intNextPntIndex;
                intNextPntIndex = (intPointsCount + intSegIndex + intFactor) % intPointsCount;
                
                dblCurrSegLength = MeasurementSvc.distance(p_arrPoints[intSegIndex].x, p_arrPoints[intSegIndex].y, p_arrPoints[intNextPntIndex].x, p_arrPoints[intNextPntIndex].y);

                ++intCurrPtCount;
            }

            // What is the rest of the length on this segment
            var dblLengthLeft = p_dblLength - dblCurrTotalLength;

            if (dblLengthLeft < 0)
            {
                return {};
            }

            intNextPntIndex = (intPointsCount + intSegIndex + intFactor) % intPointsCount;

            var objRetVal = this.getPointOnLine(
                p_arrPoints[intSegIndex],
                p_arrPoints[intNextPntIndex],
                dblLengthLeft);

            // Segment index is from the first point of the segment. when we run from the end to the beginning we need to decrease it
            // so it will have the first point of the segment and not the second.
            if (p_blnIsFromEnd)
            {
                intSegIndex = intNextPntIndex;
            }
            
            return { point : objRetVal, segmentIndex : intSegIndex };
        };

        /// <summary>
        /// Returns a point on a line at a given distance from the line start
        /// </summary>
        /// <param name="p_objFirstPoint">Line's first point</param>
        /// <param name="p_objSecPoint">Line's second point</param>
        /// <param name="p_dblDistance">Input distance</param>
        /// <returns>The point</returns>
        InfoSvc.getPointOnLine = function(p_objFirstPoint, p_objSecPoint, p_dblDistance)
        {
            if (p_dblDistance == 0)
            {
                return p_objFirstPoint;
            }

            var dblRadAngle = MeasurementSvc.getAngle(p_objFirstPoint.x, p_objFirstPoint.y, p_objSecPoint.x, p_objSecPoint.y);

            dblRadAngle = Math.PI / 2 - dblRadAngle;

            var dblCalcedX = p_objFirstPoint.x + p_dblDistance * Math.cos(dblRadAngle);
            var dblCalcedY = p_objFirstPoint.y + p_dblDistance * Math.sin(dblRadAngle);

            return { "x": dblCalcedX, "y": dblCalcedY };
        }

	
	return InfoSvc;
});