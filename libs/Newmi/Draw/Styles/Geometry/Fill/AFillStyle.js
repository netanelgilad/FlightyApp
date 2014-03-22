/**
* @class NeWMI.Draw.Styles.Geometry.Fill.AFillStyle
* Represents the common properties of all the fill styles
* @extends NeWMI.Draw.Styles.Geometry.AGeoStyle
* @abstract
*/
define(["dojo/_base/declare",
        "NeWMI/Draw/Styles/Geometry/AGeoStyle"],
        function (declare,
                    AGeoStyle) {
        return declare("NeWMI.Draw.Styles.Geometry.Fill.AFillStyle", AGeoStyle, {
		
        "-chains-":
		{
		    constructor: "manual"
		},

        constructor: function (params)
        {
            this.inherited(arguments);

            params = params || {};

            /**
            * @property {Object[]} {contextParams=[]}
            * Contains an array objects which each object properties are the properties names as they are in the Canvas (Context '2d'), and their values
            */
            this.contextParams = [];

            if (params.contextParams) {
                if (params.contextParams instanceof Array) {
                    this.contextParams = params.contextParams;
                }
                else {
                    this.contextParams = [params.contextParams];
                }
            }

            /**
            * @property {NeWMI.Draw.Styles.Geometry.Lines.ALineStyle} outline
            * If the fill style contains outline style as well
            */
            this.outline = params.outline;

            /**
            * @property {Function} [hDraw=function(){this.fill();}]
            * The draw function. When we want to combine some fill and stroke actions together, or just fill
            */
            this.hDraw = function () {
                this.fill();
            };
        }
	});

});
