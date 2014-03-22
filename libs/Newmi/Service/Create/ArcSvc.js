define(["dojo/_base/declare", "NeWMI/Modules/GeometryModule", "NeWMI/Service/Math/ConversionsSvc"], function(declare, Geometry, ConversionsSvc)
{
	var ArcSvc = declare("NeWMI.Service.Create.ArcSvc", null, {});
	
	ArcSvc.getEllipsePoints = function (p_dblCenterX, p_dblCenterY, p_dblRadiusX, p_dblRadiusY, p_dblAngle, p_intPntCount)
	{
		p_dblAngle = ConversionsSvc.toRadians(p_dblAngle);
		
		var points = [];
		var dblSteps = 2 * Math.PI / p_intPntCount;
		
		for (var i = 0 * Math.PI; i < 2 * Math.PI; i += dblSteps ) 
		{
		    var xPos = p_dblCenterX - (p_dblRadiusX * Math.sin(i)) * Math.sin(p_dblAngle * Math.PI) + (p_dblRadiusY * Math.cos(i)) * Math.cos(p_dblAngle * Math.PI);
		    var yPos = p_dblCenterY + (p_dblRadiusY * Math.cos(i)) * Math.sin(p_dblAngle * Math.PI) + (p_dblRadiusX * Math.sin(i)) * Math.cos(p_dblAngle * Math.PI);
		    
		    points.push({ x: xPos, y: yPos });
		}
		
		return points;
	};
});