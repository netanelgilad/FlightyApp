/*Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE 
Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE 
Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE 
Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE 
Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE 
Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE 
Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE 
Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE 
Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE
Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE 
Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE Not In USE */


/*
define(["dojo/_base/declare",
        "NeWMI/Layer/Base/ACustomLayer", 
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Service/Math/RelationalOp," +
        "NeWMI/Modules/GeometryModule"], 
    function(declare, 
    		ACustomLayer, 
    		MeasurementSvc,
    		RelationalOp){
	
	return declare("NeWMI/Layer/FeedbackLayer", ACustomLayer, { 
					
		// The constructor
		constructor: function(options) 
		{
			options = options || {};
			this.inherited(arguments, [ false, true, options ]);
			
			this.boldIndex = -1;
			this.feedbackGeometry = {};
			
			this.currentFeddbackGeoType = {};
		},

		////////////////////////  publics ///////////////////////////////
		
		drawGL : function(gl)
		{

		},

		draw2D: function(context)
		{	
			if (this.feedbackGeometry != null)
			{
				if (this.feedbackGeometry instanceof NeWMI.Geometry.Polyline)
				{
					if(this.arrowProps == null)
					{
						context.lineWidth = 4;
						context.strokeStyle = 'black';
						
						DrawMultiPointGeo(this.map, context, this.feedbackGeometry, true, false);
						
						context.setLineDash([10]);
						context.lineWidth = 3;
						
						context.strokeStyle = 'white';
						
						DrawMultiPointGeo(this.map, context, this.feedbackGeometry, true, false);
						
						context.setLineDash([0]);
						
						for (var intCurrPnt = 0; intCurrPnt < this.feedbackGeometry.points.length; ++intCurrPnt)
						{
							this.drawEditPoint(context, this.feedbackGeometry.points[intCurrPnt]);
						}
					}
					else
					{
						context.lineWidth = 4;
						context.strokeStyle = 'black';
						
						DrawMultiPointGeo(this.map, context, this.feedbackGeometry, true, false);
						
						context.lineWidth = 4;						
						context.strokeStyle = 'white';																	
						context.setLineDash([0]);
						
						for (var intCurrPnt = 0; intCurrPnt < this.arrowProps.internalPoints.length; ++intCurrPnt)
						{
							this.drawEditPoint(context, this.arrowProps.internalPoints[intCurrPnt]);
						}
						//context.strokeStyle = 'red';				
						this.drawEditPoint(context, this.arrowProps.bodyWidthEditPnt);
						this.drawEditPoint(context, this.arrowProps.headHeigthEditPnt);
						this.drawEditPoint(context, this.arrowProps.headWidthEditPnt);						
					}
						
				}
				else if(this.feedbackGeometry instanceof NeWMI.Geometry.Rectangle)
				{
					context.lineWidth = 4;						
					context.strokeStyle = 'white';																	
					context.setLineDash([0]);
					
					DrawRectangle(this.map, context,
							this.feedbackGeometry.getXMin(),
							this.feedbackGeometry.getYMin(),
							this.feedbackGeometry.getXMax(),
							this.feedbackGeometry.getYMax());
					
				}
				else
				{
					this.drawEditPoint(context, this.feedbackGeometry.points[0]);
				}
				
				if (this.boldIndex != -1 && this.arrowProps == null)
				{
					context.fillStyle = 'red';
					DrawPointAsCircle(this.map, context, this.feedbackGeometry.points[this.boldIndex], 5);					
				}
			}
		},
		
		onMouseDown : function(evt) 
		{
			var pntPressed = evt.mapPoint;
			
			var xScale = (this.map.extent.getXMax() - this.map.extent.getXMin()) / this.context.canvas.width; 
			var yScale = (this.map.extent.getYMax() - this.map.extent.getYMin()) / this.context.canvas.height;
			var avgScale = (xScale + yScale) / 2;
			
			var tolerance = 10 * avgScale;
			
			if(this.arrowProps == null)
			{
				var intPntIndex = this.getPntIndex(pntPressed, tolerance);
				
				if (intPntIndex != -1)
				{
					this.boldIndex = intPntIndex;
					this.refresh();
				}
			}
			else
			{
				
				var objArrowIndex = this.getArrowPartIndex(pntPressed, tolerance);
			
				if (objArrowIndex[0] != -1)
				{
					this.boldIndex = objArrowIndex;
					
					this.refresh();
				}
			}	
		},
		
		onMouseMove : function (evt) 
		{
			if(this.arrowProps == null)
			{
				if (this.boldIndex != -1)
				{
					var pntPressed = evt.mapPoint;
					
					
					{
						this.feedbackGeometry.points[this.boldIndex] = pntPressed;
					}
					
				}
			}
			else
			{
				if (this.boldIndex[0] == 0)
				{
					var pntPressed = evt.mapPoint;
					this.arrowProps.internalPoints[this.boldIndex[1]] = pntPressed;										
				}
				else if (this.boldIndex[0] == 1)
				{
					var pntPressed = evt.mapPoint;
					
					var fromPnt = this.arrowProps.internalPoints[this.arrowProps.widthEditPntPart];
					var toPnt = this.arrowProps.internalPoints[this.arrowProps.widthEditPntPart + 1];
					
					var closestPnt = RelationalOp.getClosestPointOnLineFromPoint(pntPressed.x,pntPressed.y,
											fromPnt.x,fromPnt.y,toPnt.x,toPnt.y);
					
					var newWidth = MeasurementSvc.distancePnts(closestPnt,pntPressed);
					
					if(newWidth > this.arrowProps.headWidth * 0.95)
					{
						newWidth = this.arrowProps.headWidth * 0.95;
					}
					
					this.arrowProps.bodyWidth = newWidth;
					
				}
				else if (this.boldIndex[0] == 2)
				{
					var pntPressed = evt.mapPoint;
					
					var bodyPointCount = this.arrowProps.internalPoints.length;
					
					var fromPnt = this.arrowProps.internalPoints[bodyPointCount - 1];
					var toPnt = this.arrowProps.internalPoints[bodyPointCount - 2];
					
					var closestPnt = RelationalOp.getClosestPointOnLineFromPoint(pntPressed.x,pntPressed.y,
											fromPnt.x,fromPnt.y,toPnt.x,toPnt.y);
					
					var newWidth = MeasurementSvc.distancePnts(closestPnt,pntPressed);
					
					if(newWidth < this.arrowProps.bodyWidth * 1.05)
					{
						newWidth = this.arrowProps.bodyWidth * 1.05;
					}
					
					this.arrowProps.headWidth = newWidth;
				}
				else if (this.boldIndex[0] == 3)
				{
					var pntPressed = evt.mapPoint;
					
					var bodyPointCount = this.arrowProps.internalPoints.length;
					
					var lastPnt = this.arrowProps.internalPoints[bodyPointCount  - 1];
					var beforeLastPnt = this.arrowProps.internalPoints[bodyPointCount  - 2];
					
					var lastSegmentLength =  MeasurementSvc.distancePnts(lastPnt,beforeLastPnt);
					
					
					
					var closestPnt = RelationalOp.getClosestPointOnLineFromPoint(pntPressed.x,pntPressed.y,
							lastPnt.x,lastPnt.y,beforeLastPnt.x,beforeLastPnt.y);
					
					var newHeigth = MeasurementSvc.distancePnts(closestPnt,lastPnt);
					
					if(newHeigth < lastSegmentLength / 10)
					{
						newHeigth = lastSegmentLength / 10;
					}
					
					if(newHeigth > lastSegmentLength  * 0.9)
					{
						newHeigth = lastSegmentLength  * 0.9;
					}
					
					this.arrowProps.headHeigth = newHeigth;
				}
				
				this.calculateEditPoints();
				
				var objArrowOutline = ArrowServices.CreateArrowBody(this.arrowProps.internalPoints,                    	                           
                    	this.arrowProps.arrowType,
        				this.arrowProps.bodyExtension,
        				this.arrowProps.bodyWidth * 2,
        				this.arrowProps.headWidth * 2,
        				this.arrowProps.headHeigth,
                    	true);
				this.feedbackGeometry.points = objArrowOutline;
			}
			this.refresh();
		},
		
		onMouseUp: function (ev) 
		{
			if(this.arrowProps == null)
			{
				this.boldIndex = -1;
			}
			else
			{
				var objArrowOutline = ArrowServices.CreateArrowBody(this.arrowProps.internalPoints,                    	                           
                    	this.arrowProps.arrowType,
        				this.arrowProps.bodyExtension,
        				this.arrowProps.bodyWidth * 2,
        				this.arrowProps.headWidth * 2,
        				this.arrowProps.headHeigth,
                    	true);
				this.feedbackGeometry.points = objArrowOutline;
			}
			this.refresh();
		},
		
		onDblClick: function (ev)
		{
			this.finishEdit();
		},
		
		drawEditPoint: function(context, point)
		{
			context.fillStyle = 'black';
			DrawPointAsCircle(this.map, context, point, 8);
			
			context.fillStyle = 'white';
			DrawPointAsCircle(this.map, context, point, 5);
		},
		
		calculateEditPoints : function()
		{
			var intLongestPart = 0;
			var dblLongestPart = 0;
			var dblTempLength;
			for(var intPntIdx = 0; intPntIdx < this.arrowProps.internalPoints.length - 1; intPntIdx++)
			{
				dblTempLength = MeasurementSvc.distancePnts(this.arrowProps.internalPoints[intPntIdx],
						this.arrowProps.internalPoints[intPntIdx + 1]);
				if(dblTempLength > dblLongestPart)
				{
					dblLongestPart = dblTempLength;
					intLongestPart = intPntIdx;
				}
			}
			
			var internalPointsLength = this.arrowProps.internalPoints.length;
			
			var dblAngleInLongestPart = MeasurementSvc.getTrigonometricAngle(this.arrowProps.internalPoints[intLongestPart].x, this.arrowProps.internalPoints[intLongestPart].y,
					this.arrowProps.internalPoints[intLongestPart + 1].x, this.arrowProps.internalPoints[intLongestPart+1].y);
			
			//Find the midlle of longest part
			var dblTempXCoord = this.arrowProps.internalPoints[intLongestPart].x + dblLongestPart / 2 * Math.cos(dblAngleInLongestPart);
			var dblTempYCoord = this.arrowProps.internalPoints[intLongestPart].y + dblLongestPart / 2 * Math.sin(dblAngleInLongestPart);
			
			this.arrowProps.widthEditPntPart = intLongestPart;
			
			var dblBodyWidthX = dblTempXCoord + this.arrowProps.bodyWidth * Math.cos(dblAngleInLongestPart + Math.PI/2);
			var dblBodyWidthY = dblTempYCoord + this.arrowProps.bodyWidth * Math.sin(dblAngleInLongestPart + Math.PI/2);
			
			this.arrowProps.tempPnt = {x:dblTempXCoord,y:dblTempYCoord};
			this.arrowProps.bodyWidthEditPnt = {x:dblBodyWidthX,y:dblBodyWidthY};
			
			var dblAngleLastPart = MeasurementSvc.getTrigonometricAngle(this.arrowProps.internalPoints[internalPointsLength - 2].x, this.arrowProps.internalPoints[internalPointsLength - 2].y,
					this.arrowProps.internalPoints[internalPointsLength - 1].x, this.arrowProps.internalPoints[internalPointsLength - 1].y);
			
			var dblHeaHeigthX = this.arrowProps.internalPoints[internalPointsLength - 1].x + this.arrowProps.headHeigth * Math.cos(dblAngleLastPart + Math.PI);
			var dblHeaHeigthY = this.arrowProps.internalPoints[internalPointsLength - 1].y + this.arrowProps.headHeigth * Math.sin(dblAngleLastPart + Math.PI);
			
			
			this.arrowProps.headHeigthEditPnt = {x:dblHeaHeigthX,y:dblHeaHeigthY};
							
			
			var dblHeadWidthX = this.arrowProps.headHeigthEditPnt.x + this.arrowProps.headWidth * Math.cos(dblAngleLastPart + Math.PI/2);
			var dblHeadWidthY = this.arrowProps.headHeigthEditPnt.y + this.arrowProps.headWidth * Math.sin(dblAngleLastPart + Math.PI/2);
			
			this.arrowProps.headWidthEditPnt = {x:dblHeadWidthX,y:dblHeadWidthY};
		},
		
		startFeedback: function(geoType)
		{
			this.arrowProps = null;
			
			
			
			dojo.forEach(this.editConnects, dojo.disconnect, dojo);
			this.editConnects = [];
			this.editConnects.push(dojo.connect(this.map, "onMouseDown", this, this.onMouseDown));
			this.editConnects.push(dojo.connect(this.map, "onMouseDrag", this, this.onMouseMove));
			this.editConnects.push(dojo.connect(this.map, "onMouseUp", this, this.onMouseUp));
			this.editConnects.push(dojo.connect(this.map, "onDblClick", this, this.onDblClick));
			
			this.refresh();
		},
		
		finishEdit : function()
		{
			dojo.forEach(this.editConnects, dojo.disconnect, dojo);
			this.editConnects = [];
			
			var finishedGeo;
						
			if (this.feedbackGeometry.GeoType == 1)
			{
			    objFinishedGeo = new NeWMI.Geometry.Point({ x: this.feedbackGeometry[0].x, y: this.feedbackGeometry[1].y });
			}
			else if (this.feedbackGeometry.GeoType == 4)
			{
				objFinishedGeo = new NeWMI.Geometry.Polyline(this.feedbackGeometry.points);
			}
			else if (this.feedbackGeometry.GeoType == 5)
			{
				objFinishedGeo = new NeWMI.Geometry.Polygon(this.feedbackGeometry.points);
			}
			else if (this.feedbackGeometry.GeoType == 6)
			{
			    objFinishedGeo = this.feedbackGeometry.clone();
                    
			}
			else
			{
				objFinishedGeo = this.feedbackGeometry;
			}
			
			if(this.arrowProps != null)
			{
				var objTempPnt = this.arrowProps.internalPoints[0];
				
				if (this.arrowProps.bodyExtension != 0)
				{
					this.arrowProps.bodyExtension = Math.round(this.map.conversionsSvc.geoToMeters(objTempPnt.x,objTempPnt.y, this.arrowProps.bodyExtension * 2));
				}
				
				this.arrowProps.bodyWidth =  Math.round(this.map.conversionsSvc.geoToMeters(objTempPnt.x,objTempPnt.y, this.arrowProps.bodyWidth * 2));
				this.arrowProps.headWidth =  Math.round(this.map.conversionsSvc.geoToMeters(objTempPnt.x,objTempPnt.y, this.arrowProps.headWidth * 2));
				this.arrowProps.headHeigth =  Math.round(this.map.conversionsSvc.geoToMeters(objTempPnt.x,objTempPnt.y, this.arrowProps.headHeigth));
				
				
				objFinishedGeo.arrowProps = {};
				objFinishedGeo.arrowProps.internalPoints = this.arrowProps.internalPoints;
				objFinishedGeo.arrowProps.arrowType = this.arrowProps.arrowType;
				objFinishedGeo.arrowProps.bodyExtension = this.arrowProps.bodyExtension;
				objFinishedGeo.arrowProps.bodyWidth = this.arrowProps.bodyWidth;
				objFinishedGeo.arrowProps.headWidth = this.arrowProps.headWidth;
				objFinishedGeo.arrowProps.headHeigth = this.arrowProps.headHeigth;
			}
			
			this.feedbackGeometry = null;
			
			this.refresh();
			
			this.onEditFinished(objFinishedGeo);
		},
		
		onEditFinished: function(objFinishedGeo) 
		{
	    },
		
	    getArrowPartIndex : function(pnt, tolerance)
		{
			for (var intCurrPT = 0; intCurrPT < this.arrowProps.internalPoints.length; ++intCurrPT)
			{
				var dblCurrDist = MeasurementSvc.distance(this.arrowProps.internalPoints[intCurrPT].x, this.arrowProps.internalPoints[intCurrPT].y, pnt.x, pnt.y);
				
				if (dblCurrDist < tolerance)
						return [0,intCurrPT];
			}
			
			var dblCurrDist = MeasurementSvc.distance(this.arrowProps.bodyWidthEditPnt.x, this.arrowProps.bodyWidthEditPnt.y, pnt.x, pnt.y);
			
			if (dblCurrDist < tolerance)
					return [1,this.arrowProps.bodyWidth];
			
			dblCurrDist = MeasurementSvc.distance(this.arrowProps.headWidthEditPnt.x, this.arrowProps.headWidthEditPnt.y, pnt.x, pnt.y);
			
			if (dblCurrDist < tolerance)
					return [2,this.arrowProps.headWidth];
			
			dblCurrDist = MeasurementSvc.distance(this.arrowProps.headHeigthEditPnt.x, this.arrowProps.headHeigthEditPnt.y, pnt.x, pnt.y);
			
			if (dblCurrDist < tolerance)
					return [3,this.arrowProps.headHeigth];
			
			return [-1,0];
		},
	    
		getPntIndex : function(pnt, tolerance)
		{
			for (var intCurrPT = 0; intCurrPT < this.feedbackGeometry.points.length; ++intCurrPT)
			{
				var dblCurrDist = MeasurementSvc.distance(this.feedbackGeometry.points[intCurrPT].x, this.feedbackGeometry.points[intCurrPT].y, pnt.x, pnt.y);
				
				if (dblCurrDist < tolerance)
						return intCurrPT;
			}
			
			return -1;
		}
	});
});*/