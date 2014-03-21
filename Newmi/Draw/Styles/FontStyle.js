/**
* @class NeWMI.Draw.Styles.FontStyle
* Represents a style base on font
* @extends NeWMI.Draw.Styles.ADrawStyle
*/
define(["dojo/_base/declare", "NeWMI/Draw/Styles/ADrawStyle"], function (declare, ADrawStyle) {
    return declare("NeWMI.Draw.Styles.FontStyle", ADrawStyle, {

        /**
        * @constructor
        * Creates new FontStyle instance
        * @param {Object} [params] The style initial parameters
        * @param {String} [params.font='12pt arial'] The font style
        * @param {String} [params.fillStyle='rgba (255,0,0,1)'] The fill style
        */
		constructor: function(params)
		{
		    this.type = ADrawStyle.Types.Font;

		    params = params || {};

		    /**
            * @property {String} font
            * The style font
            * @readonly
            */
		    this.font = params.font || "12pt arial";

		    /**
            * @property {String} fillStyle
            * The fill style - Use HTML5 Canvas fill styles
            */
		    this.fillStyle = params.fillStyle || "rgba (255,0,0,1)";

		    /**
            * @property {Number} fontSize
            * The font size - extracted from the NeWMI.Draw.Styles.FontStyle.font property
            * @readonly
            */
			this.fontSize = this._extractFontSize(this.font);
		},

		_extractFontSize: function (p_strFont) {

		    var arrFontParams = p_strFont.trim().split(' ');
		    return arrFontParams[0].replace(/[^\d.]/g, '');
		}
	});
});
