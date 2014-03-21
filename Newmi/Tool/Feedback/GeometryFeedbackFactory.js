define([ "dojo/_base/declare", 
         "NeWMI/Geometry/Base/AGeometry", 
         "NeWMI/Tool/Feedback/PointFeedback",
         "NeWMI/Tool/Feedback/PolyFeedback",
         "NeWMI/Tool/Feedback/RectangleFeedback",
         "NeWMI/Tool/Feedback/CircleFeedback",
         "NeWMI/Tool/Feedback/EllipseFeedback",
         "NeWMI/Tool/Feedback/ArrowFeedback"], 
         
         function(declare, 
        		 AGeometry, 
        		 PointFeedback,
        		 PolyFeedback,
        		 RectangleFeedback,
        		 CircleFeedback,
        		 EllipseFeedback,
        		 ArrowFeedback) 
{	
	var GeometryFeedbackFactory = declare("NeWMI.Tool.Feedback.GeometryFeedbackFactory", null, {} ); 
	
	GeometryFeedbackFactory.create = function(p_objMap, p_objGeo)
	{
		var objGeo = null;
		var eGeoType = p_objGeo;
		if (p_objGeo instanceof AGeometry)
		{
			objGeo = p_objGeo;
			eGeoType = p_objGeo.GeoType;
		}
		
		switch (eGeoType)
    	{
    		case AGeometry.EGeometryType.Point:
    		{
    			return new PointFeedback(p_objMap, objGeo, eGeoType);
    		}
    		break;
    		case AGeometry.EGeometryType.Polyline:
    		{
    			return new PolyFeedback(p_objMap, objGeo, eGeoType);
    		}
    		case AGeometry.EGeometryType.Polygon:
    		{
    			return new PolyFeedback(p_objMap, objGeo, eGeoType);
    		}
    		break;
    		case AGeometry.EGeometryType.Rectangle:
    		{
    			return new RectangleFeedback(p_objMap, objGeo, eGeoType);
    		}
    		break;
    		case AGeometry.EGeometryType.Circle:
    		{
    			return new CircleFeedback(p_objMap, objGeo, eGeoType);
    		}
    		break;
    		case AGeometry.EGeometryType.Ellipse:
    		{
    			return new EllipseFeedback(p_objMap, objGeo, eGeoType);
    		}
    		break;
    		case AGeometry.EGeometryType.Arrow:
    		{
    			return new ArrowFeedback(p_objMap, objGeo, eGeoType);
    		}
    		break;
    	}
		
		return null;
	};
	
	return GeometryFeedbackFactory;
});