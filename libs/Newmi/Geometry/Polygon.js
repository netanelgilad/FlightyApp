/**
* @class NeWMI.Geometry.Polygon
* <p>Represents NeWMI Polygon geometry</p>
* @extends NeWMI.Geometry.Base.AGeometry
* <pre><code>
* var myPoly = new NeWMI.Geometry.Polygon();
* myPoly.points.push( { x: 10, y:10 } );
* myPoly.points.push( { x: 30, y:10 } );
* myPoly.points.push( { x: 30, y:30 } );
* </code></pre>
*/
define(["dojo/_base/declare", "NeWMI/Geometry/Polyline", "NeWMI/Geometry/Base/AGeometry"], function (declare, Polyline, AGeometry) {
    return declare("NeWMI.Geometry.Polygon", Polyline, {

        GeoType: AGeometry.EGeometryType.Polygon,

        /**
        * @constructor
        * Creates new polygon instance
        * @param {Object} [p_objInitData] The polygon initial parameters
        * @param {Array} [p_objInitData.points] The points of the polygon
        * @param {number} p_objInitData.points.x The X value of the point (Map units)
        * @param {number} p_objInitData.points.y The Y value of the point (Map units)
        * @param {boolean} [p_objInitData.isSmooth] True if the polygon has smooth corners, Otherwise false
        * @param {number} [p_objInitData.angle] The rotation of the geometry (The direction of the angle is clockwise in radians)
        */

        clone: function () {
            var objClonedGeo = new NeWMI.Geometry.Polygon();

            objClonedGeo.points = dojo.clone(this.points);

            objClonedGeo._copyBaseProperties(this);

            return objClonedGeo;
        },

        _createPresentationPoint: function () {
            if (this.points.length > 0) {
                return NeWMI.Service.Math.InfoSvc.calcCentroid(this.points);
            }
            else
                return null;
        }
    });
});