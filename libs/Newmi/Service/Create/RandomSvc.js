/**
* @class NeWMI.Service.Create.RandomSvc
* Provides services for creating random values. such as strings, guid, geometries,...
* @static
*/
define(["dojo/_base/declare", "NeWMI/Modules/GeometryModule", "NeWMI/Service/Math/ConversionsSvc"], function (declare, Geometry, ConversionsSvc)
{
	var RandomSvc = declare("NeWMI.Service.Create.RandomSvc", null, {});
	
	RandomSvc._s4 = function() 
	{
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	};
	
    /**
    * @method guid
    * Generating random guid string
    * @return {String} Random guid string
    * @static
    */
	RandomSvc.guid = function() 
	{
		return RandomSvc._s4() + RandomSvc._s4() + '-' + RandomSvc._s4() + '-' + RandomSvc._s4() + '-' +
			   RandomSvc._s4() + '-' + RandomSvc._s4() + RandomSvc._s4() + RandomSvc._s4();	
	};
	
    /**
    * @method createRandomText
    * Generating random text
    * @param {Number} pIntCharsCount The length of the random string
    * @param {Number} [pIntStartChar=97] The first character to random from
    * @param {Number} [pIntEndChar=127] The last character to random from
    * @return {String} Random text
    * @static
    */
	RandomSvc.createRandomText = function(pIntCharsCount, pIntStartChar, pIntEndChar)
	{
		pIntStartChar = pIntStartChar ? pIntStartChar : 97;
		pIntEndChar = pIntEndChar ? pIntEndChar : 127;
		
		var intCharsCount;
		if (pIntCharsCount == null) intCharsCount = Math.floor( Math.random() * 10) + 1; else intCharsCount = pIntCharsCount;
		
		var strText = '';
		for (var i=0; i < intCharsCount; ++i)
		{
			strText += String.fromCharCode(Math.floor(Math.random() * (pIntEndChar-pIntStartChar)) + pIntStartChar);
		}
		
		return strText;
	};

	RandomSvc.getRandomGeoType = function (pExcludeTypesArray)
	{
	    if (!pExcludeTypesArray)
	    {
	        pExcludeTypesArray = [];
	    }
	    var RandomGeos = [];
	    for (var geoTypeName in NeWMI.Geometry.Base.AGeometry.EGeometryType)
	    {
	        if (NeWMI.Geometry.Base.AGeometry.EGeometryType.hasOwnProperty(geoTypeName))
	        {
	            var geoTypeVal = NeWMI.Geometry.Base.AGeometry.EGeometryType[geoTypeName];
	            if (geoTypeVal != 0 && pExcludeTypesArray.indexOf(geoTypeName) == -1 && pExcludeTypesArray.indexOf(geoTypeVal) == -1)
	            {
	                RandomGeos.push(geoTypeVal);
	            }
	        }
	    }
	    return RandomGeos[Math.floor(Math.random() * RandomGeos.length)];
	};
	
    /**
    * @method createRandomPntGeo
    * Generating random located point
    * @param {NeWMI.Geometry.Rectangle} [p_objExtent=new NeWMI.Geometry.Rectangle({ xmin: -180, xmax: 180, ymin: -90, ymax: 90 }] The area to random the point
    * @return {NeWMI.Geometry.Point} Random point geometry
    * @static
    */
	RandomSvc.createRandomPntGeo = function(p_objExtent)
	{
		// In case we got empty member
	    p_objExtent = p_objExtent ||
            new NeWMI.Geometry.Rectangle({ xmin: -180, xmax: 180, ymin: -90, ymax: 90 });
		
	    var dblWidth = p_objExtent.getXMax() - p_objExtent.getXMin();
	    var dblHeight = p_objExtent.getYMax() - p_objExtent.getYMin();
		
	    var x = Math.random() * dblWidth + p_objExtent.getXMin();
	    var y = Math.random() * dblHeight + p_objExtent.getYMin();
		
		return new NeWMI.Geometry.Point({ "x": x, "y": y });
	};
	
    /**
    * @method createRandomPolylineGeo
    * Generating random located polyline
    * @param {{x,y}} [p_objCenterPnt=RandomSvc.createRandomPntGeo()] The center of the polyline
    * @param {Number} [p_dblMaxRadius=Math.random() * 10] The size of the polyline
    * @param {Number} [p_intPntCount=10] The polyline points
    * @return {NeWMI.Geometry.Polyline} Random polyline geometry
    * @static
    */
	RandomSvc.createRandomPolylineGeo = function(p_objCenterPnt, p_dblMaxRadius, p_intPntCount)
	{
		// In case we got empty member
		p_objCenterPnt = p_objCenterPnt || RandomSvc.createRandomPntGeo();
		p_dblMaxRadius = p_dblMaxRadius || Math.random() * 10;
		p_intPntCount = p_intPntCount || 10;
		
		var objNewPolyline = new NeWMI.Geometry.Polyline();
		
		var intSteps = 360 / p_intPntCount;
		
		for (var intCurrAngle = 0; intCurrAngle < 360; intCurrAngle += intSteps)
		{
			var dblRadAngle = ConversionsSvc.toRadians(intCurrAngle);
			var x = Math.random() * p_dblMaxRadius * Math.cos(dblRadAngle) + p_objCenterPnt.x;
			var y = Math.random() * p_dblMaxRadius * Math.sin(dblRadAngle) + p_objCenterPnt.y;
			
			objNewPolyline.points.push({ "x": x, "y": y });
		}
		
		return objNewPolyline;
	};
	
	RandomSvc.createRandomArrowGeo = function(p_objCenterPnt, p_dblMaxRadius, p_intPntCount)
	{
		// In case we got empty member 
		p_objCenterPnt = p_objCenterPnt || RandomSvc.createRandomPntGeo();
		p_dblMaxRadius = p_dblMaxRadius || Math.random() * 1;
		p_intPntCount = p_intPntCount || 5;
		
		var objNewPolyline = new NeWMI.Geometry.Polyline();
		
		var intSteps = 360 / p_intPntCount;
		
		for (var intCurrAngle = 0; intCurrAngle < 360; intCurrAngle += intSteps)
		{
			var dblRadAngle = ConversionsSvc.toRadians(intCurrAngle);
			var x = Math.random() * p_dblMaxRadius * Math.cos(dblRadAngle) + p_objCenterPnt.x;
			var y = Math.random() * p_dblMaxRadius * Math.sin(dblRadAngle) + p_objCenterPnt.y;
			
			objNewPolyline.points.push({ "x": x, "y": y });
		}
		
		//var bodyWidth = p_objMap.ConversionsSvc.metersToGeo(p_objCenterPnt.x,p_objCenterPnt.y,5000);
		//var headWidth = p_objMap.ConversionsSvc.metersToGeo(p_objCenterPnt.x,p_objCenterPnt.y,8000);
		//var headHeight = p_objMap.ConversionsSvc.metersToGeo(p_objCenterPnt.x,p_objCenterPnt.y,5000);
		
		var bodyWidth = 0.08;
		var headWidth = 0.12;
		var headHeight = 0.06;
		
		var objArrow = new NeWMI.Geometry.Arrow({ points: objNewPolyline.points, arrowType: "ArrowLanePath", bodyWidth: bodyWidth, bodyExtension: 0, headWidth: headWidth, headHeight: headHeight });
		
		return objArrow ;
	};
	
    /**
    * @method createRandomPolygonGeo
    * Generating random located polygon
    * @param {{x,y}} [p_objCenterPnt=RandomSvc.createRandomPntGeo()] The center of the Polygon
    * @param {Number} [p_dblMaxRadius=Math.random() * 10] The size of the Polygon
    * @param {Number} [p_intPntCount=10] The Polygon points
    * @return {NeWMI.Geometry.Polygon} Random Polygon geometry
    * @static
    */
	RandomSvc.createRandomPolygonGeo = function(p_objCenterPnt, p_dblMaxRadius, p_intPntCount)
	{
		var objPolyline = RandomSvc.createRandomPolylineGeo(p_objCenterPnt, p_dblMaxRadius, p_intPntCount);
		
		var objPolygon = new NeWMI.Geometry.Polygon();
		objPolygon.points = objPolyline.points;
		
		return objPolygon;
	};
	
    /**
    * @method createRandomEllipseGeo
    * Generating random located ellipse
    * @param {{x,y}} [p_objCenterPnt=RandomSvc.createRandomPntGeo()] The center of the ellipse
    * @param {Number} [p_dblMaxRadiusX=Math.random() * 5] The maximum horizontal radius of the ellipse
    * @param {Number} [p_dblMaxRadiusY=Math.random() * 5] The maximum vertical radius of the ellipse
    * @return {NeWMI.Geometry.Ellipse} Random ellipse geometry
    * @static
    */
	RandomSvc.createRandomEllipseGeo = function(p_objCenterPnt, p_dblMaxRadiusX, p_dblMaxRadiusY)
	{
		p_objCenterPnt = p_objCenterPnt || RandomSvc.createRandomPntGeo();
		p_dblMaxRadiusX = p_dblMaxRadiusX || Math.random() * 5;
	    p_dblMaxRadiusY = p_dblMaxRadiusY || Math.random() * 5;

		return new NeWMI.Geometry.Ellipse({
		    "x": p_objCenterPnt.x,
		    "y": p_objCenterPnt.y,
		    "xRadius": p_dblMaxRadiusX,
		    "yRadius": p_dblMaxRadiusY
		});
	};
	
    /**
    * @method createRandomCircleGeo
    * Generating random located circle
    * @param {{x,y}} [p_objCenterPnt=RandomSvc.createRandomPntGeo()] The center of the circle
    * @param {Number} [p_dblMaxRadius=Math.random() * 5] The maximum radius of the circle
    * @return {NeWMI.Geometry.Circle} Random circle geometry
    * @static
    */
	RandomSvc.createRandomCircleGeo = function(p_objCenterPnt, p_dblMaxRadius)
	{
		p_objCenterPnt = p_objCenterPnt || RandomSvc.createRandomPntGeo();
		p_dblMaxRadius = p_dblMaxRadius || Math.random() * 5;
		
		return new NeWMI.Geometry.Circle({
		    "x": p_objCenterPnt.x,
		    "y": p_objCenterPnt.y,
		    "radius": p_dblMaxRadius
		});
	};
	
    /**
    * @method createRandomRectangleGeo
    * Generating random located rectangle
    * @param {{x,y}} [p_objCenterPnt=RandomSvc.createRandomPntGeo()] The center of the rectangle
    * @param {Number} [p_dblMaxWidth=Math.random() * 15] The maximum width of the rectangle
    * @param {Number} [p_dblMaxHeight=Math.random() * 15] The maximum height radius of the rectangle
    * @return {NeWMI.Geometry.Rectangle} Random rectangle geometry
    * @static
    */
	RandomSvc.createRandomRectangleGeo = function(p_objCenterPnt, p_dblMaxWidth, p_dblMaxHeight)
	{
		p_objCenterPnt = p_objCenterPnt || RandomSvc.createRandomPntGeo();
		var dblWidth = (p_dblMaxWidth || Math.random() * 15);
		var dblHeight = (p_dblMaxHeight || Math.random() * 15);
		
		return new NeWMI.Geometry.Rectangle({
		    xCenter: p_objCenterPnt.x, yCenter: p_objCenterPnt.y,
		    width: dblWidth, height: dblHeight
		});
	};
	
    /**
    * @method createRandomColor
    * Generating random color
    * @return {String} Random color
    * @static
    */
	RandomSvc.createRandomColor = function () 
	{
        return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	};

    /**
    * @method createRandomColorRGBA
    * Generating random color
    * @param {{r,g,b,a}} [params] The color values we want to set.
    * @return {String} Random color
    * @static
    */
	RandomSvc.createRandomColorRGBA = function (params) {
	    params = params || {};
	    var r = params.r || Math.floor(Math.random() * 255);
	    var g = params.g || Math.floor(Math.random() * 255);
	    var b = params.b || Math.floor(Math.random() * 255);
	    var a = params.a || Math.random();
	    return 'rgba(' + r + ', ' + g + ',' + b + ',' + a + ')';
	}
	
	return RandomSvc;
});