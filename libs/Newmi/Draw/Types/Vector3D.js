/**
* @class NeWMI.Draw.Types.Vector3D
* Simple vector 3D object
*/
define(["dojo/_base/declare"], function (declare) {
    var Vector3D = declare("NeWMI.Draw.Types.Vector3D", null, {
		
        /**
         * @constructor
         * Creates new FontValue instance
		 * @param {Number} [pX=0] The x value
		 * @param {Number} [pY=0] The y value
         * @param {Number} [pZ=0] The z value
		 */
		constructor: function(pX, pY, pZ) 
		{
		    /**
            * @property {Number} [x=0]
            *
            * The x value
            */
		    this.x = pX || 0;

		    /**
            * @property {Number} [y=0]
            *
            * The y value
            */
		    this.y = pY || 0;

		    /**
            * @property {Number} [z=0]
            *
            * The z value
            */
			this.z = pZ || 0;
		},

        /**
         * @method normalize
		 * Normalizing the vector - Making the values between 0 to 1
		 */
		normalize: function () {
		    var scale = 1 / this.length();

		    this.x *= scale;
		    this.y *= scale;
		    this.z *= scale;
		},

        /**
         * @method length
		 * Calculating the length of the vector
         * @return {Number} The vector length
		 */
		length: function () {
		    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		}
	});

    /**
    * @method sub
	* Subbing First vector\point with second
    * @param {NeWMI.Draw.Types.Vector3D|Object} pnt1 The first vector/point({x,y})
	* @param {NeWMI.Draw.Types.Vector3D|Object} pnt2 The second vector/point({x,y})
    * @return {NeWMI.Draw.Types.Vector3D} The new vector
    * @static
	*/
    Vector3D.sub = function (pnt1, pnt2) {
	    return new Vector3D(pnt1.x - pnt2.x, pnt1.y - pnt2.y, pnt1.z - pnt2.z);
	}

    /**
    * @method add
	* Adding vectors\points
    * @param {NeWMI.Draw.Types.Vector3D|Object} pnt1 The first vector/point({x,y})
	* @param {NeWMI.Draw.Types.Vector3D|Object} pnt2 The second vector/point({x,y})
    * @return {NeWMI.Draw.Types.Vector3D} The new vector
    * @static
	*/
    Vector3D.add = function (pnt1, pnt2) {
	    return new Vector3D(pnt1.x + pnt2.x, pnt1.y + pnt2.y, pnt1.z + pnt2.z);
	}

    return Vector3D;
});
