/**
* @class NeWMI.Draw.Types.FontValue
* An object contains Font and string value. Used for styled drawing
*/
define(["dojo/_base/declare"], function (declare) {
    return declare("NeWMI.Draw.Types.FontValue", null, {
		
        /**
         * @constructor
         * Creates new FontValue instance
		 * @param {Object} [params] The initial parameters
		 * @param {String} [params.font='12px Arial'] The font
         * @param {String} [params.value=' '] The value
		 */
		constructor: function(params)
		{
		    params = params || {};

		    /**
            * @property {string} [font='12px Arial']
            *
            * The font
            */
		    this.font = params.font || "12px Arial";

		    /**
            * @property {string} [value=' ']
            *
            * The value
            */
		    this.value = params.value || ' ';
		}
	});
});
