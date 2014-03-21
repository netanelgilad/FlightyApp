/**
* @class NeWMI.Draw.TemplateDraw
* <p>Provides draw services for template drawing</p>
* <p>Template drawing is a pointed location complex drawing contains images\texts with different position and relations</p>
* @static
*/
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "NeWMI/Draw/Types/Rect", 
        "NeWMI/Draw/Template/TemplateObjectActualPos",
        "NeWMI/Draw/StringSizeCalculator",
        "NeWMI/Draw/Draw2D",
        "NeWMI/Draw/Styles/ADrawStyle"],
        function (declare, lang, domConstruct, Rect, TemplateObjectActualPos, StringSizeCalculator, Draw2D, ADrawStyle)

    {
	
		var TemplateDraw = declare("NeWMI.Draw.TemplateDraw", null, 
        {
			constructor : function()
			{
				this.__tempalteDrawCanvas = document.createElement('canvas');
				this.__tempalteDrawContext = this.__tempalteDrawCanvas.getContext('2d');	
			}
		});
		
        /**
        * @property {Number} [IMAGE_EXPANDING_PIXELS=4]
        *
        * The padding pixels when drawing the template to an image
        * @static
        * @readonly
        */
		TemplateDraw.IMAGE_EXPANDING_PIXELS = 4;
		
        /**
        * @method drawTemplate
		* Drawing the template on the context
        * @param {Number} p_dblPosX The location to draw - X Value
        * @param {Number} p_dblPosY The location to draw - Y Value
        * @param {Number} p_dblPosZ The location to draw - Z Value
        * @param {String[]} p_arrDrawValues The drawing data
        * @param {NeWMI.Draw.Styles.ADrawStyle[]} p_arrDrawStyles The drawing styles
        * @param {Boolean[]} p_arrDetailsFlags The drawing flags array
        * @param {NeWMI.Draw.Template.TemplateObjectPosProps[]} p_arrPosProps The position properties that designs the symbol
        * @param {Object} p_objContext HTML canvas(context) object
        * @param {NeWMI.Draw.Template.TemplateObjectActualPos[]} p_objCurrentDrawDI Temporary item positions array helps the drawing operation and Keeps the drawing from spending time and memory creating new temporary arrays every call
        * @param {Number} [p_dblSizeFactor=1] The size factor for drawing the template
        * @param {Boolean} [p_blnPerformDraw=true] If true, it will draw the template. Otherwise, only calculate the sizes and the positions
        * @return {NeWMI.Draw.Types.Rect} The bounds of the drawing
        * @static
		*/
		TemplateDraw.drawTemplate = function (	p_dblPosX, p_dblPosY, p_dblPosZ,
									p_arrDrawValues, p_arrDrawStyles, p_arrDetailsFlags, 
									p_arrPosProps,
									p_objContext, 
									p_objCurrentDrawDI, 
									p_dblSizeFactor,
									p_blnPerformDraw)
		{
			var objRect;
	
			
				// Running over all the position properties and drawing them in GL or GDI+
			for (var intCurrPosPropIndex = 0;
            intCurrPosPropIndex < p_arrPosProps.length;
            intCurrPosPropIndex++) {
			    // Getting the right item and resetting its data by setting the IsInit to false
			    var objDI = p_objCurrentDrawDI[intCurrPosPropIndex];
			    objDI.isInit = false;

			    // Getting the PP
			    objDI.positionProps = p_arrPosProps[intCurrPosPropIndex];

			    var strDrawValue = p_arrDrawValues[intCurrPosPropIndex];
			    objDI.drawValue = strDrawValue;

			    if (p_arrDetailsFlags[intCurrPosPropIndex] && strDrawValue != null) {
			        var objStyle = p_arrDrawStyles[intCurrPosPropIndex];
			        objDI.drawStyle = objStyle;

			        if (objDI.positionProps.isSpecific) {
			            objDI.position = {
			                x: p_dblPosX + objDI.positionProps.offset.x * p_dblSizeFactor,
			                y: p_dblPosY + objDI.positionProps.offset.y * p_dblSizeFactor,
			                z: p_dblPosZ + objDI.positionProps.offset.Z
			            };
			        }
			        else {
			            objDI.position = objDI.getDrawPosition(p_objCurrentDrawDI, p_dblSizeFactor);
			        }

			        var objMetrics = null;
			        if (objStyle.type == ADrawStyle.Types.Font) {
			            objMetrics = StringSizeCalculator.getStringMetrics(objDI.drawValue, objStyle.font);

			            objDI.size = { width: objMetrics.width * p_dblSizeFactor, height: objMetrics.height * p_dblSizeFactor };
			        }
			        else {
			            objDI.size = lang.clone(objStyle.images[objDI.drawValue[0]].size);
			            objDI.size.width *= p_dblSizeFactor;
			            objDI.size.height *= p_dblSizeFactor;
			        }

			        if (p_blnPerformDraw) {
			            if (objStyle.type == ADrawStyle.Types.Font) {
			                p_objContext.font = objStyle.font;
			                p_objContext.fillStyle = objStyle.fillStyle;
			                p_objContext.textAlign = objDI.positionProps.horizontalAlignment;
			                p_objContext.textBaseline = objDI.positionProps.verticalAlignment;

			                if (objDI.drawValue.length == 1)
			                    Draw2D.symbol(p_objContext, objDI.drawValue, objDI.position.x, objDI.position.y, objMetrics);
			                else
			                    p_objContext.fillText(objDI.drawValue, objDI.position.x, objDI.position.y);
			            }
			            else {
			                p_objContext.drawImage(objStyle.images[objDI.drawValue[0]].image, Math.round(objDI.position.x - objDI.size.width / 2), Math.round(objDI.position.y - objDI.size.height / 2), objDI.size.width, objDI.size.height);
			            }
			            //p_objContext.fillRect(objDI.position.x, objDI.position.y, 2, 2 );
			        }
			        else {
			            if (objRect == null) {
			                objRect = TemplateDraw.getRect(objDI);
			            }
			            else {
			                objRect.union(TemplateDraw.getRect(objDI));
			            }
			        }

			        /*p_objContext.fillStyle = "red";
                    Draw2D.point(p_objContext, objDI.position.x, objDI.position.y);
                    
                    if (objRect == null)
                    {
                        objRect = TemplateDraw.getRect(objDI);
                    }
                    else
                    {
                        objRect.union(TemplateDraw.getRect(objDI)); 
                    }
                    
                    p_objContext.strokeStyle = "green";
                    p_objContext.strokeRect(objRect.x, objRect.y, objRect.width, objRect.height);*/
			    }
			}
	
			return objRect;
	    };
    
    /**
    * @method drawTemplateToImage
	* Drawing the template to an image
    * @param {String[]} p_arrDrawValues The drawing data
    * @param {NeWMI.Draw.Styles.ADrawStyle[]} p_arrDrawStyles The drawing styles
    * @param {Boolean[]} p_arrDetailsFlags The drawing flags array
    * @param {NeWMI.Draw.Template.TemplateObjectPosProps[]} p_arrPosProps The position properties that designs the symbol
    * @param {NeWMI.Draw.Template.TemplateObjectActualPos[]} p_objCurrentDrawDI Temporary item positions array helps the drawing operation and Keeps the drawing from spending time and memory creating new temporary arrays every call
    * @param {Number} [p_dblSizeFactor=1] The size factor for drawing the template
    * @return {Object} The image with the template
    * @static
	*/
    TemplateDraw.drawTemplateToImage = function (
    		p_arrDrawValues, p_arrDrawStyles, p_arrDetailsFlags, 
    		p_arrPosProps,
    		p_objCurrentDrawDI, 
    		p_dblSizeFactor)
    {
    	var objRectBounds = TemplateDraw.drawTemplate(0,0,0,
    			p_arrDrawValues, p_arrDrawStyles, p_arrDetailsFlags,
    			p_arrPosProps,
    			TemplateDraw.instance.__tempalteDrawContext,
    			p_objCurrentDrawDI, 
    			p_dblSizeFactor,
    			false);
    	
    	objRectBounds.width += TemplateDraw.IMAGE_EXPANDING_PIXELS;
        objRectBounds.height += TemplateDraw.IMAGE_EXPANDING_PIXELS;
        
        var objNewCanvas = document.createElement('canvas');
        objNewCanvas.width = objRectBounds.width;
        objNewCanvas.height = objRectBounds.height;
        
        var objNewContext =  objNewCanvas.getContext('2d');
        //objNewContext.fillStyle = "white";
        //objNewContext.fillRect(0,0, objNewCanvas.width, objNewCanvas.height);
        
        var objOffsetFromCenter = { x: objRectBounds.x, y: objRectBounds.y, z: 0 };
        
        TemplateDraw.drawTemplate(-objOffsetFromCenter.x, -objOffsetFromCenter.y, 0,
    			p_arrDrawValues, p_arrDrawStyles, p_arrDetailsFlags,
    			p_arrPosProps,
    			objNewContext,
    			p_objCurrentDrawDI, 
    			p_dblSizeFactor,
    			true);
        
        objNewCanvas.offsetFromCenter = objOffsetFromCenter;
        
        return objNewCanvas;
    };
    
   /**
   * @method getRect
   * Calculating the bounds if an item given the NeWMI.Draw.Template.TemplateObjectActualPos
   * @param {NeWMI.Draw.Template.TemplateObjectActualPos} pDI Calculated temporary item position
   * @return {NeWMI.Draw.Types.Rect} The bounds of the drawing
   * @static
   */
    TemplateDraw.getRect = function (pDI)
    {
    	var objPos = pDI.position;
    	
    	var objRect = new Rect(objPos.x, objPos.y, pDI.size.width, pDI.size.height);
    	
    	if (pDI.positionProps.horizontalAlignment == 'center')
    	{
    		objRect.x -= objRect.width / 2;
    	}
    	else if (pDI.positionProps.horizontalAlignment == 'end')
    	{
    		objRect.x -= objRect.width;
    	}
    	
    	if (pDI.positionProps.verticalAlignment == 'middle')
    	{
    		objRect.y -= (objRect.height) / 2;
    	}
    	else if (pDI.positionProps.verticalAlignment == 'bottom')
    	{
    		objRect.y -= (objRect.height);
    	}
    	else
		{
    		//objRect.y  -= pDI.metrics.offsetY;
		}
    	
    	return objRect;
    };
    
    /**
    * @method collectImages
    * Creating one big image with the given objects as a texture atlas
    * @param {NeWMI.Draw.Template.TemplateObject[]} arrObjects Template objects to include in the image
    * @param {Number} [intStartIndex=0] The object index to start with
    * @param {Number} [intEndIndex=lastIndex] The object index to end with
    * @param {Number} [width=1024] The big image width
    * @param {Number} [height=1024] The big image height
    * @param {Number} [imageKey] The key to get the image from the object. If null it will use the property NeWMI.Draw.Template.TemplateObject.image
    * @return {Object} An object contains:
    * @return {Object} return.image The calculated image
    * @return {Number} return.endIndex The end index of the object that fitted in this image. when we try to put too many objects images in the big one.
    * @static
    */
    TemplateDraw.collectImages = function (arrObjects, intStartIndex, intEndIndex, width, height, imageKey)
    {
    	if (intStartIndex == null) intStartIndex = 0;
    	if (intEndIndex == null ) intEndIndex = arrObjects.length;
    	if (width == null) width = 1024;
    	if (height == null) height = 1024;

    	/*var dblTotalWidth = 0;
    	var dblMaxHeight = 0;
    	for (var intCurrImage=0; intCurrImage < arrImages.length; ++intCurrImage)
    	{
    		var objCurrImg = arrImages[intCurrImage];
    		dblTotalWidth += objCurrImg.width;
    		dblMaxHeight = Math.max(dblMaxHeight, objCurrImg.height);
    	}*/

    	var objColCanvas = domConstruct.create('canvas', {}, null);
    	//objColCanvas.width = parseInt(dblTotalWidth);
    	//objColCanvas.height = parseInt(dblMaxHeight);
    	objColCanvas.width = width;
    	objColCanvas.height = height;
    	objColCanvas.objects = [];
    	var ctxColCanvas = objColCanvas.getContext('2d');

    	var dblCurrLocX = 0;
    	var dblCurrLocY = 0;
    	var dblMaxHeightInRow = 0;
    	for (var intCurrObj = intStartIndex; intCurrObj < intEndIndex; ++intCurrObj)
    	{
    		var objCurrObj = arrObjects[intCurrObj];
    		var objCurrImg = objCurrObj.image;
    		
    		if (imageKey)
    		{
    			objCurrImg =  objCurrObj.image[imageKey];
    		}
    		
    		if (dblCurrLocX + objCurrImg.width > objColCanvas.width)
    		{
    			dblCurrLocX = 0;
    			dblCurrLocY += dblMaxHeightInRow;
    			dblMaxHeightInRow = 0;
    		}

    		if (dblCurrLocY + objCurrImg.height > objColCanvas.height)
    		{
    			break;
    		}

    		ctxColCanvas.drawImage(objCurrImg, dblCurrLocX, dblCurrLocY);
    		//ctxColCanvas.fillRect(dblCurrLocX,dblCurrLocX,objCurrImg.width,objCurrImg.height);

    		objCurrImg.atlasRect = new Rect(dblCurrLocX, dblCurrLocY, objCurrImg.width, objCurrImg.height);
    		objCurrImg.texAtlas = [ 
    		                       [ dblCurrLocX / objColCanvas.width, 
    		                         dblCurrLocY / objColCanvas.height ],
    		                         [ dblCurrLocX / objColCanvas.width + objCurrImg.width / objColCanvas.width, 
    		                           dblCurrLocY / objColCanvas.height + objCurrImg.height / objColCanvas.height]
    		                       ];

    		dblMaxHeightInRow = Math.max(dblMaxHeightInRow, objCurrImg.height);

    		objColCanvas.objects.push(objCurrObj);

    		dblCurrLocX += parseInt(objCurrImg.width);
    		
    		objCurrImg.parentCollection = objColCanvas;
    		objCurrObj.indexInCollection = objColCanvas.objects.length - 1;
    	}

    	return  { 'image' : objColCanvas, 'endIndex' : intCurrObj };
    };
    
    /**
    * @method compileTemplateObjects
    * Compiling the template objects into the GPU
    * @param {NeWMI.Draw.Template.TemplateObject[]} arrObjects Template objects to compile
    * @param {Number} [imageKey] The key to get the image from the object. If null it will use the property NeWMI.Draw.Template.TemplateObject.image
    * @return {Object[]} Arrays of:
    * @return {Object} return.mesh The mesh including all the quads of the objects images
    * @return {NeWMI.Draw.Template.TemplateObject[]} return.objects The images in the mesh
    * @return {Object} return.texture The GL Texture of the collected images
    * @static
    */
    TemplateDraw.compileTemplateObjects = function(arrObjs, imageKey)
    {
    	var arrMesh = [];
    	
    	// Creating the textures
    	var intStartTexIndex = 0;

    	do
    	{	    		
    		var objCollectImagesRetVal = TemplateDraw.collectImages(arrObjs, intStartTexIndex, arrObjs.length, null, null, imageKey);
    		var objCurrCol = objCollectImagesRetVal.image;
    		
    		// Creating the texture from the collection image
    		var texture = GL.Texture.fromImage(objCurrCol , {
    			noFlip : true,
    			//magFilter : gl.NEAREST,
    			//minFilter : gl.NEAREST
    			magFilter : gl.LINEAR,
    			//minFilter : gl.NEAREST_MIPMAP_LINEAR
    			minFilter : gl.LINEAR
    		});
    		
    		texture.image = objCurrCol;
    		
    		var mesh = null;
    		for ( var intCurrObj = 0; intCurrObj < objCurrCol.objects.length; ++intCurrObj) 
    		{
    			var objCurrObject = objCurrCol.objects[intCurrObj];
    			mesh = new GL.Mesh.symbol(objCurrObject, mesh, imageKey);
    			
    			objCurrObject.mesh = mesh;
    		}
    		
    		mesh.compile();
    		
    		mesh.texture = texture;
    		mesh.objects = texture.image.objects;
    		
    		texture.image.objects.texture = texture;
    		
    		//arrColImages[intCurrColImageIdx].mesh = mesh;
    		
    		arrMesh.push( { 'mesh' : mesh, 'objects' : mesh.objects, 'texture' : mesh.texture } );
    		
    		intStartTexIndex = objCollectImagesRetVal.endIndex; // returning the last index of the objects that've been inserted to the collection
    	}
    	while (intStartTexIndex < arrObjs.length);
    	
    	return arrMesh;
    };

	TemplateDraw.instance = new TemplateDraw();
	
	return TemplateDraw;
});