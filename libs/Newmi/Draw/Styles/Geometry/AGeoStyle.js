/**
* @class NeWMI.Draw.Styles.Geometry.AGeoStyle
* Represents a style base on set of images - like an font that each character is an image
* @abstract
*/
define(["dojo/_base/declare"], function (declare) {
    var AGeoStyle = declare("NeWMI.Draw.Styles.Geometry.AGeoStyle", null, {
		
        "-chains-":
		{
		    constructor: "manual"
		},

        constructor: function (params)
        {
            params = params || {};

            /**
            * @property {NeWMI.Draw.Styles.Geometry.AGeoStyle.Types} type
            * The type of the style
            * @readonly
            */
            this.type = null;
		},

        /**
        * @method setContext
        * Preparing the canvas context to draw this style
        * @param {Object} p_objContext The canvas context
        */
        setContext: function (p_objContext) {}
	});

    /** @enum {number} NeWMI.Draw.Styles.Geometry.AGeoStyle.Types
    * The possible geometry styles
    */
    AGeoStyle.Types = {
        /** Simple line - The line is drawn as it is with some properties */
        SimpleLine: 1,
        /** Start and end Symbol - Drawing symbols (Font) at the beginning and\or end of the line*/
        StartEndSymbol: 2,
        /** Line built on symbols and intervals - Drawing symbols in given spaces for constructing the line */
        SymbolLine: 3,
        /** Multi Line styles - Allowing combine several line styles as one */
        MultiLineStyles: 4
    };

    return AGeoStyle;
});
