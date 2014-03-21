/**
* @class NeWMI.Draw.Styles.ADrawStyle
* Represents a basic style
* @abstract
*/
define(["dojo/_base/declare"], function (declare) {
    var ADrawStyle = declare("NeWMI.Draw.Styles.ADrawStyle", null, {
		
		constructor: function() 
		{
		    /**
            * @property {NeWMI.Draw.Styles.ADrawStyle.Types} type
            * The type of the style
            * @readonly
            */
		    this.type = null;
		}
	});

    /** @enum {number} NeWMI.Draw.Styles.ADrawStyle.Types 
    * The possible styles
    */
    ADrawStyle.Types = {
        /** Font style type */
        Font: 1,
        /** Image style type */
        Image: 2,
        /** Images Fonts style type - Set of images collected into one style (like font)*/
	    ImagesFonts: 3
	};

	return ADrawStyle;
});
