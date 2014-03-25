if (WebGLRenderingContext.prototype.mapScreenToMap == null) 
	WebGLRenderingContext.prototype.mapScreenToMap = function(map, pOffset, pScale)
	{
		var gl = this.valueOf();
		
		var screenSize = map.getControlLayout();
		
		gl.viewport(0, 0, screenSize.width, screenSize.height);
		gl.matrixMode(gl.PROJECTION);
		gl.loadIdentity();
		
		var objMapExtent = map.getExtent();
		
		var xmin = objMapExtent.getXMin();
		var ymin = objMapExtent.getYMin();
		var xmax = objMapExtent.getXMax();
		var ymax = objMapExtent.getYMax();


		gl.ortho(xmin, xmax, ymin, ymax, -1, 1);
		gl.matrixMode(gl.MODELVIEW);
		gl.loadIdentity();
		
		gl.xScale = (xmax - xmin) / screenSize.width; 
		gl.yScale = (ymax - ymin) / screenSize.height;
		
		if (pOffset)
	    {
			var xOffset = pOffset[0] * gl.xScale;
			var yOffset = -pOffset[1] * gl.yScale;
			
			gl.translate(xOffset, yOffset, 0);
	    }
	    
	    if (pScale)
		{
	    	var mapAnchor = map.conversionsSvc.toMap(pScale[0].x, pScale[0].y);
	    	gl.translate(mapAnchor.x, mapAnchor.y, 0);
	    	gl.scale( pScale[1], pScale[1], 1);
		    gl.translate(-mapAnchor.x, -mapAnchor.y, 0);
		    
		    gl.xScale /= pScale[1];
		    gl.yScale /= pScale[1];
		}
	};