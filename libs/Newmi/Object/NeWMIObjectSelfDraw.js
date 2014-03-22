/**
* @class NeWMI.Object.NeWMIObjectSelfDraw
* Extends NeWMIObject with its own drawing implementation 
* @extends NeWMI.Object.NeWMIObject
*/
define(["dojo/_base/declare", "NeWMI/Object/NeWMIObject", "NeWMI/Draw/Draw2D"], function (declare, NeWMIObject, Draw2D) {
	return declare("NeWMI.Object.NeWMIObjectSelfDraw", NeWMIObject, {
		
		"-chains-" : 
		{
			constructor: "manual"
		},
		
		/**
         * @constructor
         * Creates a new NeWMIObjectSelfDraw instance
		 * @param {String} [p_strID] The object ID
		 * @param {NeWMI.Draw.Types.Rect} [p_objBoundsRec] The bounds of the geometry
		 * @param {NeWMI.Geometry.Base.AGeometry} [p_objGeo] The geometry of the object
		 */
		constructor: function(p_strID, p_objBoundsRec, p_objGeo) 
		{
			this.inherited(arguments);

		    /**
            * @property {Object} lineStyle
            * Represents the outline style of the geometry
            *
            * @property {Boolean} [lineStyle.visible=true] Set to true when we want to draw the outline of the geometry
            * @property {String} [lineStyle.Color='rgba(255,0,0,1)'] The outline Color
            * @property {Number} [lineStyle.width=1] The outline width
            * @property {Array} [lineStyle.dash=[0]] The outline dash Array
            */
			this.lineStyle = { 
								visible : true,
								Color : "rgba(255,0,0,1)",
								width: "1",
								dash : [0]
							 };

		    /**
            * @property {Object} fillStyle
            * The fill style of the geometry
            *
            * @property {Boolean} [fillStyle.visible=true] Set to true when we want to draw fill the geometry
            * @property {String} [fillStyle.Color='rgba(255,0,0,1)'] The fill Color
            * @property {Number} [fillStyle.image=null] Set to html image object when we want to fill the geometry as image
            */
			this.fillStyle = {
								visible : true,
								Color : "rgba(0,0,0,1)",
								image : null
							 };
			
		    
		   /**
           * @property {Number} [pointSize=5]
           * The size for drawing points geometries
           */
			this.pointSize = 5; 
		},
		
		/**
		 * @method setFillAsImage
         * Setting an image for the filling style
         *
		 * @param {String} p_srcImage URL for the image
		 */
		setFillAsImage : function(p_srcImage)
		{
			this.fillStyle.image = new Image();
			this.fillStyle.image.onload = function()
			{
		        //ctx.drawImage(this,0,0,img.width,img.height);
				this.isLoaded = true;
		    };
		    this.fillStyle.image.src = p_srcImage;
		},
		
	    /**
		 * @method setFillAsVideo
         * Setting video for the filling style
         *
		 * @param {String} p_srcVideo URL for the video
		 * @param {String} [p_strType] The type of the video - When not set, it will try to get the type from the url
		 * @param {Boolean} [p_blnMute=false] Set to true when we want the video to be muted
		 */
		setFillAsVideo : function(p_srcVideo, p_strType, p_blnMute)
		{
			var objVideo = document.createElement('video');
			objVideo.setAttribute('id', this.id);
			objVideo.setAttribute('autoplay', 'autoplay');
			if (p_blnMute)
				objVideo.setAttribute('muted', 'true');
			
			var source = document.createElement('source');

			source.src = p_srcVideo;

			if (!p_strType)
			{
				var intIndex = p_srcVideo.lastIndexOf(".");
				var strExt = p_srcVideo.substring(intIndex + 1);
				
				if (strExt == "ogv")
				{
					strExt = "ogg";
				}
				
				p_strType = "video/" + strExt;
			}
			
		    source.type = p_strType;

		    objVideo.appendChild(source);
		    
		    this.fillStyle.image = objVideo;
		    this.fillStyle.image.isLoaded = true;
		},
		
		/**
		 * @method draw2d
         * Called automatically when needed to draw the object
		 * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map that request to draw the object
		 * @param {Object} p_objContext The canvas's context for drawing on
		 * @param {NeWMI.Layer.Base.ALayer} p_objLayer The layer that request to draw the object
		 */
		draw2d : function(p_objMap, p_objContext, p_objLayer)
		{
			if (this.fillStyle.visible)
			{
				var hDraw = function () { this.fill(); };
				
				var blnIsImage = this.fillStyle.image && this.fillStyle.image.isLoaded;
				
				if (blnIsImage)
				{
					p_objContext.save();
					hDraw = function () { this.clip(); };
				}
				else
				{
					p_objContext.fillStyle = this.fillStyle.Color;
				}
	
				Draw2D.geometry(p_objMap, p_objContext, this.geometry, hDraw, { pointSize : this.pointSize });
				
				if (blnIsImage)
				{
					
					var env = this.geometry.getEnvelope();
					var pnt = p_objMap.conversionsSvc.toScreen(env.getXMin(),
                        env.getYMin());
					var pnt2 = p_objMap.conversionsSvc.toScreen(env.getXMax(), env.getYMax());
					
					p_objContext.drawImage(this.fillStyle.image, pnt.x, pnt2.y, pnt2.x - pnt.x, pnt.y - pnt2.y);

					p_objContext.restore();
				}
			}
			
			if (this.lineStyle.visible)
			{
				p_objContext.strokeStyle = this.lineStyle.Color;
				p_objContext.lineWidth = this.lineStyle.width;
				p_objContext.setLineDash(this.lineStyle.dash);

				Draw2D.geometry(p_objMap, p_objContext, this.geometry, null, { pointSize : this.pointSize });
			}
		}
	});
});