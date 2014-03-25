/**
* @class NeWMI.Draw.Types.Rect
* Simple Rectangle object
*/
define(["dojo/_base/declare"], function (declare) {
	return declare("NeWMI.Draw.Types.Rect", null, {
		
	    /**
         * @constructor
         * Creates new FontValue instance
		 * @param {Number} [pX=0] The left value
		 * @param {Number} [pY=0] The top value
         * @param {Number} [pWidth=0] The width of the rectangle
         * @param {Number} [pHeight=0] The height of the rectangle
		 */
	    constructor: function (pX, pY, pWidth, pHeight) {
	        /**
            * @property {Number} [x=0]
            *
            * The left value
            */
	        this.x = pX || 0;

	        /**
            * @property {Number} [y=0]
            *
            * The top value
            */
	        this.y = pY || 0;

	        /**
            * @property {Number} [width=0]
            *
            * The width of the rectangle
            */
	        this.width = pWidth || 0;

	        /**
            * @property {Number} [height=0]
            *
            * The height of the rectangle
            */
	        this.height = pHeight || 0;
	    },
		
        //////////////////
	    /// Accessors ////
	    //////////////////

	    /**
         * @method getLeft
		 * Returns the left of the rectangle
         *
		 * @return {Number} The left of the rectangle
		 */
		getLeft: function () {
		    return this.x;
		},

	    /**
         * @method getTop
		 * Returns the top of the rectangle
         *
		 * @return {Number} The top of the rectangle
		 */
		getTop: function () {
		    return this.y;
		},

	    /**
         * @method getRight
		 * Returns the right of the rectangle
         *
		 * @return {Number} The right of the rectangle
		 */
		getRight : function()
		{
		    return this.x + this.width;
		},

	    /**
         * @method getBottom
		 * Returns the bottom of the rectangle
         *
		 * @return {Number} The bottom of the rectangle
		 */
		getBottom: function () {
		    return this.y + this.height;
		},
		
	    //////////////////
	    /// Relations ////
	    //////////////////

	    /**
         * @method intersectsWith
		 * Check if the given rectangle intersects with this object
         * @param {NeWMI.Draw.Types.Rect} pRect The other rectangle
		 * @return {Boolean} True, if the rectangles intersects
		 */
		intersectsWith: function (pRect) {
		    var blnResult = true;

		    if (this.x > (pRect.x + pRect.width) ||
            	(this.x + this.width) < pRect.x ||
                this.y > (pRect.y + pRect.height) ||
                (this.y + this.height) < pRect.y) {
		        blnResult = false;
		    }

		    return blnResult;
		},
		
	    /**
         * @method contains
		 * Check if the given rectangle\point inside this rectangle
         * @param {NeWMI.Draw.Types.Rect|Object} pRect The other rectangle, Or point {x,y}
		 * @return {Boolean} True, if the rectangle or point inside this rectangle
		 */
		contains: function (pRect, p_blnIncludingOnBorder) {
		    var blnResult = true;

		    if (p_blnIncludingOnBorder == null)
		        p_blnIncludingOnBorder = true;

		    var otherWidth = pRect.width || 0;
		    var otherHeight = pRect.height || 0;

		    if (p_blnIncludingOnBorder) {   // If envelope is on border, it's considered as contained
		        if (this.x >= pRect.x ||
                	(this.x + this.width) <= (pRect.x + otherWidth) ||
                    this.y >= pRect.y ||
                    (this.y + this.height) <= (pRect.y + otherHeight)) {
		            blnResult = false;
		        }
		    }
		    else {   // If envelope is on border, it's considered as not contained
		        if (this.x > pRect.x ||
                	(this.x + this.width) < (pRect.x + otherWidth) ||
                    this.y > pRect.y ||
                    (this.y + this.height) < (pRect.y + otherHeight)) {
		            blnResult = false;
		        }
		    }

		    return blnResult;
		},

	    /**
         * @method union
		 * Performing union with this rectangle with another, The result will be set in this rectangle
         * @param {NeWMI.Draw.Types.Rect} pRect The other rectangle
		 */
		union: function (pRect) {
		    var dblLeft = Math.min(this.x, pRect.x);
		    var dblRight = Math.max(this.x + this.width, pRect.x + pRect.width);
		    var dblTop = Math.min(this.y, pRect.y);
		    var dblBottom = Math.max(this.y + this.height, pRect.y + pRect.height);

		    this.x = dblLeft;
		    this.y = dblTop;
		    this.width = dblRight - dblLeft;
		    this.height = dblBottom - dblTop;
		},
	});
});
