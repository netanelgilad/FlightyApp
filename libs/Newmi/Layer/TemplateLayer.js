/**
* @class NeWMI.Layer.TemplateLayer
* <p>Represents a template objects layer NeWMI</p>
* @extends NeWMI.Layer.Base.ACustomObjectsLayer
*/
define(["dojo/_base/declare",
        "NeWMI/Layer/Base/ACustomObjectsLayer", 
        "NeWMI/Object/DataSource",
        "NeWMI/Draw/Template/TemplateObjectActualPos",
        "NeWMI/Draw/TemplateDraw",
        "NeWMI/Draw/Types/Rect",
        "NeWMI/Draw/Draw2D"], 
        function(declare, 
        		ACustomObjectsLayer, 
        		DataSource, 
        		TemplateObjectActualPos,
        		TemplateDraw,
        		Rect,
        		Draw2D)

	{
	var TemplateLayer = declare("NeWMI.Layer.TemplateLayer", ACustomObjectsLayer, { 
    
	    /**
        * @property {Number} [MAX_SCALE=9999999999]
        * The maximum scale for the LOD
        * @static
        * @readonly
        */
	    MAX_SCALE : 9999999999,

	    /**
        * @constructor
        * Creates new TemplateLayer instance
        * @param {Boolean} p_blnIsGL True, if we want to use GL mode
        */
		constructor: function(p_blnIsGL) 
		{
			this.inherited(arguments, [ p_blnIsGL, true ]);
			
			this.objects = [];

		    /**
            * @property {Number} [symbolSize=1]
            * The size of the symbol
            */
			this.symbolSize = 1;

			this._recompileObjects = false;
			this._drawObjectsOn2D = !p_blnIsGL;
		},

		////////////////////////publics ///////////////////////////////
		
	    /**
        * @method setData
        * Setting the objects to the layer
        * @param {NeWMI.Object.NeWMIObject[]} arrObjs The objects to set this layer with
        */
		setData : function(arrObjs)
		{
			arrObjs.compiledObjects = {};
			
			this.objects = arrObjs;
			
			this.dataSource.addObjects(arrObjs);
			
			if (!this._drawObjectsOn2D)
			{
				this._constructObjectsImages();
			}
		},
		
	    /**
        * @method setDrawData
        * Setting the drawing data for the layer, such as template, style, LOD
        * @param {NeWMI.Draw.Template.TemplateObjectPosProps[]} arrTemplate The position properties that designs the symbol
        * @param {NeWMI.Draw.Styles.ADrawStyle[]} arrDrawStyles The drawing styles        
        * @param {Boolean[]} arrDrawFlags The drawing flags array
        */
		setDrawData: function(arrTemplate, arrDrawStyles, arrDrawFlags)
		{
			var blnFoundUnknownKey = false;

			// Changing the first unknown value to max scale const and the rest removing 
			for (var currKey in arrDrawFlags)
			{
				if (isNaN(currKey))
				{
					if (!blnFoundUnknownKey)
					{
						blnFoundUnknownKey = true;	
					
						arrDrawFlags[TemplateLayer.MAX_SCALE] = arrDrawFlags[currKey];
					}
					
					delete arrDrawFlags[currKey];
				}
			}
			
			this.template = arrTemplate;
			this.drawFlags = arrDrawFlags;
			this.drawStyles = arrDrawStyles;
			this.tempAP = TemplateObjectActualPos.createArray(arrTemplate.length);
						
			if (!this._drawObjectsOn2D)
			{
				this._constructObjectsImages();
			}
		},
		
		
		
///////////////////// Privates ////////////////////////////////
		
		_getDrawZoomFactor : function(dblScale)
		{
			for (var dblCurrScale in this.drawFlags)
			{
				if (parseFloat(dblCurrScale) > dblScale)
					return dblCurrScale;
			}
		},
		
		_constructObjectsImages : function()
		{

			if (!this.objectImagesConstructed &&
					this.objects != null &&
					this.drawFlags != null && 
					this.drawStyles != null && 
					this.template != null && 
					this.tempAP != null)
			{	
				for (var intObjectIndex = 0; intObjectIndex<this.objects.length; ++intObjectIndex)
				{
					var obj = this.objects[intObjectIndex];
					
					for (var intFlagsArr in this.drawFlags)
					{
						this._compileObj(obj, intFlagsArr);
					}
				}
				
				this.objectImagesConstructed = true;
			}
		},
		
		_compileObj : function (p_obj, dblDrawZoomFactor)
		{
			var image = p_obj.constructImage(this.drawStyles, this.drawFlags[dblDrawZoomFactor], this.template, this.tempAP, false);
			if (!p_obj.image)
			{
				p_obj.image = [];
			}
			p_obj.image[dblDrawZoomFactor] = image;
		},
		
		_getSymbolRect: function(p_objMap, p_objContext, object, symbolSizeFactor, dblDrawZoomFactor)
		{
		    var rect;
		    NeWMI.Log.tc(this, function () {
				//var objScreenPnt = context.map.toScreen(object.location);
				var objScreenPnt = p_objMap.conversionsSvc.toScreen(object.geometry.x, object.geometry.y);
				
				var objCurrImg = object.image[dblDrawZoomFactor];
				objScreenPnt.x = parseInt(objScreenPnt.x + Math.floor(objCurrImg.offsetFromCenter.x * symbolSizeFactor));
				objScreenPnt.y = parseInt(objScreenPnt.y + Math.floor(objCurrImg.offsetFromCenter.y * symbolSizeFactor));
				
				rect = new Rect(objScreenPnt.x, objScreenPnt.y,
				                objCurrImg.width * symbolSizeFactor,
				                objCurrImg.height * symbolSizeFactor);
		    });

		    return rect;
		},
		
		_drawSymbol2D: function(p_objMap, context, object, symbolSizeFactor, dblDrawZoomFactor)
		{
			var objSymbRect = this._getSymbolRect(p_objMap, context, object, symbolSizeFactor, dblDrawZoomFactor);
			
			if (objSymbRect)
			{	
				var objCurrImg = object.image[dblDrawZoomFactor];
				context.drawImage(objCurrImg, objSymbRect.x, objSymbRect.y, objSymbRect.width, objSymbRect.height);
				
				return objSymbRect;
			}
			else
			{
				return null;
			}
		},
		
///////////////////////////////////////////////////////////////
		
		drawGL : function(p_objMap, gl)
		{
		    NeWMI.Log.tc(this, function () {
		        if (this.objects.length == 0)
		            return;

		        // Getting the drawing level zoom
		        var dblDrawZoomFactor = this._getDrawZoomFactor(p_objMap.getScale());
		        var symbolSizeFactor = this.drawFlags[dblDrawZoomFactor].symbolSizeFactor;

		        if (!this.glInit) {
		            this.shader = new GL.Shader(
                            '\
				    		 uniform vec2 uMatrixScale;\
				    		  attribute vec2 offsetCorners;\
				    		  varying vec2 coord;\
				    		  void main() {\
				    		    coord = gl_TexCoord.xy;\
				    		    vec4 objOffsetValues = vec4(offsetCorners.xy / uMatrixScale, 0, 0);\
				    		    gl_Position = gl_ModelViewProjectionMatrix * (gl_Vertex + objOffsetValues);\
				    		  }\
				    		',
                            '\
				    		  uniform sampler2D texture;\
				    		  varying vec2 coord;\
				    		  void main() {\
				    		    gl_FragColor = texture2D(texture, coord);\
				    		  }\
				    		');

		            this.glInit = true;
		        }

		        //var timeBefore = new Date().getTime();
		        //var timeAfter = new Date().getTime();
		        //console.log((timeAfter - timeBefore) / 1000);

		        // Compiling the objects incase we need
		        if (this.objects.compiledObjects[dblDrawZoomFactor] == null || this._recompileObjects == true) {
		            this.objects.compiledObjects[dblDrawZoomFactor] = TemplateDraw.compileTemplateObjects(this.objects, dblDrawZoomFactor);
		            this._recompileObjects = false;
		        }

		        // Setting the shader params
		        this.shader.uniforms({
		            texture: 0,
		            uMatrixScale: [1 / gl.xScale / this.symbolSize / symbolSizeFactor, 1 / gl.yScale / this.symbolSize / symbolSizeFactor]
		        });

		        var objCompiledObjects = this.objects.compiledObjects[dblDrawZoomFactor];


		        // Drawing the meshes
		        for (var intCurrMesh = 0; intCurrMesh < objCompiledObjects.length; ++intCurrMesh) {
		            objCompiledObjects[intCurrMesh].texture.bind(0);
		            this.shader.drawSymbols(objCompiledObjects[intCurrMesh].mesh);
		        }

		        /*if (this.objSel != null)
                {
                    return;
                    var selRect;
                    
                    if(this.objSel.length != null)
                    {
                        for(var entityIdx = 0; entityIdx < this.objSel.length; entityIdx++ )
                        {
                            objCompiledObjects[intCurrMesh].texture.bind(0);
                            this.shader.drawSymbols(objCompiledObjects [intCurrMesh].mesh);
                            
                            selRect = this.getSymbolRect(context, this.objSel[entityIdx], symbolSizeFactor, dblDrawZoomFactor);									
                            context.strokeRect(selRect.x,selRect.y,selRect.width,selRect.height);
                        }
                    }
                }*/
		    });
		},
		
		drawObjects2D: function(p_objMap, p_objContext, p_arrObjToDraw)
		{
		    NeWMI.Log.tc(this, function () {
		        // Getting the drawing level zoom
		        var dblDrawZoomFactor = this._getDrawZoomFactor(p_objMap.getScale());
		        var symbolSizeFactor = this.drawFlags[dblDrawZoomFactor].symbolSizeFactor;

		        if (this._drawObjectsOn2D) {
		            // It's better to draw the objects as it then allot of images because the browser is saving the images in such cache
		            // and when we changing everytime to draw other image - it takes time to recache it or whatever it does.
		            // Weird fact - In explrorer it's working faster when creating allot of image and then printing them becuase it is saving the
		            // images on the memory of the process, but in chrome it's look like that it's saved in some files due to the performances and the low memory of the process
		            if (p_arrObjToDraw.length > 1000) {
		                p_arrObjToDraw.forEach(function (objCurrObject) {
		                    var objScreenPnt = p_objMap.conversionsSvc.toScreen(objCurrObject.geometry.x, objCurrObject.geometry.y);
		                    NeWMI.Draw.TemplateDraw.drawTemplate(objScreenPnt.x, objScreenPnt.y, 0,
                                                objCurrObject.drawValues, this.drawStyles, this.drawFlags[dblDrawZoomFactor], this.template,
                                                p_objContext,
                                                this.tempAP,
                                                symbolSizeFactor,
                                                true);
		                }, this);
		            }
		            else {
		                p_arrObjToDraw.forEach(function (objCurrObject) {
		                    var objScreenPnt = p_objMap.conversionsSvc.toScreen(objCurrObject.geometry.x, objCurrObject.geometry.y);

		                    if (!objCurrObject.image ||
                                !objCurrObject.image.hasOwnProperty(dblDrawZoomFactor)) {
		                        this._compileObj(objCurrObject, dblDrawZoomFactor);
		                    }

		                    //Draw2D.point(p_objContext, objScreenPnt.x, objScreenPnt.y, 10);

		                    objCurrObject.imageLastDrawn = objCurrObject.image[dblDrawZoomFactor];
		                    objScreenPnt.x = parseInt(objScreenPnt.x + objCurrObject.imageLastDrawn.offsetFromCenter.x * symbolSizeFactor);
		                    objScreenPnt.y = parseInt(objScreenPnt.y + objCurrObject.imageLastDrawn.offsetFromCenter.y * symbolSizeFactor);

		                    p_objContext.drawImage(objCurrObject.imageLastDrawn,
                                    objScreenPnt.x,
                                    objScreenPnt.y,
                                    Math.round(objCurrObject.imageLastDrawn.width * symbolSizeFactor), Math.round(objCurrObject.imageLastDrawn.height * symbolSizeFactor));


		                }, this);
		            }
		        }

		        this._drawSelectedObjects(p_objMap, p_objContext, this.selection, symbolSizeFactor, dblDrawZoomFactor);
		    });
		},
		
		_drawSelectedObjects : function (p_objMap, p_objContext, p_arrSelection, p_symbolSizeFactor, p_dblDrawZoomFactor)
		{
			//var objCompiledObjects = this.objects.compiledObjects[p_dblDrawZoomFactor];
			//Draw2D.image(p_objContext, objCompiledObjects[0].texture.image, 0, 0, 1024, 1024);
			
			p_objContext.lineWidth = 2;
			p_objContext.setLineDash([p_objContext.lineWidth]);
			p_objContext.strokeStyle = 'red';
			
			NeWMI.Log.tc(this, function () {
			    var blnCheckWithView = this.useView && this.view != null;
			    p_arrSelection.forEach(function (objCurrSelected) {
			        if (!blnCheckWithView || this.view.isObjectDrawn(objCurrSelected.value)) {
			            var selRect = this._getSymbolRect(p_objMap, p_objContext, objCurrSelected.value, p_symbolSizeFactor, p_dblDrawZoomFactor);

			            if (selRect)
			                p_objContext.strokeRect(selRect.x, selRect.y, selRect.width, selRect.height);
			        }
			    }, this);
			});
			
			p_objContext.setLineDash([0]);			
		}
	});
	
	return TemplateLayer;
});
