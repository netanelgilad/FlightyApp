/**
* @class NeWMI.Draw.Template.TemplateObjectActualPos
* <p>Represents the drawing properties of specific item which being calculated while the drawing method - and using template drawing<p/>
*/
define(["dojo/_base/declare"], function (declare) {
	var TemplateObjectActualPos = declare("NeWMI.Draw.Template.TemplateObjectActualPos", null, 
    {
        /**
        * @constructor
        * Creates new TemplateObjectActualPos instance
        */
        constructor: function () {

            /**
            * @property {NeWMI.Draw.Template.TemplateObjectPosProps} positionProps
            *
            * The Position properties that this item is being drawing according to 
            */
            this.positionProps = null;

            /**
            * @property {NeWMI.Draw.Styles.ADrawStyle} drawStyle
            *
            * The used style for the draw
            */
            this.drawStyle = null;

            /**
            * @property {String} drawValue
            *
            * The drawn value
            */
            this.drawValue = '';

            /**
            * @property {Boolean} isInit
            *
            * Is this item already been calculated
            */
            this.isInit = false;

            /**
            * @property {{x,y,z}} position
            *
            * The drawing position - Filled in draw time
            */
            this.position = null;

            /**
            * @property {{width,height}} size
            *
            * the item Size - Filled in draw time
            */
            this.size = null;
        },


        /**
         * @method getDrawPosition
		 * Calculating the size location and offset of the object
         *
		 * @param {NeWMI.Draw.Template.TemplateObjectActualPos[]} p_lstAP The actual position to calculate its location, size, offsets
         * @param {Number} p_dblSizeFactor The size factor of the drawing
		 */
		getDrawPosition: function (p_lstAP, p_dblSizeFactor) {
		    var objRelatedTo = p_lstAP[this.positionProps.relatedToIndex];

		    objRelatedPoint = objRelatedTo.position;

		    objRetVal = {
		        x: objRelatedPoint.x + this.positionProps.offset.x * p_dblSizeFactor + (objRelatedTo.size.width * this.positionProps.relativeSizePosition.width),
		        y: objRelatedPoint.y + this.positionProps.offset.y * p_dblSizeFactor + (objRelatedTo.size.height * this.positionProps.relativeSizePosition.height),
		        z: objRelatedPoint.Z + this.positionProps.offset.Z * p_dblSizeFactor
		    };

		    return objRetVal;
		}
	});
	
    /**
    * @method createArray
	* Creating an empty array of template objects actual positions for using in the draw method
    *
	* @param {Number} intCount Items to create
    * @return {NeWMI.Draw.Template.TemplateObjectPosProps[]} The empty array
    * @static
	*/
	TemplateObjectActualPos.createArray = function (intCount) {

	    var arrData = [];
	    for (intCurrIndex = 0; intCurrIndex < intCount; ++intCurrIndex) {

	        arrData.push(new TemplateObjectActualPos());
	    }

	    return arrData;
	};
	
	return TemplateObjectActualPos;
});
