/**
* @class NeWMI.Draw.Styles.ImageStyle
* Represents a style base on image
* @extends NeWMI.Draw.Styles.ADrawStyle
*/
define(["dojo/_base/declare", "NeWMI/Draw/Styles/ADrawStyle"], function (declare, ADrawStyle) {
    return declare("NeWMI.Draw.Styles.ImageStyle", ADrawStyle, {
		
        /**
        * @constructor
        * Creates new ImageStyle instance
        * @param {Object} [params] The style initial parameters
        * @param {Object} params.image The image
        * @param {{width,height}} [params.size=<ImageSize>] The image size
        */
        constructor: function (params) {

            this.type = ADrawStyle.Types.Image;

            params = params || {};

            /**
            * @property {Object} image
            * The image
            * @readonly
            */
            this.image = params.image || null;

            /**
            * @property {{width,height}} size
            * The size for drawing the image
            * @readonly
            */
            this.size = params.size || null;

            if (this.image && !this.size) {
                if (this.image.width == 0 && this.image.height == 0) {
                    var me = this;
                    this.image.onload = function () {
                        me.size = { width: this.width, height: this.height };
                    }
                }
                else {
                    this.size = { width: this.image.width, height: this.image.height };
                }
            }
        }
    });
});
