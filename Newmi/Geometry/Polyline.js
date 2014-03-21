/**
* @class NeWMI.Geometry.Polyline
* <p>Represents NeWMI polyline geometry</p>
* @extends NeWMI.Geometry.Base.AGeometry
* <pre><code>
* var myPoly = new NeWMI.Geometry.Polyline();
* myPoly.points.push( { x: 10, y:10 } );
* myPoly.points.push( { x: 30, y:10 } );
* myPoly.points.push( { x: 30, y:30 } );
* </code></pre>
*/
define(["dojo/_base/declare",
        "NeWMI/Geometry/Base/AGeometry",
        "NeWMI/Geometry/Rectangle",
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Service/Math/RelationalOp",
        "NeWMI/Service/Math/RelationalOpGeo"],
        function (declare,
	        	 AGeometry,
	        	 Rectangle,
                 MeasurementSvc,
                 RelationalOp,
                 RelationalOpGeo) {

            return declare("NeWMI.Geometry.Polyline", AGeometry, {

                GeoType: AGeometry.EGeometryType.Polyline,

                /**
                 * @constructor
                 * Creates new polyline instance
                 * @param {Object} [p_objInitData] The polyline initial parameters
                 * @param {Array} [p_objInitData.points] The points of the polyline
                 * @param {number} p_objInitData.points.x The X value of the point (Map units)
                 * @param {number} p_objInitData.points.y The Y value of the point (Map units)
                 * @param {boolean} [p_objInitData.isSmooth] True if the polyline has smooth corners, Otherwise false
                 * @param {number} [p_objInitData.angle] The rotation of the geometry (The direction of the angle is clockwise in radians)
                 */
                constructor: function (p_objInitData) {
                    if (arguments.length > 1) {
                        alert("Polyline");
                    }

                    p_objInitData = p_objInitData || {};

                    this.angle = p_objInitData.angle || 0;
                    /**
                    * @property {Array} points
                    * @property {number} points.x x The X value of the point (Map units)
                    * @property {number} points.y y The Y value of the point (Map units)
                    * The rectangle center location - X value (Map units)
                    */
                    this.points = p_objInitData.points || [];
                    /**
                    * @property {boolean} isSmooth
                    * True if the polyline has smooth corners, Otherwise false
                    */
                    this.isSmooth = p_objInitData.isSmooth || false;
                },

                getPoints: function () {
                    return this.points;
                },

                clone: function () {
                    var objClonedGeo = new NeWMI.Geometry.Polyline();

                    objClonedGeo.points = dojo.clone(this.points);

                    objClonedGeo._copyBaseProperties(this);

                    return objClonedGeo;
                },

                _createGeometryEnvelope: function () {
                    var dblMinX = Number.MAX_VALUE;
                    var dblMaxX = -Number.MAX_VALUE;
                    var dblMinY = Number.MAX_VALUE;
                    var dblMaxY = -Number.MAX_VALUE;

                    this.points.forEach(function (objCurrPt) {
                        dblMinX = Math.min(dblMinX, objCurrPt.x);
                        dblMaxX = Math.max(dblMaxX, objCurrPt.x);
                        dblMinY = Math.min(dblMinY, objCurrPt.y);
                        dblMaxY = Math.max(dblMaxY, objCurrPt.y);
                    }, this);

                    var objRect = new Rectangle({ xmin: dblMinX, xmax: dblMaxX, ymin: dblMinY, ymax: dblMaxY });

                    return objRect;
                },

                dataChanged: function () {

                    this.inherited(arguments);

                    this._unRotatedEnv = null;
                },

                /**
                 * @method getUnrotatedEnvelope
                 * Calculating what is the envelope of the geometry before it was rotated
                 * @return {NeWMI.Geometry.Rectangle} The envelope when the geometry is not rotated
                 */
                getUnrotatedEnvelope: function () {
                    if (!this._unRotatedEnv) {
                        var objMeCloned = this.clone();

                        objMeCloned.setAngleDegree(0);

                        this._unRotatedEnv = objMeCloned.getEnvelope();
                    }

                    return this._unRotatedEnv;
                },

                _createPresentationPoint: function () {
                    if (this.points.length > 0)
                        return NeWMI.Service.Math.InfoSvc.getPointOnPolylineRatio(this.points, 0.5).point;
                    else
                        return null;
                },

                move: function (p_dblOffsetX, p_dblOffsetY) {
                    this.points.forEach(function (objCurrPt) {
                        objCurrPt.x += p_dblOffsetX;
                        objCurrPt.y += p_dblOffsetY;
                    }, this);

                    this.inherited(arguments);
                },

                setAngle: function (p_dblAngle) {
                    var dblAngleDif = p_dblAngle - this.angle;

                    this.inherited(arguments);

                    if (dblAngleDif != 0) {
                        var objPP = this.getPresentationPoint();

                        for (var intCurrPtIndex = 0; intCurrPtIndex < this.points.length; ++intCurrPtIndex) {
                            var objCurrPt = this.points[intCurrPtIndex];
                            this.points[intCurrPtIndex] = NeWMI.Service.Math.InfoSvc.getPointAfterRotation(objPP, objCurrPt, Math.PI / 2 - dblAngleDif);
                        }

                        //this.width = NeWMI.Service.DistancePnts(this.points[0],this.points[1]);
                        //this.height = NeWMI.Service.DistancePnts(this.points[1],this.points[2]);
                    }
                },

                hitTest: function (p_objMap, p_objPnt) {
                    var dblMapTolerance = p_objMap.conversionsSvc.toMapSize(NeWMI.defaults.hitTolerance);

                    var intCurrPtIndex;

                    var points = this.getDrawingPoints();

                    // Checking for closest point
                    for (intCurrPtIndex = 0; intCurrPtIndex < points.length; ++intCurrPtIndex) {
                        var objCurrPnt = points[intCurrPtIndex];
                        var dblDist = MeasurementSvc.distancePnts(p_objPnt, objCurrPnt);

                        if (dblDist < dblMapTolerance) {
                            return new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.vertex, index: intCurrPtIndex });
                        }
                    }

                    var blnIsClosedGeometry = this.GeoType == AGeometry.EGeometryType.Polygon;

                    intCurrPtIndex = 0;


                    var objCurrPnt = points[intCurrPtIndex];

                    var intPointsLength = blnIsClosedGeometry ? points.length : points.length - 1;

                    // Checking for closest segment
                    while (intCurrPtIndex < intPointsLength) {
                        var objNextPnt = points[(intCurrPtIndex + 1) % points.length];

                        if (RelationalOp.isPointOnLine(p_objPnt.x, p_objPnt.y, objCurrPnt.x, objCurrPnt.y, objNextPnt.x, objNextPnt.y, dblMapTolerance).result) {
                            var objHitResult = new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.boundary, index: intCurrPtIndex });
                            objHitResult._lastMousePos = p_objPnt;
                            return objHitResult;
                        }

                        objCurrPnt = objNextPnt;

                        ++intCurrPtIndex;
                    }

                    // Checking if hit inside
                    if (blnIsClosedGeometry) {
                        if (RelationalOpGeo.isPointInPolygon(p_objPnt, this)) {
                            var objHitResult = new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.content });
                            objHitResult._lastMousePos = p_objPnt;
                            return objHitResult;
                        }
                    }

                    return new AGeometry.HitTestResult();

                },

            });
        });