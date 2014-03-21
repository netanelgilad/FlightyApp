/**
* @class NeWMI.Geometry.Point
* <p>Represents NeWMI Point geometry</p>
* @extends NeWMI.Geometry.Base.AGeometry
* <pre><code>
* var myPoint = new NeWMI.Geometry.Point( { x: 11, y: 43 } );
* </code></pre>
*/
define(["dojo/_base/declare",
    "NeWMI/Geometry/Base/AGeometry",
    "NeWMI/Geometry/Rectangle"], function (declare, AGeometry, Rectangle) {

        return declare("NeWMI.Geometry.Point", AGeometry, {

            GeoType: AGeometry.EGeometryType.Point,

            /**
             * @constructor
             * Creates new Point instance
             * @param {Object} [p_objInitData] The point initial parameters
             * @param {number} [p_objInitData.x] The X value of the point (Map units)
             * @param {number} [p_objInitData.y] The Y value of the point (Map units)
             * @param {number} [p_objInitData.angle] The rotation of the geometry (The direction of the angle is clockwise in radians)
             */
            constructor: function (p_objInitData) {
                if (arguments.length > 1) {
                    alert("Point");
                }

                p_objInitData = p_objInitData || {};

                /**
                * @property {number} x
                * The X value of the point (Map units)
                */
                this.x = p_objInitData.x;
                /**
                * @property {number} y
                * The Y value of the point (Map units)
                */
                this.y = p_objInitData.y;

                this.angle = p_objInitData.angle || 0;
            },

            clone: function () {
                var objClonedGeo = new NeWMI.Geometry.Point(this);

                objClonedGeo._copyBaseProperties(this);

                return objClonedGeo;
            },

            hitTest: function (p_objMap, p_objPnt) {
                var dblMapTolerance = p_objMap.conversionsSvc.toMapSize(NeWMI.defaults.hitTolerance);

                var dblDist = MeasurementSvc.distancePnts(p_objPnt, this);

                if (dblDist <= dblMapTolerance) {
                    return new AGeometry.HitTestResult({ hitResult: AGeometry.HitTestResult.HitState.vertex });
                }
                else {
                    return new AGeometry.HitTestResult();
                }

            },

            move: function (p_dblOffsetX, p_dblOffsetY) {
                this.x += p_dblOffsetX;
                this.y += p_dblOffsetY;

                this.inherited(arguments);
            },

            _createGeometryEnvelope: function () {
                return new Rectangle({ xCenter: this.x, yCenter: this.y, width: 0, height: 0 });
            },

            _createPresentationPoint: function () {
                return { x: this.x, y: this.y };
            }
        });
    });