/**
* @class NeWMI.Draw.Draw2D
* Provides draw services using HTML5 Canvas and context2D
* @static
*/
define(["dojo/_base/declare",
        "NeWMI/Draw/StringSizeCalculator",
        "NeWMI/Modules/GeometryModule"
], function (declare, StringSizeCalculator) {

        var Draw2D = declare("NeWMI.Draw.Draw2D", null, { });
        
        /**
        * @property {Object} defaults
        * @property {Object} [defaults.pointSize=3]
        * The defaults values for drawing
        * @static
        */
        Draw2D.defaults = {};
        Draw2D.defaults.pointSize = 3;
        
        /**
         * @method geometry
		 * Drawing a given geometry on the map
         * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map to draw on
		 * @param {Object} p_objContext HTML canvas(context) object
         * @param {NeWMI.Geometry.Base.AGeometry} p_objGeo The geometry to draw
         * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
         * @param {Object} [p_objOptions] The optional geometries options
         * @param {Object} [p_objOptions.pointSize=Draw2D.defaults.pointSize] The point size. It is not changing the default Draw2D.defaults.pointSize.
         * @static
		 */
        Draw2D.geometry = function(p_objMap, p_objContext, p_objGeo, p_hDraw, p_objOptions)
        {
        	p_objOptions = p_objOptions || {};
        	
        	switch (p_objGeo.GeoType)
        	{
        		case NeWMI.Geometry.Base.AGeometry.EGeometryType.Point:
        		{
        			Draw2D.pointGeometry(p_objMap, p_objContext, p_objGeo, p_objOptions.pointSize, p_hDraw);
        			break;
        		}
        		case NeWMI.Geometry.Base.AGeometry.EGeometryType.Polyline:
        		{
        			Draw2D.polylineGeometry(p_objMap, p_objContext, p_objGeo);
        			break;
        		}
        		case NeWMI.Geometry.Base.AGeometry.EGeometryType.Polygon:
        		{
        			Draw2D.polygonGeometry(p_objMap, p_objContext, p_objGeo, p_hDraw);
        			break;
        		}
        		case NeWMI.Geometry.Base.AGeometry.EGeometryType.Circle:
        		{
        			Draw2D.circleGeometry(p_objMap, p_objContext, p_objGeo, p_hDraw);
        			break;
        		}
        		case NeWMI.Geometry.Base.AGeometry.EGeometryType.Ellipse:
        		{
        			Draw2D.ellipseGeometry(p_objMap, p_objContext, p_objGeo, p_hDraw);
        			break;
        		}
        		case NeWMI.Geometry.Base.AGeometry.EGeometryType.Rectangle:
        		{
        			Draw2D.rectangleGeometry(p_objMap, p_objContext, p_objGeo, p_hDraw);
        			break;
        		}
        		case NeWMI.Geometry.Base.AGeometry.EGeometryType.Arrow:
        		{
        			Draw2D.arrowGeometry(p_objMap, p_objContext, p_objGeo, p_hDraw);
        			break;
        		}
        	}
        };
        
        /**
         * @method point
		 * Drawing a given point on the map
		 * @param {Object} p_objContext HTML canvas(context) object
         * @param {Number} p_dblX The Point to draw - X value
         * @param {Number} p_dblY The Point to draw - Y value
         * @param {Object} [p_dblPointSize=Draw2D.defaults.pointSize] The point size. It is not changing the default Draw2D.defaults.pointSize.
         * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
         * @static
         */
        Draw2D.point = function(p_objContext, p_dblX, p_dblY, p_dblPointSize, p_hDraw)
        {
        	p_hDraw = p_hDraw || p_objContext.fill;
			var dblSize = p_dblPointSize || Draw2D.defaults.pointSize;
			
			p_objContext.beginPath();
			p_objContext.arc(p_dblX, p_dblY, dblSize / 2, 0, 2 * Math.PI, false);
			p_hDraw.call(p_objContext);
			
			return;
			
			//// or Slower version/////
			/*
			var strOldFont = p_objContext.font;
			
			p_objContext.font = dblSize.toString() + "px Webdings";
						
			// The symbol of point
			p_objContext.fillText("n", p_dblX - (dblSize / 2), p_dblY + (dblSize / 3.70));
			
			p_objContext.font = strOldFont;*/
        };
        
        /**
         * @method pointGeometry
		 * Drawing a given point geometry on the map
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map to draw on
		 * @param {Object} p_objContext HTML canvas(context) object
         * @param {NeWMI.Geometry.Point} p_objGeo The point to draw
         * @param {Object} [p_dblPointSize=Draw2D.defaults.pointSize] The point size. It is not changing the default Draw2D.defaults.pointSize.
         * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
         * @static
         */
        Draw2D.pointGeometry = function(p_objMap, p_objContext, p_objGeo, p_dblPointSize, p_hDraw)
        {
        	var objScreenPt = p_objMap.conversionsSvc.toScreen(p_objGeo.x, p_objGeo.y);
        	
        	/*var pix0 = p_objMap.conversionsSvc.toMap(0, 0);
        	var pix100 = p_objMap.conversionsSvc.toMap(100, 100);
        	
        	var dblXScale = 100 / (pix100.x - pix0.x);
        	var dblYScale = 100 / (pix100.y - pix0.y);
        	
        	var objScreenPt = 
        	{ x : (p_objGeo.x - pix0.x) * dblXScale, 
        	  y : (p_objGeo.y - pix0.y) * dblYScale};*/
        	
        	Draw2D.point (p_objContext, objScreenPt.x, objScreenPt.y, p_dblPointSize, p_hDraw);
        };

        /**
         * @method circleGeometry
		 * Drawing a given circle geometry on the map
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map to draw on
		 * @param {Object} p_objContext HTML canvas(context) object
         * @param {NeWMI.Geometry.Circle} p_objGeo The circle to draw
         * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
         * @static
         */
        Draw2D.circleGeometry = function(p_objMap, p_objContext, p_objGeo, p_hDraw)
        {
        	p_hDraw = p_hDraw || p_objContext.stroke;
        	
        	var objCenterScreenPt = p_objMap.conversionsSvc.toScreen(p_objGeo.x, p_objGeo.y);
        	var objScreenPtForRadius = p_objMap.conversionsSvc.toScreen(p_objGeo.x + p_objGeo.radius, p_objGeo.y);
        	
        	var dblRadius = Math.abs(objCenterScreenPt.x - objScreenPtForRadius.x);
        	
        	p_objContext.beginPath();
        	p_objContext.arc(objCenterScreenPt.x, objCenterScreenPt.y, dblRadius, 0, 2 * Math.PI, false);
        	
        	p_hDraw.call(p_objContext);
        };
        
        /**
         * @method ellipseGeometry
		 * Drawing a given ellipse geometry on the map
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map to draw on
		 * @param {Object} p_objContext HTML canvas(context) object
         * @param {NeWMI.Geometry.Ellipse} p_objGeo The ellipse to draw
         * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
         * @static
         */
        Draw2D.ellipseGeometry = function(p_objMap, p_objContext, p_objGeo, p_hDraw)
        {        	
        	//Draw2D._drawMultipointsLine(p_objMap, p_objContext, p_objGeo, true);
        	//return;
        	
        	var objCenterScreenPt = p_objMap.conversionsSvc.toScreen(p_objGeo.x, p_objGeo.y);
        	var objScreenPtForRadius = p_objMap.conversionsSvc.toScreen(p_objGeo.x + p_objGeo.xRadius, p_objGeo.y + p_objGeo.yRadius);
        	
        	var dblRadiusX = Math.abs(objCenterScreenPt.x - objScreenPtForRadius.x);
        	var dblRadiusY = Math.abs(objCenterScreenPt.y - objScreenPtForRadius.y);
        	
        	Draw2D.ellipseCenter(p_objContext, objCenterScreenPt.x, objCenterScreenPt.y, dblRadiusX, dblRadiusY, p_objGeo.angle, p_hDraw);
        	
        	/*{
        		p_hDraw = p_hDraw || p_objContext.stroke;
        		
	        	var circumference = dblRadiusX;
	        	if (dblRadiusY > dblRadiusX)
	    		{
	        		circumference = dblRadiusY;
	    		}
	        	var scaleX = dblRadiusX / circumference;
	        	var scaleY = dblRadiusY / circumference;
	        	
	        	p_objContext.save();
	        	p_objContext.translate(objCenterScreenPt.x, objCenterScreenPt.y);
	        	p_objContext.rotate(p_objGeo.angle);
	        	p_objContext.scale(scaleX, scaleY);
	        	p_objContext.beginPath();
	        	p_objContext.arc(0, 0, circumference, 0, 2 * Math.PI, false);
	        	p_hDraw.call(p_objContext);
	        	p_objContext.restore();
        	}*/
        	
			return;
			
        	/*p_objContext.beginPath();
        	p_objContext.moveTo(objCenterScreenPt.x, objCenterScreenPt.y - dblRadiusY); // A1
        	  
        	p_objContext.bezierCurveTo(
        			objCenterScreenPt.x + dblRadiusX, objCenterScreenPt.y - dblRadiusY, // C1
        			objCenterScreenPt.x + dblRadiusX, objCenterScreenPt.y + dblRadiusY, // C2
        			objCenterScreenPt.x, objCenterScreenPt.y + dblRadiusY); // A2

        	p_objContext.bezierCurveTo(
        			objCenterScreenPt.x - dblRadiusX, objCenterScreenPt.y + dblRadiusY, // C3
        			objCenterScreenPt.x - dblRadiusX, objCenterScreenPt.y - dblRadiusY, // C4
        			objCenterScreenPt.x, objCenterScreenPt.y - dblRadiusY); // A1
        	p_objContext.closePath();
        	p_hDraw.call(p_objContext);
*/
        };
        
        Draw2D._drawMultipointsLine = function(p_objMap, p_objContext, p_objGeo, p_blnIsClosed, p_hDraw)
        {
        	p_hDraw = p_hDraw || p_objContext.stroke;
        	
        	var drawPoints = p_objGeo.getDrawingPoints();

        	if (!drawPoints || !drawPoints.length)
        	    return;
        	
        	var pixPnt = p_objMap.conversionsSvc.toScreen(drawPoints[0].x, drawPoints[0].y);
			        	
        	p_objContext.beginPath();
			p_objContext.moveTo(pixPnt.x, pixPnt.y);
	
			for (var intCurrPt = 1; intCurrPt < drawPoints.length; intCurrPt++)
			{
				pixPnt = p_objMap.conversionsSvc.toScreen(drawPoints[intCurrPt].x, drawPoints[intCurrPt].y);
	
				p_objContext.lineTo(pixPnt.x, pixPnt.y);
			}
			
			if (p_blnIsClosed)
			{
				p_objContext.closePath();
			}
			
			p_hDraw.call(p_objContext);

			/*p_objContext.fillStyle = 'black';
			p_objContext.font = "12pt arial";
			p_objContext.textBaseline = 'top';
			for (var intCurrPt = 0; intCurrPt < drawPoints.length; intCurrPt++) {
			    pixPnt = p_objMap.conversionsSvc.toScreen(drawPoints[intCurrPt].x, drawPoints[intCurrPt].y);

			    p_objContext.fillText(intCurrPt, pixPnt.x + 5, pixPnt.y - 15);
			}*/
        };
        
        /**
         * @method polylineGeometry
		 * Drawing a given polyline geometry on the map
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map to draw on
		 * @param {Object} p_objContext HTML canvas(context) object
         * @param {NeWMI.Geometry.Polyline} p_objGeo The polyline to draw
         * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
         * @static
         */
        Draw2D.polylineGeometry = function(p_objMap, p_objContext, p_objGeo, p_hDraw )
        {
        	Draw2D._drawMultipointsLine(p_objMap, p_objContext, p_objGeo, false, p_objContext.stroke );
        };

        /**
         * @method polygonGeometry
		 * Drawing a given polygon geometry on the map
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map to draw on
		 * @param {Object} p_objContext HTML canvas(context) object
         * @param {NeWMI.Geometry.Polygon} p_objGeo The polygon to draw
         * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
         * @static
         */
        Draw2D.polygonGeometry = function(p_objMap, p_objContext, p_objGeo, p_hDraw )
        {
        	Draw2D._drawMultipointsLine(p_objMap, p_objContext, p_objGeo, true, p_hDraw );
        };

        /**
         * @method rectangleGeometry
		 * Drawing a given rectangle geometry on the map
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map to draw on
		 * @param {Object} p_objContext HTML canvas(context) object
         * @param {NeWMI.Geometry.Rectangle} p_objGeo The rectangle to draw
         * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
         * @static
         */
        Draw2D.rectangleGeometry = function(p_objMap, p_objContext, p_objGeo, p_hDraw)
        {
        	Draw2D._drawMultipointsLine(p_objMap, p_objContext, p_objGeo, true, p_hDraw );
        	
        	/*var objScreenLeftLower = p_objMap.conversionsSvc.toScreen(p_objGeo.getXMin(), p_objGeo.getYMin());
			
			var objScreenRightUpper = p_objMap.conversionsSvc.toScreen(p_objGeo.getXMax(), p_objGeo.getYMax());
			
			p_objContext.strokeRect(	objScreenLeftLower.x, 
					objScreenRightUpper.y, 
								objScreenRightUpper.x - objScreenLeftLower.x, 
								objScreenLeftLower.y - objScreenRightUpper.y);*/
			

        };

         /* -------------- We need to add another astrix for making this method shown in HELP. But there is no arrow so why ? --------------
         * @method arrowGeometry
		 * Drawing a given arrow geometry on the map
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map to draw on
		 * @param {Object} p_objContext HTML canvas(context) object
         * @param {NeWMI.Geometry.Arrow} p_objGeo The arrow to draw
         * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
         * @static
         */
        Draw2D.arrowGeometry = function(p_objMap, p_objContext, p_objGeo, p_hDraw)
        {
        	Draw2D._drawMultipointsLine(p_objMap, p_objContext, p_objGeo, false, p_hDraw);        	
        };
        
        /**
        * @method symbol
        * Drawing a given symbol\text.
        * @param {Object} p_objContext HTML canvas(context) object
        * @param {String} p_chrSymbol The symbol\text to draw
        * @param {Number} x The location - X value
        * @param {Number} y The location - Y value
        * @param {Object} [p_objMetrics=CalculatedMetrics] The metrics of the symbol\text. See NeWMI.Draw.StringSizeCalculator.
        * @static
        */
        Draw2D.symbol = function (p_objContext, p_chrSymbol, x, y, p_objMetrics)
    	{
        	if (!p_objMetrics)
        		p_objMetrics = StringSizeCalculator.getStringMetrics(p_chrSymbol, p_objContext.font);
    		
    		var objOldBaseline 	= p_objContext.textBaseline;
    		
    		p_objContext.textBaseline = 'top';
    		
    		var yOffset = -p_objMetrics.offsetY;
    				
    		if (objOldBaseline == 'bottom')
    		{
    			yOffset -= p_objMetrics.height;
    		}
    		else if (objOldBaseline == 'middle')
    		{
    			yOffset -= p_objMetrics.height / 2;
    		}
    		
    		p_objContext.fillText(p_chrSymbol, x, y + yOffset);
    		
    		p_objContext.textBaseline = objOldBaseline;
    		
    		return p_objMetrics;
    	};
        
        /**
        * @method imageCenter
        * Drawing a given image in the center of the given location.
        * @param {Object} p_objContext HTML canvas(context) object
        * @param {Object} p_objImage HTML Image object
        * @param {Number} x The center location - X value
        * @param {Number} y The center location - Y value
        * @param {Number} [intWidth=p_objImage.width] The wanted drawing image width
        * @param {Number} [intHeight=p_objImage.height] The wanted drawing image height
        * @static
        */
        Draw2D.imageCenter = function(p_objContext, p_objImage, x, y, intWidth, intHeight)
        {
        	intWidth = intWidth || p_objImage.width;
        	intHeight = intHeight || p_objImage.height;
        	p_objContext.drawImage(p_objImage, x - intWidth / 2, y - intHeight / 2, intWidth, intHeight);
        };
        
        /**
        * @method lines
        * Drawing a given lines
        * @param {Object} p_objContext HTML canvas(context) object
        * @param {{x,y}[]} p_arrPts Array of simple points
        * @param {Boolean} [p_blnIsClosed=false] If the set of the points are closed shape or open
        * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
        * @static
        */
    	Draw2D.lines = function(p_objContext, p_arrPts, p_blnIsClosed, p_hDraw)
        {
    		p_hDraw = p_hDraw || p_objContext.stroke;
    		
    		p_objContext.beginPath();
			p_objContext.moveTo(p_arrPts[0].x, p_arrPts[0].y);
	
			for (var intCurrPt = 1; intCurrPt < p_arrPts.length; intCurrPt++)
			{
				p_objContext.lineTo(p_arrPts[intCurrPt].x, p_arrPts[intCurrPt].y);
			}
			
			if (p_blnIsClosed)
			{
				p_objContext.closePath();
			}
			
			p_hDraw.call(p_objContext);
        };
        
        /**
        * @method ellipseCenter
        * Drawing en ellipse in the given center and radiuses
        * @param {Object} p_objContext HTML canvas(context) object
        * @param {Number} p_dblCenterX The center of the ellipse - X Value
        * @param {Number} p_dblCenterY The center of the ellipse - Y Value
        * @param {Number} p_dblRadiusX The horizontal radius
        * @param {Number} p_dblRadiusY The vertical radius
        * @param {Number} p_dblAngle The angle of the ellipse - In Radians - ClockWise
        * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
        * @static
        */
        Draw2D.ellipseCenter = function (p_objContext, p_dblCenterX, p_dblCenterY, p_dblRadiusX, p_dblRadiusY, p_dblAngle, p_hDraw) 
        {
        	Draw2D.ellipse(p_objContext, p_dblCenterX - p_dblRadiusX, p_dblCenterY - p_dblRadiusY, p_dblRadiusX * 2, p_dblRadiusY * 2, p_dblAngle, p_hDraw);
        };

        /**
        * @method ellipse
        * Drawing en ellipse in the given bound rectangle
        * @param {Object} p_objContext HTML canvas(context) object
        * @param {Number} p_dblX The left value of the ellipse
        * @param {Number} p_dblY The top value of the ellipse
        * @param {Number} p_dblWidth The width of the ellipse
        * @param {Number} p_dblHeight The height of the ellipse
        * @param {Number} p_dblAngle The angle of the ellipse - In Radians - ClockWise
        * @param {Function} [p_hDraw=function(){this.stroke();}] The draw function. When we want to combine some fill and stroke actions together, or just fill
        * @static
        */
        Draw2D.ellipse = function (p_objContext, p_dblX, p_dblY, p_dblWidth, p_dblHeight, p_dblAngle, p_hDraw) 
    	{
        	p_hDraw = p_hDraw || p_objContext.stroke;
        	p_dblAngle = p_dblAngle || 0;
        	
        	if (p_dblAngle)
        	{
        		p_objContext.save();
        		p_objContext.translate(p_dblX + p_dblWidth / 2, p_dblY + p_dblHeight/2);
        		p_objContext.rotate(p_dblAngle);
        		p_dblX = -p_dblWidth / 2;
        		p_dblY = -p_dblHeight / 2;
        	}

        	var kappa = .5522848,
        	ox = (p_dblWidth / 2) * kappa, 		// control point offset horizontal
        	oy = (p_dblHeight / 2) * kappa, 		// control point offset vertical
        	xe = p_dblX + p_dblWidth,   	// p_dblX-end
        	ye = p_dblY + p_dblHeight,  	// p_dblY-end
        	xm = p_dblX + p_dblWidth / 2,  	// p_dblX-middle
        	ym = p_dblY + p_dblHeight / 2; 	// p_dblY-middle

        	p_objContext.beginPath();
        	p_objContext.moveTo(p_dblX, ym);
        	p_objContext.bezierCurveTo(p_dblX, ym - oy, xm - ox, p_dblY, xm, p_dblY);
        	p_objContext.bezierCurveTo(xm + ox, p_dblY, xe, ym - oy, xe, ym);
        	p_objContext.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        	p_objContext.bezierCurveTo(xm - ox, ye, p_dblX, ym + oy, p_dblX, ym);
        	p_objContext.closePath();

        	p_hDraw.call(p_objContext);
        	
        	if (p_dblAngle)
        	{      	
        		p_objContext.restore();
        	}
        };

        /**
        * @method startMask
        * Preparing the context to work with mask. Before starting using mask we need to save the context state, and restore it when finished.
        * @param {Object} p_objContext HTML canvas(context) object
        * @static
        */
        Draw2D.startMask = function (p_objContext) {
            // Must be clock wise
            p_objContext.beginPath();
            p_objContext.moveTo(0, 0);
            p_objContext.lineTo(p_objContext.canvas.width, 0);
            p_objContext.lineTo(p_objContext.canvas.width, p_objContext.canvas.height);
            p_objContext.lineTo(0, p_objContext.canvas.height);
            p_objContext.lineTo(0, 0);
        }

        /**
        * @method addToMask
        * Adding a given rectangle to the mask
        * @param {Object} p_objContext HTML canvas(context) object
        * @param {Number} p_dblX The left value of the rectangle
        * @param {Number} p_dblY The top value of the rectangle
        * @param {Number} p_dblWidth The width of the rectangle
        * @param {Number} p_dblHeight The height of the rectangle
        * @static
        */
        Draw2D.addToMask = function (p_objContext, p_dblX, p_dblY, p_dblWidth, p_dblHeight) {

            // Must be counter clock wise - for hole
            p_objContext.moveTo(p_dblX, p_dblY);
            p_objContext.lineTo(p_dblX, p_dblY + p_dblHeight);
            p_objContext.lineTo(p_dblX + p_dblWidth, p_dblY + p_dblHeight);
            p_objContext.lineTo(p_dblX + p_dblWidth, p_dblY);
            p_objContext.lineTo(p_dblX, p_dblY);
        }

        /**
        * @method setMask
        * Setting the mask. After this method all our drawing will be clipped with the mask we created.
        * @static
        */
        Draw2D.setMask = function (p_objContext) {
            p_objContext.clip();
        }

        /**
        * @method styled
        * Drawing a styled geometry
        * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map to draw on
		* @param {Object} p_objContext HTML canvas(context) object
        * @param {NeWMI.Geometry.Base.AGeometry} p_objGeometry The geometry to draw
        * @param {NeWMI.Draw.Styles.Geometry.AGeoStyle} p_objStyle The style of the geometry
        * @static
        */
        Draw2D.styled = function (p_objMap, p_objContext, p_objGeometry, p_objStyle) {

            if (p_objStyle instanceof NeWMI.Draw.Styles.Geometry.Fill.AFillStyle) {
                p_objStyle.drawGeometry(p_objMap, p_objContext, p_objGeometry);
            }
            else {

                var objScreenPts = Draw2D._convertToScreen(p_objMap, p_objGeometry.getDrawingPoints());

                p_objStyle.draw(p_objContext, objScreenPts, p_objGeometry.GeoType == NeWMI.Geometry.Base.AGeometry.EGeometryType.Polygon);
            }
        }

        Draw2D._convertToScreen = function (p_objMap, p_arrPts) {

            var arrScreenPts = [];
            p_arrPts.forEach(function (item) {
                arrScreenPts.push(p_objMap.conversionsSvc.toScreen(item.x, item.y));
            }, this);

            return arrScreenPts;
        }

        /**
        * @method rotateAtPoint
        * Rotating the context for rotating drawings
		* @param {Object} p_objContext HTML canvas(context) object
        * @param {Number} p_dblX The pivot to rotate around - X Value
        * @param {Number} p_dblY The pivot to rotate around - Y Value
        * @param {Number} p_dblAngle The angle to rotate - In Radians - ClockWise
        * @static
        */
        Draw2D.rotateAtPoint = function (p_objContext, p_dblX, p_dblY, p_dblAngle) {
            p_objContext.translate(p_dblX, p_dblY);
            p_objContext.rotate(p_dblAngle);
            p_objContext.translate(-p_dblX, -p_dblY);
        }

        /**
        * @method setContextParams
        * Setting the context with the given parameters
		* @param {Object} p_objContext HTML canvas(context) object
        * @param {Object} p_objParams Contains the properties as they are in the context 2d (Canvas), and their values
        * @static
        */
        Draw2D.setContextParams = function (p_objContext, p_objParams) {
            for (var strCurrAttributte in p_objParams) {
                p_objContext[strCurrAttributte] = p_objParams[strCurrAttributte];
            }
        };
    	
        return Draw2D;
});
