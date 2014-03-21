define(["dojo/_base/declare",  
        "NeWMI/Service/Math/RelationalOp", 
        "NeWMI/Modules/GeometryModule",
        "NeWMI/Geometry/Point"],
        function(declare, 
        		RelationalOp,
        		Geometry,
                Point)
{
	var RelationalOpGeo = declare("NeWMI.Service.Math.RelationalOpGeo", null, {});

	RelationalOpGeo.isPointInRectangle = function (p_objPnt, p_objRect)
	{
	    return RelationalOp.isPointInRectangle(p_objPnt.x, p_objPnt.y,
            p_objRect.getXMin(),
            p_objRect.getYMin(),
            p_objRect.getXMax(),
            p_objRect.getYMax());
	};
	
	
	RelationalOpGeo.isRectanglesIntersected = function (p_objRect1, p_objRect2, p_blnIncludeFullContaining, p_blnCheckBounds)
	{
	    return RelationalOp.isPolygonsIntersect(p_objRect1.getPoints(), p_objRect2.getPoints(), p_blnIncludeFullContaining, p_blnCheckBounds, p_blnCheckBounds ? { sourceBounds: p_objRect1.getEnvelope().getRect(), queryBounds: p_objRect2.getEnvelope().getRect() } : null);
	};
	
	RelationalOpGeo.isPointInPolygon = function(p_objPoint, p_objPolygon)
	{
	    return RelationalOp.isPointInPolygon(p_objPoint, p_objPolygon.getPoints());
	};
	
	RelationalOpGeo.isRectangleIntersectsPolygon = function (p_objRect, p_objPolygon, p_blnIncludeFullContaining, p_blnCheckBounds)
	{
	    return RelationalOp.isPolygonsIntersect(p_objRect.getPoints(), p_objPolygon.getPoints(), p_blnIncludeFullContaining, p_blnCheckBounds, p_blnCheckBounds ? { sourceBounds: p_objRect1.getEnvelope().getRect(), queryBounds: p_objRect2.getEnvelope().getRect() } : null);
	};
	
	RelationalOpGeo.isPolylineIntersectsRectangle = function (p_objPolyline, p_objRect, p_blnIncludeFullContaining)
	{
	    return RelationalOp.isPolylineIntersectsRectangle(p_objPolyline.getPoints(), p_objRect.getXMin(), p_objRect.getYMin(),
            p_objRect.getXMax(), p_objRect.getYMax(), p_blnIncludeFullContaining);
	};
	
	RelationalOpGeo.isRectangleIntersectsEllipse = function(p_objRect, p_objEllipse)
	{
		return RelationalOp.isRectangleIntersectsEllipse(p_objRect.getXMin(), 
															p_objRect.getYMin(), 
															p_objRect.getXMax(),
															p_objRect.getYMax(), 
															p_objEllipse.x, 
															p_objEllipse.y, 
															p_objEllipse.xRadius,
															p_objEllipse.yRadius, 
															p_objEllipse.angle, true);
	};
	
	RelationalOpGeo.isRectangleIntersectsCircle = function(p_objRect, p_objCircle)
	{
		return RelationalOp.isRectangleIntersectsEllipse(p_objRect.getXMin(), 
															p_objRect.getYMin(), 
															p_objRect.getXMax(),
															p_objRect.getYMax(), 
															p_objCircle.x, 
															p_objCircle.y, 
															p_objCircle.radius,
															p_objCircle.radius, 
															p_objCircle.angle, true);
	};
	

    /// <summary>
    /// Method finds (x,y) coordinates of a point which is closest to a given point and is situated on a given line.
    /// </summary>
    /// <param name="p_objPoint">3rd point</param>    
    /// <param name="p_objFromPoint">1rd point which defines line</param>    
    /// <param name="p_objToPoint">2nd point which defines line</param>        
	RelationalOpGeo.getClosestPointOnLineFromPoint = function (p_objPoint,
                                                        p_objFromPoint,
                                                        p_objToPoint) {
	    
	    var objRes = RelationalOp.getClosestPointOnLineFromPoint(p_objPoint.x, p_objPoint.y,
                                                        p_objFromPoint.x, p_objFromPoint.y,
                                                        p_objToPoint.x, p_objToPoint.y);

	    return {
	        "x": objRes.x,
	        "y": objRes.y
	    };
	};

	
	return RelationalOpGeo;
});