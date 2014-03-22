define(["dojo/_base/declare", "NeWMI/Geometry/Point"], function(declare, Point){
	
	var ConversionsSvc = declare("NeWMI.Service.Math.ConversionsSvc", null, {});

	ConversionsSvc._radianDegreeConvValue = Math.PI / 180;
	
	ConversionsSvc.toRadians = function(p_dblDegree)
	{
		return p_dblDegree * ConversionsSvc._radianDegreeConvValue;
	};

	ConversionsSvc.toDegree = function(p_dblRadian)
	{
		return p_dblRadian / ConversionsSvc._radianDegreeConvValue;
	};
	
	ConversionsSvc.ToGeographic = function(x, y)
	{
	    if (Math.abs(x) < 180 && Math.abs(y) < 90)
	        return;

	    if ((Math.abs(x) > 20037508.3427892) || (Math.abs(y) > 20037508.3427892))
	        return;

	    var x = x;
	    var y = y;
	    var num3 = x / 6378137.0;
	    var num4 = num3 * 57.295779513082323;
	    var num5 = Math.floor((num4 + 180.0) / 360.0);
	    var num6 = num4 - (num5 * 360.0);
	    var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
	    x = num6;
	    y = num7 * 57.295779513082323;
	    
	    return { "x": x, "y": y };
	};

	ConversionsSvc.ToWebMercator = function (x, y)
	{
	    if ((Math.abs(x) > 180 || Math.abs(y) > 90))
	        return;

	    var num = x * 0.017453292519943295;
	    var x = 6378137.0 * num;
	    var a = y * 0.017453292519943295;

	    x = x;
	    y = 3189068.5 * Math.Log((1.0 + Math.Sin(a)) / (1.0 - Math.Sin(a)));
	    
	    return { "x": x, "y": y };
	};
	
	return ConversionsSvc;
});