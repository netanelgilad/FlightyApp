/**
* @class NeWMI.Geometry.Rectangle
* <p>Represents NeWMI rectangle geometry</p>
* @extends NeWMI.Geometry.Base.AGeometry
* <pre><code>
* // Same rectangle - two ways to create
* var myRect1 = new NeWMI.Geometry.Rectangle( { xmin: 10, ymin: 10, xmax: 20, ymax: 20 } );
* var myRect2 = new NeWMI.Geometry.Rectangle( { xCenter: 15, yCenter: 15, width: 10, height: 10 } );
* </code></pre>
*/
define(["dojo/_base/declare",
        "NeWMI/Geometry/Base/AGeometry",
        "NeWMI/Service/Create/GeometrySvc",
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Service/Math/ConversionsSvc",
        "NeWMI/Service/Math/InfoSvc",
        "NeWMI/Service/Math/RelationalOp",
        "NeWMI/Draw/Types/Rect"],
        function (declare,
        		AGeometry,
                GeometrySvc,
                MeasurementSvc,
                ConversionsSvc,
                InfoSvc,
                RelationalOp,
                Rect) {

            var Rectangle = declare("NeWMI.Geometry.Rectangle", AGeometry, {

                GeoType: AGeometry.EGeometryType.Rectangle,

                /**
                 * @constructor
                 * Creates new Rectangle instance. 2 sets of parameters are available when creating a rectangle. Limits or Center and size. check out below
                 * 
                 * @param {Object} [p_objInitData1] The rectangle initial parameters - limits
                 * @param {number} p_objInitData1.xmin The minimum x of the rectangle (Map units)
                 * @param {number} p_objInitData1.ymin The minimum y of the rectangle (Map units)
                 * @param {number} p_objInitData1.xmax The maximum x of the rectangle (Map units)
                 * @param {number} p_objInitData1.ymax The maximum y of the rectangle (Map units)
                 * @param {number} [p_objInitData1.angle] angle The rotation of the geometry (The direction of the angle is clockwise in radians)
                 *<p/>
                 * @param {Object} [p_objInitData2] The rectangle initial parameters - center and size
                 * @param {number} [p_objInitData2.xCenter] The minimum x of the rectangle (Map units)
                 * @param {number} [p_objInitData2.yCenter] The minimum y of the rectangle (Map units)
                 * @param {number} [p_objInitData2.width] The rectangle width (Map units)
                 * @param {number} [p_objInitData2.height] The rectangle height (Map units)
                 * @param {number} [p_objInitData2.angle] angle The rotation of the geometry (The direction of the angle is clockwise in radians)
                 */
                constructor: function (p_objInitData) {

                    if (arguments.length > 1) {
                        alert("Rectangle");
                    }

                    p_objInitData = p_objInitData || {};

                    // For the possibility that the param object contains limits params
                    if (p_objInitData.hasOwnProperty('xmin')) {
                        this._xmin = p_objInitData.xmin;
                        this._ymin = p_objInitData.ymin;
                        this._xmax = p_objInitData.xmax;
                        this._ymax = p_objInitData.ymax;

                        /**
                        * @property {number} xCenter
                        * The rectangle center location - X value (Map units)
                        */
                        this.xCenter = (this._xmin + this._xmax) / 2;
                        /**
                        * @property {number} yCenter
                        * The rectangle center location - Y value (Map units)
                        */
                        this.yCenter = (this._ymin + this._ymax) / 2;
                        /**
                        * @property {number} width
                        * The rectangle width (Map units)
                        */
                        this.width = this._xmax - this._xmin;
                        /**
                        * @property {number} height
                        * The rectangle height (Map units)
                        */
                        this.height = this._ymax - this._ymin;

                        this.angle = 0;
                    }
                        // For the possibility that the param object contains center and size
                    else {
                        this.xCenter = p_objInitData.xCenter || 0;
                        this.yCenter = p_objInitData.yCenter || 0;
                        this.width = p_objInitData.width || 0;
                        this.height = p_objInitData.height || 0;

                        this.angle = p_objInitData.angle || 0;
                    }

                    this.dataChanged();
                },

                getDrawingPoints: function () {
                    return this.getPoints();
                },

                dataChanged: function () {
                    this.inherited(arguments);

                    this._points = [];
                    this._xmin = null;
                    this._xmax = null;
                    this._ymin = null;
                    this._ymax = null;
                },

                _calculateBBExtremeValues: function () {
                    var points = this.getPoints();
                    var xmin = Number.MAX_VALUE;
                    var ymin = Number.MAX_VALUE;
                    var xmax = -Number.MAX_VALUE;
                    var ymax = -Number.MAX_VALUE;

                    for (var intIdx = 0; intIdx < points.length; intIdx++) {
                        if (points[intIdx].x < xmin) {
                            xmin = points[intIdx].x;
                        }
                        if (points[intIdx].x > xmax) {
                            xmax = points[intIdx].x;
                        }
                        if (points[intIdx].y < ymin) {
                            ymin = points[intIdx].y;
                        }
                        if (points[intIdx].y > ymax) {
                            ymax = points[intIdx].y;
                        }
                    }

                    this._xmin = xmin;
                    this._ymin = ymin;
                    this._xmax = xmax;
                    this._ymax = ymax;
                },

                /**
                 * @method getXMin
                 * @return {number} The minimum x of the rectangle
                 */
                getXMin: function () {
                    if (this._xmin == null) {
                        if (this.angle == 0) {
                            this._xmin = this.xCenter - this.width / 2;
                        }
                        else {
                            this._calculateBBExtremeValues();
                        }
                    }
                    return this._xmin;
                },

                /**
                 * @method getYMin
                 * @return {number} The minimum y of the rectangle
                 */
                getYMin: function () {
                    if (this._ymin == null) {
                        if (this.angle == 0) {
                            this._ymin = this.yCenter - this.height / 2;
                        }
                        else {
                            this._calculateBBExtremeValues();
                        }
                    }
                    return this._ymin;
                },

                /**
                 * @method getXMax
                 * @return {number} The maximum X of the rectangle
                 */
                getXMax: function () {
                    if (this._xmax == null) {
                        if (this.angle == 0) {
                            this._xmax = this.xCenter + this.width / 2;
                        }
                        else {
                            this._calculateBBExtremeValues();
                        }
                    }
                    return this._xmax;
                },

                /**
                 * @method getYMax
                 * @return {number} The maximum Y of the rectangle
                 */
                getYMax: function () {
                    if (this._ymax == null) {
                        if (this.angle == 0) {
                            this._ymax = this.yCenter + this.height / 2;
                        }
                        else {
                            this._calculateBBExtremeValues();
                        }
                    }
                    return this._ymax;
                },

                getPoints: function () {
                    if (this._points.length == 0) {
                        this._points.push({ x: this.xCenter - this.width / 2, y: this.yCenter + this.height / 2 });
                        this._points.push({ x: this.xCenter + this.width / 2, y: this.yCenter + this.height / 2 });
                        this._points.push({ x: this.xCenter + this.width / 2, y: this.yCenter - this.height / 2 });
                        this._points.push({ x: this.xCenter - this.width / 2, y: this.yCenter - this.height / 2 });

                        if (this.angle != 0) {
                            var objPP = this.getPresentationPoint();

                            for (var intCurrPtIndex = 0; intCurrPtIndex < this._points.length; ++intCurrPtIndex) {
                                var objCurrPt = this._points[intCurrPtIndex];
                                this._points[intCurrPtIndex] = NeWMI.Service.Math.InfoSvc.getPointAfterRotation(objPP, objCurrPt, Math.PI / 2 - this.angle);
                            }
                        }
                    }
                    return this._points;

                    //points;
                },

                /**
                 * @method setLimitValues
                 * Setting the X & Y minimum and maximum values
                 * @param {Object} p_objLimitVals The limits values
                 * @param {number} p_objLimitVals.xmin The minimum X value
                 * @param {number} p_objLimitVals.ymin The minimum Y value
                 * @param {number} p_objLimitVals.xmax The maximum X value
                 * @param {number} p_objLimitVals.ymax The maximum Y value
                 */
                setLimitValues: function (p_objLimitVals) {

                    this.angle = 0;

                    p_objLimitVals = p_objLimitVals || {};

                    xmin = p_objLimitVals.xmin || this.getXMin();
                    ymin = p_objLimitVals.ymin || this.getYMin();
                    xmax = p_objLimitVals.xmax || this.getXMax();
                    ymax = p_objLimitVals.ymax || this.getYMax();

                    this.xCenter = (xmin + xmax) / 2;
                    this.yCenter = (ymin + ymax) / 2;

                    this.width = xmax - xmin;
                    this.height = ymax - ymin;

                    this.dataChanged();
                },

                /**
                 * @method setPoint
                 * Setting one of the rectangle points
                 * @param {NeWMI.Geometry.Rectangle.EnvelopePointLocationType} p_eLoc The point location
                 * @param {number} p_dblX The X value to set
                 * @param {number} p_dblY The Y value to set
                 */
                setPoint: function (p_eLoc, p_dblX, p_dblY) {
                    
                    if (this._points && this._points.length == 4) {
                        var intOpPoint = (p_eLoc + 2) % 4;
                        var intNextOpPoint = (p_eLoc + 1) % 4;

                        var dblNewC = MeasurementSvc.distance(this._points[intOpPoint].x, this._points[intOpPoint].y, p_dblX, p_dblY);

                        var dblSideSegAngle = MeasurementSvc.getAngle(this._points[intOpPoint].x, this._points[intOpPoint].y, this._points[intNextOpPoint].x, this._points[intNextOpPoint].y);

                        // Flipping the the direction when are working with minus heights or widths
                        if ((p_eLoc % 2 == 0 && this.height < 0) ||
                            (p_eLoc % 2 == 1 && this.width < 0)) {
                            dblSideSegAngle = dblSideSegAngle + Math.PI;
                        }

                        var dblNewAngle = MeasurementSvc.getAngle(this._points[intOpPoint].x, this._points[intOpPoint].y, p_dblX, p_dblY);

                        var dblAngle = dblSideSegAngle - dblNewAngle;

                        var a = Math.sin(dblAngle) * dblNewC;
                        var b = Math.cos(dblAngle) * dblNewC;


                        this.xCenter = (this._points[intOpPoint].x + p_dblX) / 2;
                        this.yCenter = (this._points[intOpPoint].y + p_dblY) / 2;

                        if (p_eLoc % 2 == 0) {
                            this.width = a;
                            this.height = b;
                        }
                        else {
                            this.width = b;
                            this.height = a;
                        }


                        this.dataChanged();
                    }
                },

                clone: function () {
                    var objClonedGeo = new NeWMI.Geometry.Rectangle({
                        "xCenter": this.xCenter, "yCenter": this.yCenter,
                        "width": this.width, "height": this.height
                    });

                    objClonedGeo._copyBaseProperties(this);

                    return objClonedGeo;
                },

                scale: function (p_dblXScale, p_dblYScale) {
                    this.width = this.width * p_dblXScale;
                    this.height = this.height * p_dblYScale;

                    this.inherited(arguments);
                },

                move: function (p_dblOffsetX, p_dblOffsetY) {
                    this.xCenter += p_dblOffsetX;
                    this.yCenter += p_dblOffsetY;

                    this.inherited(arguments);
                },

                hitTest: function (p_objMap, p_objPnt) {
                    var dblMapTolerance = p_objMap.conversionsSvc.toMapSize(NeWMI.defaults.hitTolerance);

                    var intCurrPtIndex;

                    var points = this.getPoints();

                    // Checking for closest point
                    for (intCurrPtIndex = 0; intCurrPtIndex < points.length; ++intCurrPtIndex) {
                        var objCurrPnt = points[intCurrPtIndex];
                        var dblDist = MeasurementSvc.distancePnts(p_objPnt, objCurrPnt);

                        if (dblDist < dblMapTolerance) {
                            return new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.vertex, index: intCurrPtIndex });
                        }
                    }


                    intCurrPtIndex = 0;


                    var objCurrPnt = points[intCurrPtIndex];

                    // Checking for closest segment
                    while (intCurrPtIndex < points.length) {
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
                    if (RelationalOp.isPointInPolygon(p_objPnt, this.getPoints())) {
                        var objHitResult = new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.content });
                        objHitResult._lastMousePos = p_objPnt;
                        return objHitResult;
                    }


                    return new AGeometry.HitTestResult();

                },

                /**
                 * @method getRect
                 * @return {NeWMI.Draw.Types.Rect} The rectangle as a simple object
                 */
                getRect: function () {
                    return new Rect(this.xCenter - this.width / 2, this.yCenter - this.height / 2, this.width, this.height);
                },

                /**
                 * @method fixLimitValues
                 * Fixing the members in case of minuses
                 */
                fixLimitValues: function () {
                    if (this.width < 0 ||
                        this.height < 0) {
                        this.width = Math.abs(this.width);
                        this.height = Math.abs(this.height);

                        this.dataChanged();
                    }
                },

                _createGeometryEnvelope: function () {
                    if (this.angle == 0) {
                        return this.clone();
                    }
                    else {
                        var xmin = this.getXMin();
                        var ymin = this.getYMin();
                        var xmax = this.getXMax();
                        var ymax = this.getYMax();

                        return new Rectangle({
                            "xCenter": (xmin + xmax) / 2,
                            "yCenter": (ymin + ymax) / 2,
                            "width": xmax - xmin,
                            "height": ymax - ymin
                        });
                    }
                },

                _createPresentationPoint: function () {
                    return { x: this.xCenter, y: this.yCenter };
                }
            });

            /** @enum {number} NeWMI.Geometry.Rectangle.EnvelopePointLocationType 
            * The rectangle points locations
            */
            Rectangle.EnvelopePointLocationType = {
                /** the top left point */
                TopLeft: 0,
                /** the top left point */
                TopRight: 1,
                /** the bottom Right point */
                BottomRight: 2,
                /** the bottom left point */
                BottomLeft: 3
            };

            return Rectangle;
        });