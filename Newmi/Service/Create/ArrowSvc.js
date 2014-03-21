define(["dojo/_base/declare", 
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Service/Math/RelationalOp"], 
        
        function(declare, MeasurementSvc, RelationalOp){
	
	var ArrowSvc = declare("NeWMI.Service.Create.ArrowSvc", null, {});

		/// <summary>
		/// Creating an arrow polyline from the parameters below
		/// </summary>
		/// <param name="p_objPolyline">The arrow body</param>
		/// <param name="p_enmArrowType">Arrow body type</param>
		/// <param name="p_dblArrowBodyExtension">The body extension in meters</param>
		/// <param name="p_dblArrowBodyWidth">The body width in meters</param>
		/// <param name="p_dblArrowHeadWidth">The head width in meters - Must be bigger than the body</param>
		/// <param name="p_dblArrowHeadHeight">The head height in meters.</param>
		/// <returns>The arrow as ESRI polyline</returns>
	ArrowSvc.CreateArrowBody = function(p_objPolyline,
		                                	p_enmArrowType,                                	
		                                	p_dblArrowBodyExtension,
		                                	p_dblArrowBodyWidth,
		                                	p_dblArrowHeadWidth,
		                                	p_dblArrowHeadHeight)
		                                	//,p_blnIsInMapUnits)
		{
		    var objTempPnt = null;
		    var objTempSecondPnt = null;
		    var objFromPoint = null;
		    var objMiddlePoint = null;
		    var objToPoint = null;
		    var objNewPoint = null;		   
		    var objBody = p_objPolyline.slice(0);
		    var objLeftSubBody = new Array();
		    var objRightSubBody = new Array();
		
		    if (p_enmArrowType == "ArrowLanePath")
		    {
		        p_dblArrowBodyExtension = 0;
		    }
		    else if (p_enmArrowType == "ArrowAxisPath")
		    {
		        p_dblArrowBodyWidth = 0;
		        p_dblArrowBodyExtension = 0;
		    }
		
		    
		
		    objTempPnt = objBody[Math.floor(objBody.length / 2)];
		
		    var dblArrowBodyExtension = p_dblArrowBodyExtension / 2;
		    var dblArrowBodyWidht = p_dblArrowBodyWidth / 2;
			var dblArrowHeadWidth = p_dblArrowHeadWidth / 2;
			var dblArrowHeadHeight = p_dblArrowHeadHeight;
			
			//We suppose to get the width and height in map units.
		    /*if(p_blnIsInMapUnits == false)
		    {    	
				if (p_dblArrowBodyExtension != 0)
				{
				    dblArrowBodyExtension = p_objMap.conversionsSvc.metersToGeo(objTempPnt.x,objTempPnt.y, p_dblArrowBodyExtension / 2);
				}
				
				dblArrowBodyWidht = p_objMap.conversionsSvc.metersToGeo(objTempPnt.x,objTempPnt.y, p_dblArrowBodyWidth / 2);
				dblArrowHeadWidth = p_objMap.conversionsSvc.metersToGeo(objTempPnt.x,objTempPnt.y, p_dblArrowHeadWidth / 2);
				dblArrowHeadHeight = p_objMap.conversionsSvc.metersToGeo(objTempPnt.x,objTempPnt.y, p_dblArrowHeadHeight);
		    }*/
		
		    var objLastPoint = objBody[objBody.length - 1];
		    var dblAngle = 0;
		    var blnOppositePntIsRight;
		    var objBeforeLastPoint = objBody[objBody.length - 2];
		
		    var dblDistanceBetweenLastPoints = MeasurementSvc.distance(objLastPoint.x,objLastPoint.y, objBeforeLastPoint.x,objBeforeLastPoint.y);
		
		    if (dblArrowHeadHeight > dblDistanceBetweenLastPoints)
		    {
		        dblArrowHeadHeight = dblDistanceBetweenLastPoints * 0.8;
		    }
		
		
		    objNewPoint = {};
		    //objNewPoint.SpatialReference = objLastPoint.SpatialReference;
		    dblAngle = MeasurementSvc.getTrigonometricAngle(objLastPoint.x,objLastPoint.y,
		        objBeforeLastPoint.x,objBeforeLastPoint.y);
		    
		    objNewPoint.x = objLastPoint.x + dblArrowHeadHeight * Math.cos(dblAngle);
		    objNewPoint.y = objLastPoint.y + dblArrowHeadHeight * Math.sin(dblAngle);
		    
		    objBody.splice(objBody.length - 1, 0, objNewPoint);
		    
		
		    if (objBody.length == 3)
		    {
		        dblAngle = MeasurementSvc.getTrigonometricAngle(objBody[0].x,objBody[0].y,
		            objBody[1].x,objBody[1].y);
		
		        objTempPnt ={};
		        //objTempPnt.SpatialReference = p_objPolyline.SpatialReference;
		        objTempPnt.x = (objBody[0].x + Math.cos(dblAngle + Math.PI / 2) * (dblArrowBodyWidht + dblArrowBodyExtension));
		        objTempPnt.y = (objBody[0].y + Math.sin(dblAngle + Math.PI / 2) * (dblArrowBodyWidht + dblArrowBodyExtension));
		
		        objLeftSubBody.push(objTempPnt);
		
		        objTempPnt = {};
		        //objTempPnt.SpatialReference = p_objPolyline.SpatialReference;
		        objTempPnt.x = objBody[1].x + Math.cos(dblAngle + Math.PI / 2) * dblArrowBodyWidht;
		        objTempPnt.y = objBody[1].y + Math.sin(dblAngle + Math.PI / 2) * dblArrowBodyWidht;
		
		        objLeftSubBody.push(objTempPnt);
		
		        objTempPnt = {};
		        //objTempPnt.SpatialReference = p_objPolyline.SpatialReference;
		        objTempPnt.x = objBody[0].x + Math.cos(dblAngle - Math.PI / 2) * (dblArrowBodyWidht + dblArrowBodyExtension);
		        objTempPnt.y = objBody[0].y + Math.sin(dblAngle - Math.PI / 2) * (dblArrowBodyWidht + dblArrowBodyExtension);
		
		        objRightSubBody.push(objTempPnt);
		
		        objTempPnt = {};
		        //objTempPnt.SpatialReference = p_objPolyline.SpatialReference;
		        objTempPnt.x = objBody[1].x + Math.cos(dblAngle - Math.PI / 2) * dblArrowBodyWidht;
		        objTempPnt.y = objBody[1].y + Math.sin(dblAngle - Math.PI / 2) * dblArrowBodyWidht;
		
		        objRightSubBody.push(objTempPnt);
		    }
		    else
		    {
		        objFromPoint = objBody[0];
		        objMiddlePoint = {};
		        objToPoint = objBody[1];
		
		        dblAngle = MeasurementSvc.getTrigonometricAngle(objFromPoint.x,objFromPoint.y, objToPoint.x,objToPoint.y);
		
		        objTempPnt = {};
		        //objTempPnt.SpatialReference = p_objPolyline.SpatialReference;
		
		        objTempPnt.x = objFromPoint.x + Math.cos(dblAngle + Math.PI / 2) * (dblArrowBodyWidht + dblArrowBodyExtension);
		        objTempPnt.y = objFromPoint.y + Math.sin(dblAngle + Math.PI / 2) * (dblArrowBodyWidht + dblArrowBodyExtension);
		
		        objRightSubBody.push(objTempPnt);
		
		        objTempPnt = {};
		        //objTempPnt.SpatialReference = p_objPolyline.SpatialReference;
		
		        objTempPnt.x = objFromPoint.x + Math.cos(dblAngle - Math.PI / 2) * (dblArrowBodyWidht + dblArrowBodyExtension);
		        objTempPnt.y = objFromPoint.y + Math.sin(dblAngle - Math.PI / 2) * (dblArrowBodyWidht + dblArrowBodyExtension);
		
		        objLeftSubBody.push(objTempPnt);
		        objTempPnt = {};
		        var blnRightTurn = false;
		        var dblCurrentAngle = 0, dblExtensionFactor = 0, dblDistance = 0, dblBodyAngle = 0;
		        for (var intIndex = 0; intIndex < objBody.length - 3; intIndex++)
		        {
		            objFromPoint = objBody[intIndex];
		            objMiddlePoint = objBody[intIndex + 1];
		            objToPoint = objBody[intIndex + 2];
		
		            dblExtensionFactor = (1 - (intIndex + 1) / (objBody.length - 2));
		
		            dblBodyAngle = MeasurementSvc.getArrowBodyAngle(objFromPoint.x,objFromPoint.y,
		            											   objMiddlePoint.x,objMiddlePoint.y, 
		            											   objToPoint.x,objToPoint.y) / 2;
		
		            dblAngle = MeasurementSvc.getTrigonometricAngle(objMiddlePoint.x,objMiddlePoint.y, objToPoint.x, objToPoint.y);
		
		            blnRightTurn = MeasurementSvc.isRightTurn(objFromPoint, objMiddlePoint, objToPoint);
		
		            if (blnRightTurn)
		            {
		                dblCurrentAngle = dblAngle - dblBodyAngle;
		            }
		            else
		            {
		                dblCurrentAngle = dblAngle + dblBodyAngle;
		            }
		
		            if (Math.abs(Math.sin(dblBodyAngle)) < 0.1)
		            {
		                dblDistance = Math.abs((dblArrowBodyWidht + dblArrowBodyExtension * dblExtensionFactor) / (Math.sin(0.1)));
		            }
		            else
		            {
		                dblDistance = Math.abs((dblArrowBodyWidht + dblArrowBodyExtension * dblExtensionFactor) / (Math.sin(dblBodyAngle)));
		            }
		
		            objTempPnt.x = objMiddlePoint.x + dblDistance * Math.cos(dblCurrentAngle);
		            objTempPnt.y = objMiddlePoint.y + dblDistance * Math.sin(dblCurrentAngle);
		
		            if (blnRightTurn)
		            {
		                if (objRightSubBody.length > 0)
		                {
		                    objTempSecondPnt = objRightSubBody[intIndex];
		                    if (RelationalOp.isLinesIntersects(objTempSecondPnt, objTempPnt, objFromPoint, objMiddlePoint) ||
		                    		RelationalOp.isLinesIntersects(objTempSecondPnt, objTempPnt, objMiddlePoint, objToPoint))
		                    {
		                        objLeftSubBody.push(objTempPnt);
		                        blnOppositePntIsRight = false;
		                        objTempPnt = {};
		                    }
		                    else
		                    {
		                        objRightSubBody.push(objTempPnt);
		                        blnOppositePntIsRight = true;
		                        objTempPnt = {};
		                    }
		                }
		                else
		                {
		                    objRightSubBody.push(objTempPnt);
		                    blnOppositePntIsRight = true;
		                    objTempPnt = {};
		                }
		            }
		            else
		            {
		                if (objLeftSubBody.length > 0)
		                {
		                    objTempSecondPnt = objLeftSubBody[intIndex];
		                    if (RelationalOp.isLinesIntersects(objTempSecondPnt, objTempPnt, objFromPoint, objMiddlePoint) ||
		                    		RelationalOp.isLinesIntersects(objTempSecondPnt, objTempPnt, objMiddlePoint, objToPoint))
		                    {
		                        objRightSubBody.push(objTempPnt);
		                        blnOppositePntIsRight = true;
		                        objTempPnt = {};
		                    }
		                    else
		                    {
		                        objLeftSubBody.push(objTempPnt);
		                        blnOppositePntIsRight = false;
		                        objTempPnt = {};
		                    }
		                }
		                else
		                {
		                    objLeftSubBody.push(objTempPnt);
		                    blnOppositePntIsRight = false;
		                    objTempPnt = {};
		                }
		            }
		
		            objTempPnt.x = objMiddlePoint.x + dblDistance * Math.cos(dblCurrentAngle + Math.PI);
		            objTempPnt.y = objMiddlePoint.y + dblDistance * Math.sin(dblCurrentAngle + Math.PI);
		
		            if (blnOppositePntIsRight)
		            {
		                objLeftSubBody.push(objTempPnt);
		                objTempPnt = {};
		            }
		            else
		            {
		                objRightSubBody.push(objTempPnt);
		                objTempPnt = {};
		            }
		        }
		
		        objFromPoint = objBody[objBody.length - 2];
		        objToPoint = objBody[objBody.length - 1];
		
		        dblAngle = MeasurementSvc.getTrigonometricAngle(objFromPoint.x,objFromPoint.y, objToPoint.x, objToPoint.y);
		
		        //objTempPnt = {};
		        //objTempPnt.SpatialReference = p_objPolyline.SpatialReference;
		
		        objTempPnt.x = objFromPoint.x + Math.cos(dblAngle + Math.PI / 2) * dblArrowBodyWidht;
		        objTempPnt.y = objFromPoint.y + Math.sin(dblAngle + Math.PI / 2) * dblArrowBodyWidht;
		
		        objTempSecondPnt = objRightSubBody[objRightSubBody.length - 1];
		        if (MeasurementSvc.isRightTurn(objFromPoint, objToPoint, objTempPnt) !=
		        	MeasurementSvc.isRightTurn(objFromPoint, objToPoint, objTempSecondPnt))
		        {
		            objLeftSubBody.push(objTempPnt);
		            blnOppositePntIsRight = true;
		            objTempPnt = {};
		        }
		        else
		        {
		            objRightSubBody.push(objTempPnt);
		            blnOppositePntIsRight = false;
		            objTempPnt = {};
		        }
		
		        //objTempPnt = {};
		        //objTempPnt.SpatialReference = p_objPolyline.SpatialReference;
		
		        objTempPnt.x = objFromPoint.x + Math.cos(dblAngle - Math.PI / 2) * dblArrowBodyWidht;
		        objTempPnt.y = objFromPoint.y + Math.sin(dblAngle - Math.PI / 2) * dblArrowBodyWidht;
		
		        if (blnOppositePntIsRight)
		        {
		            objRightSubBody.push(objTempPnt);
		            objTempPnt = {};
		        }
		        else
		        {
		            objLeftSubBody.push(objTempPnt);
		            objTempPnt = {};
		        }
		    }
		
		    dblAngle = MeasurementSvc.getTrigonometricAngle(objBody[objBody.length - 2].x,
		    												objBody[objBody.length - 2].y,
															objBody[objBody.length - 1].x,
		    												objBody[objBody.length - 1].y);
		
		    var objResult = new Array();
		    //(objResult as IGeometry).SpatialReference = p_objPolyline.SpatialReference;
		
		    objResult = objResult.concat(objRightSubBody);
		
		
		    //objTempPnt = {};
		    //objTempPnt.SpatialReference = p_objPolyline.SpatialReference;
		
		    objTempPnt.x = objBody[objBody.length - 2].x + Math.cos(dblAngle + Math.PI / 2) * dblArrowHeadWidth;
		    objTempPnt.y = objBody[objBody.length - 2].y + Math.sin(dblAngle + Math.PI / 2) * dblArrowHeadWidth;
		
		    var blnSwapNeeded = (MeasurementSvc.isRightTurn(objBody[objBody.length - 2], objBody[objBody.length - 1], objTempPnt) !=
		    					MeasurementSvc.isRightTurn(objBody[objBody.length - 2], objBody[objBody.length - 1], objRightSubBody[objRightSubBody.length - 1]));
		
		    if (blnSwapNeeded)
		    {
		        objTempPnt.x = objBody[objBody.length - 2].x + Math.cos(dblAngle - Math.PI / 2) * dblArrowHeadWidth;
		        objTempPnt.y = objBody[objBody.length - 2].y + Math.sin(dblAngle - Math.PI / 2) * dblArrowHeadWidth;
		    }
		
		
		    objResult.push(objTempPnt);
		    objResult.push(objBody[objBody.length - 1]);
		
		    objTempPnt = {};
		    //objTempPnt.SpatialReference = p_objPolyline.SpatialReference;
		
		    if (blnSwapNeeded)
		    {
		        objTempPnt.x = objBody[objBody.length - 2].x + Math.cos(dblAngle + Math.PI / 2) * dblArrowHeadWidth;
		        objTempPnt.y = objBody[objBody.length - 2].y + Math.sin(dblAngle + Math.PI / 2) * dblArrowHeadWidth;
		    }
		    else
		    {
		    	objTempPnt.x = objBody[objBody.length - 2].x + Math.cos(dblAngle - Math.PI / 2) * dblArrowHeadWidth;
		        objTempPnt.y = objBody[objBody.length - 2].y + Math.sin(dblAngle - Math.PI / 2) * dblArrowHeadWidth;
		        
		        //objTempPnt.PutCoords(objBody.get_Point(objBody.PointCount - 2).X + Math.Cos(dblAngle - Math.PI / 2) * dblArrowHeadWidth,
		          // objBody.get_Point(objBody.PointCount - 2).Y + Math.Sin(dblAngle - Math.PI / 2) * dblArrowHeadWidth);
		    }
		
		    objResult.push(objTempPnt);
		
		    objLeftSubBody.reverse();
		
		    objResult = objResult.concat(objLeftSubBody);
		
		
		
		    return objResult;
		};
		
		
		 ArrowSvc.GetArrowHittedPart=function(p_objPntX, 
					p_objPntY,
					p_objBody,		            
					p_objBodyOutline,
					p_dblToleranceMap)
			{
	        	
	        	if(p_objBody != null)
	        	{
			    	for (var intCurrPointIdx = 0;
						intCurrPointIdx < p_objBody.length;
						intCurrPointIdx++)
					{
			    		if(MeasurementSvc.distance(p_objPntX,p_objPntY,p_objBody[intCurrPointIdx].x,p_objBody[intCurrPointIdx].y) <= p_dblToleranceMap)
		    			{
			    			return [0,intCurrPointIdx];
		    			}
					}
			    	
			    	var dblDistance;
			    	var objCurrentPnt;
			    	var objNextPnt;
			    	
			    	var dblBodyLength = (p_objBodyOutline.length - 3) / 2;
			    	
			    	var objClosestPnt;
			    	
			    	//Some big number
			    	var minDistance = 100000000;
			    	var tempDistance;
			    	for (var intCurrPointIdx = 0;
					intCurrPointIdx < dblBodyLength - 1;
					intCurrPointIdx++)
					{
			    		objCurrentPnt =  p_objBodyOutline[intCurrPointIdx];
			    		objNextPnt =  p_objBodyOutline[intCurrPointIdx + 1];
			    		
			    		objClosestPnt = RelationalOp.GetClosestPointOnLineFromPoint(p_dblPointX, p_dblPointX,
																    				p_dblFromPointX, p_dblFromPointY,
																    				p_dblToPointX, p_dblToPointY);
			    		tempDistance = MeasurementSvc.distance(p_dblPointX,p_dblPointX,objClosestPnt.x,objClosestPnt.y);
			    		if(tempDistance < minDistance)
		    			{
			    			minDistance = tempDistance;
		    			}
			    		
					}
				}        	
			
			},
	        
		
        ////////////////////////////
		// New Code 
		
		ArrowSvc.RangeInput = function(p_objPoints,
		        				p_objArrayPoint,
		    					p_intStartIndex, p_intQuantity)
		{
			for (var i = p_intStartIndex; i < p_intStartIndex + p_intQuantity; i++)
			{
				p_objPoints.push(p_objArrayPoint[i]);
			}
		};
		
		ArrowSvc.RangeInput = function(p_objPoints,
											p_intIndex,
											p_objArrayPoint,
											p_intStartIndex, p_intQuantity)
		{
			var j = 0;
			for (var i = p_intStartIndex; i < p_intStartIndex + p_intQuantity; i++)
			{
				p_objPoints.splice(p_intIndex + j,0, p_objArrayPoint[i]);
				j++;
			}
			return p_objPoints;
		};
		
		ArrowSvc.ReverseInput = function(p_objPoints,
		             						p_intIndex,
		             						p_objArrayPoint,
		             						p_intStartIndex, p_intQuantity)
		{
		
			var j = 0;
		
			if (p_intIndex < p_objPoints.Count)
			{
				for (var i = p_intStartIndex; i > p_intStartIndex - p_intQuantity; i--)
				{
					p_objPoints.splice(p_intIndex + j,0, p_objArrayPoint[i]);
					j++;
				}
			}
			else
			{
				for (var i = p_intStartIndex; i > p_intStartIndex - p_intQuantity; i--)
				{
					p_objPoints.push(p_objArrayPoint[i]);
				}
		
			}
			return p_objPoints;
		},
		
		ArrowSvc.CalculateSameWidthBody = function(p_objFromPoint,
									        p_objMidlePoint,
									        p_objToPoint,
									        p_objPrevPoint,
									        p_dblBodyAngle,
									        p_dblWidth)
		{
		    var objResult = {};            
		
		    p_dblBodyAngle /= 2;
		
		    var dblAngle = MeasurementSvc.getTrigonometricAngle(p_objMidlePoint, p_objToPoint);
		
		    var blnRightTurn = MeasurementSvc.isRightTurn(p_objFromPoint, p_objMidlePoint, p_objToPoint);
		    var dblPointAngle;
		    var dblRadius;
		
		    if (blnRightTurn)
		    {
		        dblPointAngle = dblAngle - p_dblBodyAngle;
		    }
		    else
		    {
		        dblPointAngle = dblAngle + p_dblBodyAngle;
		    }
		
		    if (Math.abs(Math.sin(p_dblBodyAngle)) < 0.1)
		    {
		        dblRadius = p_dblWidth / Math.sin(0.1);
		    }
		    else
		    {
		        dblRadius = p_dblWidth / Math.sin(p_dblBodyAngle);
		    }
		
		    objResult.x = (p_objMidlePoint.x + dblRadius * Math.cos(dblPointAngle));
		    objResult.y = (p_objMidlePoint.y - dblRadius * Math.sin(dblPointAngle));
		
		    if (RelationalOp.isLinesIntersects(
		               p_objPrevPoint.x,p_objPrevPoint.y, objResult.x,objResult.y,
		               p_objFromPoint.x,p_objFromPoint.y, p_objMidlePoint.x,p_objMidlePoint.y))
		    {
		        objResult.x = (p_objMidlePoint.x + dblRadius * Math.cos(dblPointAngle + Math.PI));
		        objResult.y = (p_objMidlePoint.y - dblRadius * Math.sin(dblPointAngle + Math.PI));
		    }
		
		    return objResult;
		};
		
		ArrowSvc.CalculateSubPart = function(p_objBodyScreenPoints,
										        p_objArrowWidthInScreenUnits,
										        p_objBodyPointsExtension,
										        p_objIndexes)
		{
		    var dblCurrentWidth, dblNextWidth;
		    
		
		    if (p_objBodyScreenPoints.length > 3)
		    {
		        var objTempPoint = {};                
		        for (var intPointIndex = 0; intPointIndex < p_objBodyScreenPoints.length - 1; intPointIndex++)
		        {
		            dblCurrentWidth = (p_objArrowWidthInScreenUnits[p_objIndexes[intPointIndex]] + p_objBodyPointsExtension[intPointIndex]) / 2;
		
		            if (p_objIndexes[intPointIndex] == p_objIndexes[intPointIndex + 1] &&
		            		MeasurementSvc.distancePnts(p_objBodyScreenPoints[intPointIndex], p_objBodyScreenPoints[intPointIndex + 1]) < dblCurrentWidth)
		            {
		                objTempPoint.x = (p_objBodyScreenPoints[intPointIndex].x + p_objBodyScreenPoints[intPointIndex + 1].x) / 2;
		                objTempPoint.y = (p_objBodyScreenPoints[intPointIndex].y + p_objBodyScreenPoints[intPointIndex + 1].y) / 2;
		                p_objBodyScreenPoints[intPointIndex] = objTempPoint;
		                p_objBodyScreenPoints.splice(intPointIndex,1);
		            }
		        }
		
		        objTempPoint = {};
		    }
		
		    var objFromPoint = {};
		    var objMiddlePoint = {};
		    var objToPoint = {};
		    var objTempPnt = {};
		    var objPrevTempPnt = {};
		
		    var objSubBody = [];
		
		    var dblBodyAngle, dblAngle;
		    dblCurrentWidth = (p_objArrowWidthInScreenUnits[p_objIndexes[0]] + p_objBodyPointsExtension[0])/2;
		
		    dblAngle = MeasurementSvc.getTrigonometricAngle(p_objBodyScreenPoints[0], p_objBodyScreenPoints[1]);
		
		    objTempPnt = {x:(p_objBodyScreenPoints[0].x + Math.cos(dblAngle - Math.PI / 2) * dblCurrentWidth),
		        y:(p_objBodyScreenPoints[0].y - p_intYAxisDirectionCoefficient * Math.sin(dblAngle - Math.PI / 2) * dblCurrentWidth)};
		
		    objSubBody.push(objTempPnt);
		
		    for (var intIndex = 0; intIndex < p_objBodyScreenPoints.length - 2; intIndex++)
		    {
		        if (p_objIndexes[intIndex] == 0 &&
		           p_objIndexes[intIndex + 1] == 0)
		        {
		            dblCurrentWidth = (p_objArrowWidthInScreenUnits[p_objIndexes[intIndex + 1]] + p_objBodyPointsExtension[intIndex + 1]) /2;
		            dblNextWidth = (p_objArrowWidthInScreenUnits[p_objIndexes[intIndex + 1]] + p_objBodyPointsExtension[intIndex + 1]) / 2;
		        }
		        else if (p_objIndexes[intIndex] == 0 &&
		            p_objIndexes[intIndex + 1] != 0)
		        {
		            dblCurrentWidth = (p_objArrowWidthInScreenUnits[p_objIndexes[intIndex]] + p_objBodyPointsExtension[intIndex + 1]) / 2;
		            dblNextWidth = (p_objArrowWidthInScreenUnits[p_objIndexes[intIndex + 1]] + p_objBodyPointsExtension[intIndex + 2]) / 2;
		        }
		        else if (p_objIndexes[intIndex] != 0 &&
		                p_objIndexes[intIndex + 1] == 0)
		        {
		            dblCurrentWidth = (p_objArrowWidthInScreenUnits[p_objIndexes[intIndex]] + p_objBodyPointsExtension[intIndex]) / 2;
		            dblNextWidth = (p_objArrowWidthInScreenUnits[p_objIndexes[intIndex + 1]] + p_objBodyPointsExtension[intIndex + 1]) / 2;
		        }
		        else
		        {
		            dblCurrentWidth = p_objArrowWidthInScreenUnits[p_objIndexes[intIndex]] / 2;
		            dblNextWidth = p_objArrowWidthInScreenUnits[p_objIndexes[intIndex + 1]] / 2;
		        }
		
		        objFromPoint = p_objBodyScreenPoints[intIndex];
		        objMiddlePoint = p_objBodyScreenPoints[intIndex + 1];
		        objToPoint = p_objBodyScreenPoints[intIndex + 2];
		
		        dblBodyAngle = MeasurementSvc.getArrowBodyAngle(objFromPoint, objMiddlePoint, objToPoint);
		
		        if (dblCurrentWidth == dblNextWidth)
		        {
		            if (objSubBody.length > 0)
		            {
		                objPrevTempPnt = objSubBody[objSubBody.length - 1];
		            }
		            else
		            {
		                objPrevTempPnt = {};
		            }
		
		            objTempPnt = ArrowSvc.CalculateSameWidthBody(objFromPoint, objMiddlePoint, objToPoint, objPrevTempPnt,
		                dblBodyAngle, dblCurrentWidth,
		                p_intYAxisDirectionCoefficient, blnScreenYAxisDirection);
		        }
		        else if (dblBodyAngle > Math.PI / 2)
		        {
		            objTempPnt = ArrowSvc.CalculateObtuseAnglePoints(objMiddlePoint,
		                objFromPoint,
		                dblBodyAngle,
		                dblCurrentWidth, dblNextWidth,
		                p_intYAxisDirectionCoefficient,
		                blnScreenYAxisDirection);
		        }
		        else
		        {
		            objTempPnt = CalculateAcuteAnglePoints(objMiddlePoint, objToPoint, dblBodyAngle,
		                dblCurrentWidth, dblNextWidth,
		                p_intYAxisDirectionCoefficient, blnScreenYAxisDirection);
		        }
		
		        objSubBody.push(objTempPnt);
		    }
		
		    dblAngle = MeasurementSvc.getTrigonometricAngle(p_objBodyScreenPoints[p_objBodyScreenPoints.length - 2], p_objBodyScreenPoints[p_objBodyScreenPoints.length - 1],blnScreenYAxisDirection);
		
		    var dblPrevWidth = (p_objArrowWidthInScreenUnits[p_objIndexes[p_objBodyScreenPoints.length - 1]] + p_objBodyPointsExtension[p_objBodyScreenPoints.length - 1]) / 2;
		
		    objTempPnt = {x:(p_objBodyScreenPoints[p_objBodyScreenPoints.Count - 1].X + Math.cos(dblAngle - Math.PI / 2) * dblPrevWidth),
		    			y:(p_objBodyScreenPoints[p_objBodyScreenPoints.Count - 1].Y - Math.sin(dblAngle - Math.PI / 2) * dblPrevWidth)};
		
		    objSubBody.push(objTempPnt);
		
		    return objSubBody;
		},
		
		ArrowSvc.CalculateAcuteAnglePoints = function(p_objSourcePoint,
		        p_objToPoint,
		        p_dblBodyAngle,
		        p_dblFirstWidth,
		        p_dblSecondWidth)
		{
		    var objResult = {};
		    var dblAngle;
		    var dblRadius;
		    var dblPointAngle;
		
		    dblAngle = MeasurementSvc.getTrigonometricAngle(p_objSourcePoint, p_objToPoint);
		
		    if (p_dblBodyAngle == Math.PI / 2)
		    {
		        dblRadius = Math.sqrt(p_dblFirstWidth * p_dblFirstWidth + p_dblSecondWidth * p_dblSecondWidth);
		        dblAngle = dblAngle - Math.atan(p_dblSecondWidth / p_dblFirstWidth);
		        dblPointAngle = dblAngle;
		    }
		    else
		    {
		        var dblBeta = Math.PI / 2 - p_dblBodyAngle;
		    	var dblDC = p_dblFirstWidth / Math.Sin(dblBeta);
		        var dblAB = (p_dblSecondWidth + dblDC) / Math.tan(p_dblBodyAngle);
		        dblPointAngle = dblAngle - Math.atan(p_dblSecondWidth / dblAB);
		        dblRadius = Math.sqrt(p_dblSecondWidth * p_dblSecondWidth + dblAB * dblAB);
		    }
		    objResult = {x:(p_objSourcePoint.x + dblRadius * Math.cos(dblPointAngle)),
		                          y:(p_objSourcePoint.y - dblRadius * Math.sin(dblPointAngle))};
		
		    return objResult;
		},
		
		ArrowSvc.CalculateObtuseAnglePoints = function(p_objSourcePoint,
		        	p_objFromPoint,
		        	p_dblBodyAngle,
		        	p_dblFirstWidth,
		        	p_dblSecondWidth)
		{
		    var objResult = {};
		
		    if (p_dblBodyAngle > Math.PI / 2)
		    {
		        p_dblBodyAngle -= Math.PI / 2;
		    }
		
		    var dblAngle = MeasurementSvc.getTrigonometricAngle(p_objFromPoint, p_objSourcePoint);
		
		    var dblBeta = Math.PI / 2 - p_dblBodyAngle;
		    var dblDC = p_dblSecondWidth / Math.Sin(dblBeta);
		    var dblDB = p_dblFirstWidth * Math.Tan(p_dblBodyAngle);
		    var dblCB = dblDB - dblDC;
		    var dblPointAngle = dblAngle + Math.atan(dblCB / p_dblFirstWidth) - Math.PI / 2;
		    var dblRadius = Math.sqrt(p_dblFirstWidth * p_dblFirstWidth + dblCB * dblCB);
		
		
		    objResult = {x:(p_objSourcePoint.x + dblRadius * Math.cos(dblPointAngle)),
		                        y:(p_objSourcePoint.y - dblRadius * Math.sin(dblPointAngle))};
		
		    return objResult;
		};
	
	ArrowSvc.instance = new ArrowSvc();
	
	return ArrowSvc;
});
