/**
* @class NeWMI.Geometry.Circle
* <p>Represents NeWMI Circle geometry</p>
* @extends NeWMI.Geometry.Polygon
* <pre><code>
* var myCircle = new NeWMI.Geometry.Circle( { x: 11, y: 43, radius: 20 } );
* </code></pre>
*/
define(["dojo/_base/declare",
    "NeWMI/Service/Math/MeasurementSvc",
    "NeWMI/Geometry/Polygon",
    "NeWMI/Geometry/Base/AGeometry",
    "NeWMI/Geometry/Rectangle",
    "NeWMI/Geometry/Point"], function (declare, MeasurementSvc, Polygon, AGeometry, Rectangle, Point) {
        return declare("NeWMI.Geometry.Circle", Polygon, {

            GeoType: AGeometry.EGeometryType.Circle,

            /**
            * @constructor
            * Creates new Circle instance
            * @param {Object} [p_objInitData] The circle initial parameters
            * @param {number} [p_objInitData.x] The X center value of the circle (Map units)
            * @param {number} [p_objInitData.y] The Y center value of the circle (Map units)
            * @param {number} [p_objInitData.radius] The radius of the circle (Map units)
            * @param {number} [p_objInitData.angle] The rotation of the geometry (The direction of the angle is clockwise in radians)
            */
            constructor: function (p_objInitData) {
                if (arguments.length > 1) {
                    alert("Circle");
                }

                p_objInitData = p_objInitData || {};

                /**
                * @property {number} x
                * The circle center location - X value (Map units)
                */
                this.x = p_objInitData.x;
                /**
                * @property {number} y
                * The circle center location - Y value (Map units)
                */
                this.y = p_objInitData.y;
                /**
                * @property {number} radius
                * The circle radius (Map units)
                */
                this.radius = p_objInitData.radius;

                this.angle = p_objInitData.angle || 0;

                //FillEllipsePts(this.points, this.x, this.y, this.radius, this.radius);
            },

            
            clone: function () {
                var objClonedGeo = new NeWMI.Geometry.Circle({ "x": this.x, "y": this.y, "radius": this.radius });

                objClonedGeo._copyBaseProperties(this);

                return objClonedGeo;
            },

            _createGeometryEnvelope: function () {
                return new Rectangle({
                    "xCenter": this.x,
                    "yCenter": this.y,
                    "width": this.radius * 2,
                    "height": this.radius * 2
                });
            },

            _createPresentationPoint: function () {
                return { "x": this.x, "y": this.y };
            },

            
            hitTest: function (p_objMap, p_objPnt) {

                var dblToleranceMap = p_objMap.conversionsSvc.toMapSize(NeWMI.defaults.hitTolerance);

                var distanceFromCenter = MeasurementSvc.distancePnts(p_objPnt, { "x": this.x, "y": this.y });

                // Closer to the radius
                if (Math.abs(distanceFromCenter - this.radius) < dblToleranceMap) {
                    return new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.boundary });
                }
                    // Closer to the center point 
                else if (distanceFromCenter < this.radius) {
                    var objHitResult = new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.content });
                    objHitResult._offsetFromCenter = { "x": this.x - p_objPnt.x, "y": this.y - p_objPnt.y };

                    return objHitResult;
                }

                return new AGeometry.HitTestResult();

            }

        });
    });