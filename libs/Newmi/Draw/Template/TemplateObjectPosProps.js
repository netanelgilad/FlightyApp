/**
* @class NeWMI.Draw.Template.TemplateObjectPosProps
* <p>The Template Position Properties class Represents a single item location rules in a template.<p/>
* This class holds data on the item such as if it related to some other item in the template, minimum size, offsets, alignments, etc.
*/
define(["dojo/_base/declare"], function (declare) {
	return declare("NeWMI.Draw.Template.TemplateObjectPosProps", null, {
		
	    /**
        * @constructor
        * Creates new TemplateObjectPosProps instance
        */
	    constructor: function (options)
		{
		    /**
            * @property {Boolean} [isSpecific=true]
            *
            * If the item is specific or related to other item\s
            */
		    this.isSpecific = true;
		    /**
            * @property {Number} [relatedToIndex=-1]
            *
            * If the item is specific or related to other item\s
            */
		    this.relatedToIndex = -1;
		    /**
            * @property {{x,y,z}} [offset={ x: 0, y: 0, z: 0 }]
            *
            * Offset from the drawing location - In pixels
            */
		    this.offset = { x: 0, y: 0, z: 0 };
		    /**
            * @property {{width,height}} [relativeSizePosition={ width: 0, height: 0 }]
            *
            * <p>This property is the offset from the related item according to its size.</p>
            * <p>{ width:0, height: 0.5 } means that the item will be drawn under half of the size of its related item.</p>
            * <p>Works only for non specific items</p>
            */
		    this.relativeSizePosition = { width: 0, height: 0 };
		    /**
            * @property {String} [horizontalAlignment='center']
            *
            * The horizontal alignment of the item
            */
		    this.horizontalAlignment = 'center';
		    /**
            * @property {String} [verticalAlignment='middle']
            *
            * The vertical alignment of the item
            */
		    this.verticalAlignment = 'middle';
		    /**
            * @property {String} [name='']
            *
            * The name of the item - For readable template
            */
			this.name = '';
			
			options = options || {};
			if (options.relatedToIndex != null) 		this.relatedToIndex = options.relatedToIndex;
			this.isSpecific = this.relatedToIndex == -1 ? true : false; 
			if (options.offset != null) 				this.offset = options.offset;
			if (options.relativeSizePosition != null) 	this.relativeSizePosition = options.relativeSizePosition;
			if (options.horizontalAlignment != null) 	this.horizontalAlignment = options.horizontalAlignment;
			if (options.verticalAlignment != null) 		this.verticalAlignment = options.verticalAlignment;
			if (options.name != null) 					this.name = options.name;
		}
	});
});
