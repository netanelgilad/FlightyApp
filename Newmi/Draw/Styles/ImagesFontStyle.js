/**
* @class NeWMI.Draw.Styles.ImagesFontStyle
* Represents a style base on set of images - like an font that each character is an image
* @extends NeWMI.Draw.Styles.ADrawStyle
*
* <pre><code>
* var objImageStylePlane = new NeWMI.Draw.Styles.ImageStyle({ image: imgPlane, size: { width: 32, height: 32 } });
* var objImageStyleTrain = new NeWMI.Draw.Styles.ImageStyle({ image: imgTrain, size: { width: 32, height: 32 } });
* var objImageStyleBus = new NeWMI.Draw.Styles.ImageStyle({ image: imgBus, size: { width: 32, height: 32 } });
* var arrImages = {};
* 	    
* arrImages[String.fromCharCode(32)] = objImageStylePlane;
* arrImages[String.fromCharCode(33)] = objImageStyleTrain;
* arrImages[String.fromCharCode(34)] = objImageStyleBus;
* 
* // Creating an images font style with 3 images - in 32-34 characters values 
* var objMyImagesStyle = new NeWMI.Draw.Styles.ImagesFontStyle({ images: arrImages });
* </code></pre>
*/
define(["dojo/_base/declare", "NeWMI/Draw/Styles/ADrawStyle"], function (declare, ADrawStyle) {
    return declare("NeWMI.Draw.Styles.ImagesFontStyle", ADrawStyle, {
		
        /**
        * @constructor
        * Creates new ImagesFontStyle instance
        * @param {Object} [params] The style initial parameters
        * @param {Object} params.image The image
        * @param {{width,height}} [params.size=<ImageSize>] The image size
        */
        constructor: function (params) {

            this.type = ADrawStyle.Types.ImagesFont;

            params = params || {};

            /**
            * @property {Object} images
            * The images of this style. Each property name is the character for a given image. And the value is the NeWMI.Draw.Styles.ImageStyle
            */
            this.images = params.images || {};
		}
    });
});
