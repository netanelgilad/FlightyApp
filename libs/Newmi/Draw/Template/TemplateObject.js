/**
* @class NeWMI.Draw.Template.TemplateObject
* <p>Represents a template object in NeWMI. Use this for drawing your object as template<p/>
* @extends NeWMI.Object.NeWMIObject
*/
define(["dojo/_base/declare",
        "NeWMI/Object/NeWMIObject", 
        "NeWMI/Geometry/Point", 
        "NeWMI/Draw/TemplateDraw"], function(declare, NeWMIObject, Point, TemplateDraw){
	return declare("NeWMI.Draw.Template.TemplateObject", NeWMIObject, {
		
	    /**
        * @constructor
        * Creates new TemplateObject instance
        * @param {Number} pX The X value
        * @param {Number} pY The Y value
        */
		constructor: function(pX, pY) 
		{
		    this.geometry = new Point({ "x": pX, "y": pY });
			this.boundsRect = this.geometry.getEnvelope().getRect();
			
		    /**
            * @property {String[]} [drawValues=[]]
            *
            * The strings values to draw
            */
			this.drawValues = [];

		    /**
            * @property {Object} image
            *
            * The image\s of the object
            */
			this.image = null;

		    /**
            * @property {Object} imageLastDrawn
            *
            * The last drawn image for this object
            */
			this.imageLastDrawn = null;
		},
	
	    /**
       * @method constructImage
       * Creates the image for the template object
       * @param {NeWMI.Draw.Styles.ADrawStyle[]} arrDrawStyles The drawing styles
       * @param {Boolean[]} arrFlags The drawing flags array
       * @param {NeWMI.Draw.Template.TemplateObjectPosProps[]} arrTemplate The position properties that designs the symbol
       * @param {Number} arrTempAP Temporary item positions array helps the drawing operation and Keeps the drawing from spending time and memory creating new temporary arrays every call
       * @param {Boolean} blnSave If true, the image will be saved in the NeWMI.Draw.Template.TemplateObject.image property of the instance
       * @return {Object} The image of the template
       */
		constructImage : function(arrDrawStyles, arrFlags, arrTemplate, arrTempAP, blnSave)
		{
			var image = NeWMI.Draw.TemplateDraw.drawTemplateToImage(this.drawValues, arrDrawStyles, arrFlags, arrTemplate, arrTempAP, 1);
			
			if (blnSave == null || blnSave)
			{
				this.image = image;
			}
			
			return image;
		}
	});
});

