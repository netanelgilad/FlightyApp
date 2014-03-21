/**
* @class NeWMI.Geometry.Base.AGeometry
* <p>Represents abstract NeWMI Geometry. All NeWMI geometries extends this object</p>
* The object holds common properties to all geometry's types.
* @abstract
*/
define(["dojo/_base/declare"], function (declare) {

	var AGeometry = declare("NeWMI.Geometry.Base.AGeometry", null, 
	{
	    /**
        * @property {NeWMI.Geometry.Base.AGeometry.EGeometryType} GeoType
        * The geometry Type
        */
	    GeoType: 0,

	    constructor : function ()
	    {
	    	this._geometryEnvelope = null;
	    	this._geometryPresentationPoint = null;

	        /**
            * @property {number} [angle=0]
            * The angle of the geometry - The direction is clockwise and the units are in radians
            */
	    	this.angle = 0;
	    },
	    
   
	    /**
         * @method clone
		 * Returning a cloned geometry
         *
		 * @return {NeWMI.Geometry.Base.AGeometry} The cloned geometry
		 */
	    clone: function ()
	    {
	    	return null;
	    },
	    
	    _copyBaseProperties : function (p_objGeo)
	    {
	    	this.angle = p_objGeo.angle;
	    },
	
	    /**
        * @method getEnvelope
		* Returns the envelope of the geometry
        * @param {boolean} [p_blnClone=false] Send true when we want to get a duplicate of the envelope and not the cached one
		* @return {NeWMI.Geometry.Rectangle} The geometry envelope
        * <pre><code>
        * // Gets the rectangle geometry represents the boundaries of the polygon
        * var myPolygonBoundsRectangle = myPoly.getEnvelope();
        * // Gets the rectangle simple object from the rectangle geometry - Some methods requires this simple object
        * var myPolygonBoundsSimpleRectObject = myPolygonBoundsRectangle.getRect();
        * </code></pre>
		*/
		getEnvelope : function(p_blnClone)
		{
			if (this._geometryEnvelope == null)
			{
				this._geometryEnvelope = this._createGeometryEnvelope();
			}
			
			var objRetVal = this._geometryEnvelope;
			if (p_blnClone)
			{
				objRetVal = objRetVal.clone();
			}
			
			return objRetVal;
		},
		
	    /**
         * @method dataChanged
		 * Tells the geometry that one of its attributes has changed
		 */
		dataChanged : function()
		{
			this._geometryEnvelope = null;
			this._geometryPresentationPoint = null;
		},
		
	    /**
         * @method getPresentationPoint
		 * Return the presentation point of the geometry. Every geometry has a single point which represents the its location. 
		 * @return {NeWMI.Geometry.Point} The geometry presentation point
		 */
		getPresentationPoint : function()
		{
			if (this._geometryPresentationPoint == null)
			{
				this._geometryPresentationPoint = this._createPresentationPoint();
			}
			
			return this._geometryPresentationPoint;
		},
		
	    /**
         * @method getAngleDegree
         * Return the geometry rotation angle in Degrees
         * @return {number} The geometry rotation angle in Degrees
         */
		getAngleDegree : function()
		{
			return this.angle  / (Math.PI / 180); 
		},
		
	    /**
         * @method setAngleDegree
         * Sets the geometry rotation angle in Degrees
         * @param {number} p_dblDegree The angle to set - in degrees
         */
		setAngleDegree : function(p_dblDegree)
		{
		    this.setAngle(p_dblDegree * (Math.PI / 180));
		},
		
	    /**
         * @method setAngle
         * Sets the geometry rotation angle in Radians
         * @param {number} p_dblDegree The angle to set - in radians
         */
		setAngle : function (p_dblAngle)
		{
			this.angle = p_dblAngle;
			
			this.dataChanged();
		},
	    
	    /**
         * @method hitTest
         * Get hit test for a given point in the geometry
         * @param {NeWMI.Geometry.Point} p_objPnt The point to check with
         * @return {NeWMI.Geometry.Base.AGeometry.HitTestResult} The hit result
         */
		hitTest: function (p_objPnt) {
		},

	    /**
        * @method move
        * Moving the geometry in a given offset
        * 
        * @param {number} p_dblOffsetX The offset in the X axis to move the geometry
        * @param {number} p_dblOffsetY The offset in the Y axis to move the geometry
        */
		move: function (p_dblOffsetX, p_dblOffsetY) {
		    this.dataChanged();
		},

	    /**
        * @method getPoints
        *
        * @return {Array} The points of the geometry
        * @return {number} return.x The X value
        * @return {number} return.y The Y value
        */
		getPoints: function () {
		    return [];
		},

	    /**
        * @method getDrawingPoints
        * Returns the points of the geometry for drawing
        * @return {Array} The points array to draw
        * @return {Array} return.x The X value
        * @return {Array} return.y The Y value
        */
		getDrawingPoints: function () {
		    return this.getPoints();
		},

	    /**
        * @method scale
        * Scaling the geometry by given factor
        * @param {number} p_dblXScale The x factor to scale the geometry
        * @param {number} p_dblYScale The y factor to scale the geometry
        */
		scale: function (p_dblXScale, p_dblYScale) {
		    this.dataChanged();
		},
	});
	
    /////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////// Statics ///////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////

    /**
    * @method fromJson
	* Creating NeWMI geometry from JSON 
    *
	* @param {string} p_strJsonSerialization JSON serialization of the geometry
    * @static
    * @return {NeWMI.Geometry.Base.AGeometry} The de-serialized geometry
    * <pre><code>
    * var pointJson = "{ 'x': 12, 'y': 40 }";
    * var myPoint = NeWMI.Geometry.Base.AGeometry.fromJson(pointJson);
    * </code></pre>
	*/
	AGeometry.fromJson = function (p_strJsonSerialization) {

	    if (p_strJsonSerialization != null) {

	        var objJsonGeo = JSON.parse(p_strJsonSerialization);
	        var geometryType = objJsonGeo.geoType;

	        if (geometryType != null) {

	            var objNewGeo = null;

	            switch (geometryType) {
	                case AGeometry.EGeometryType.Point:
	                    objNewGeo = new NeWMI.Geometry.Point(objJsonGeo);
	                    break;
	                case AGeometry.EGeometryType.Polyline:
	                    objNewGeo = new NeWMI.Geometry.Polyline(objJsonGeo);
	                    break;
	                case AGeometry.EGeometryType.Polygon:
	                    objNewGeo = new NeWMI.Geometry.Polygon(objJsonGeo);
	                    break;
	                case AGeometry.EGeometryType.Circle:
	                    objNewGeo = new NeWMI.Geometry.Circle(objJsonGeo);
	                    break;
	                case AGeometry.EGeometryType.Ellipse:
	                    objNewGeo = new NeWMI.Geometry.Ellipse(objJsonGeo);
	                    break;
	                case AGeometry.EGeometryType.Rectangle:
	                    objNewGeo = new NeWMI.Geometry.Rectangle(objJsonGeo);
	                    break;
	                case AGeometry.EGeometryType.Arrow:
	                    objNewGeo = new NeWMI.Geometry.Arrow(objJsonGeo);
	                    break;
	                default:
	                    //Invalid geoType value
	            }
	            return objNewGeo;
	        }
	    }

	};

    //////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// Hit Result ////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    /**
    * @class NeWMI.Geometry.Base.AGeometry.HitTestResult
    * <p>Represents the hit test results</p>
    */
	AGeometry.HitTestResult = declare("NeWMI.Geometry.Base.AGeometry.HitTestResult", null,
	{
	    constructor: function (p_objParams) {
	        p_objParams = p_objParams || {};

	        /**
            * @property {NeWMI.Geometry.Base.AGeometry.HitTestResult.HitState} hitResult
            * The type of the Hit
            */
	        this.hitResult = p_objParams.hitResult || AGeometry.HitTestResult.HitState.none;

	        /**
            * @property {number} index
            * In case the hit was on vertex or boundary, the index will be the hit vertex or segment
            */
	        this.index = p_objParams.index != null ? p_objParams.index : -1;
	    }
	});

    /** @enum {number} NeWMI.Geometry.Base.AGeometry.HitTestResult.HitState 
    * The types of the hit tests
    */
	AGeometry.HitTestResult.HitState =
	{
	    /** Not hit */
	    none: 0,
	    /** Hit on vertex */
	    vertex: 1,
        /** Hit on on of the segments - boundary hit */
	    boundary: 2,
	    /** Hit inside the geometry */
	    content: 3
	};

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////// Types ///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    /** @enum {Number} NeWMI.Geometry.Base.AGeometry.EGeometryType 
    * The types of the geometries NeWMI provides
    */
	AGeometry.EGeometryType = {
	    /** Unknown geometry type */
	    None: 0,
	    /** Point Type */
	    Point: 1,
	    /** Polyline Type */
	    Polyline: 2,
	    /** Polygon Type */
	    Polygon: 4,
	    /** Ellipse Type */
	    Ellipse: 8,
	    /** Circle Type */
	    Circle: 16,
	    /** Arrow Type */
	    Arrow: 32,
	    /** Rectangle Type */
	    Rectangle: 128
	};

    
	
	return AGeometry;
});