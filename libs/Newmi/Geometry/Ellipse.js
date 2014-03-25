/**
* @class NeWMI.Geometry.Ellipse
* <p>Represents NeWMI Ellipse geometry</p>
* @extends NeWMI.Geometry.Polygon
* <pre><code>
* var myEllipse = new NeWMI.Geometry.Ellipse( { x: 11, y: 43, xRadius: 20, yRadius: 3 } );
* </code></pre>
*/
define(["dojo/_base/declare",
        "NeWMI/Geometry/Polygon", 
        "NeWMI/Geometry/Base/AGeometry", 
        "NeWMI/Geometry/Rectangle",
        "NeWMI/Geometry/Point",
        "NeWMI/Service/Math/InfoSvc",
        "NeWMI/Service/Create/ArcSvc",
        "NeWMI/Service/Math/RelationalOp", ],
        function(declare, 
        		Polygon, 
        		AGeometry, 
        		Rectangle,
        		Point,
                InfoSvc,
        		ArcSvc,
                RelationalOp)
{ 
	return declare("NeWMI.Geometry.Ellipse", Polygon,
	{ 
	
		GeoType: AGeometry.EGeometryType.Ellipse,
		
	    /**
        * @constructor
        * Creates new ellipse instance
        * @param {Object} [p_objInitData] The ellipse initial parameters
        * @param {number} [p_objInitData.x] The X center value of the ellipse (Map units)
        * @param {number} [p_objInitData.y] The Y center value of the ellipse (Map units)
        * @param {number} [p_objInitData.xRadius] The horizontal radius of the ellipse (Map units)
        * @param {number} [p_objInitData.yRadius] The vertical radius of the ellipse (Map units)
        * @param {number} [p_objInitData.angle] The rotation of the geometry (The direction of the angle is clockwise in radians)
        */
		constructor: function (p_objInitData)
		{

		    if (arguments.length > 1) {
		        alert("Ellipse");
		    }


		    p_objInitData = p_objInitData || {};

		    /**
            * @property {number} x
            * The ellipse center location - X value (Map units)
            */
		    this.x = p_objInitData.x;
		    /**
            * @property {number} y
            * The ellipse center location - X value (Map units)
            */
		    this.y = p_objInitData.y;
		    /**
            * @property {number} xRadius
            * The ellipse horizontal radius (Map units)
            */
		    this.xRadius = p_objInitData.xRadius;
		    /**
            * @property {number} yRadius
            * The ellipse vertical radius (Map units)
            */
		    this.yRadius = p_objInitData.yRadius;
		    this.angle = p_objInitData.angle || 0;
			//this.points = NeWMI.Service.Create.ArcSvc.GetEllipsePoints(this.x, this.y, this.xRadius, this.yRadius, this.angle, 30);
		},

		clone: function()
		{
		    var objClonedGeo = new NeWMI.Geometry.Ellipse({
		        "x": this.x,
		        "y": this.y,
		        "xRadius": this.xRadius,
		        "yRadius": this.yRadius
		    });
			
			objClonedGeo._copyBaseProperties(this);
			
			return objClonedGeo;
		},
		
		_createPresentationPoint : function()
		{
		    return { "x": this.x, "y": this.y };
		},
		
		_createGeometryEnvelope : function()
		{
		    var rect = InfoSvc.getEllipseBoundBox(this.x, this.y, this.xRadius, this.yRadius, this.angle);

		    return new Rectangle({
		        "xCenter": this.x,
		        "yCenter": this.y,
		        "width": rect.width,
		        "height": rect.height
		    });
		},

		hitTest: function (p_objMap, p_objPnt) {


		    var objResult = InfoSvc.getClosestPointToEllipse(p_objPnt.x,
					p_objPnt.y,
					this.x,
		            this.y,
		            this.xRadius,
		            this.yRadius,
		            this.angle);


		    var dblToleranceMap = p_objMap.conversionsSvc.toMapSize(NeWMI.defaults.hitTolerance);

		    // Closer to the radius
		    if (objResult.distance < dblToleranceMap) {
		        var objHitResult = new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.boundary });
		        objHitResult._hitPoint = p_objPnt;
		        objHitResult._xRadius = this.xRadius;
		        objHitResult._yRadius = this.yRadius;

		        // In case the geometry is rotated - instead of do allot of calculation different we are just manipulate the pressed point
		        var objNewMapPnt = InfoSvc.getPointAfterRotation(this.getPresentationPoint(), p_objPnt, Math.PI / 2 - this.angle);

		        objHitResult._factorX = objNewMapPnt.x > this.x ? 1 : -1;
		        objHitResult._factorY = objNewMapPnt.y > this.y ? 1 : -1;

		        return objHitResult;
		    }
		        // Closer to the center point 
		    else {
		        if (RelationalOp.isPointInEllipse(p_objPnt.x,
													p_objPnt.y,
													this.x,
										            this.y,
										            this.xRadius,
										            this.yRadius,
										            this.angle)) {
		            var objHitResult = new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.content });

		            objHitResult._offsetFromCenter = { "x": this.x - p_objPnt.x, "y": this.y - p_objPnt.y };

		            return objHitResult;
		        }
		    }

		    return new AGeometry.HitTestResult();
		}
	});
});