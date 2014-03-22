/**
* @class NeWMI.Draw.StringSizeCalculator
* Provides services for calculating the size of a given string\character
* @static
* <pre><code>
* var txtMetrics = NeWMI.Draw.StringSizeCalculator.getStringMetrics("John", 'arial 12px');
* console.log("John string in arial 12px font width is: " + txtMetrics.width + " pixels");
* </code></pre>
*/
define(["dojo/_base/declare", "dojox/collections/Dictionary"], function (declare, Dictionary) {

    var StringSizeCalculator = declare("NeWMI.Draw.StringSizeCalculator", null, {});

	StringSizeCalculator._canvas = document.createElement("canvas");
	StringSizeCalculator._width = 100;
	StringSizeCalculator._height = 100;
	StringSizeCalculator._canvas.width = StringSizeCalculator._width;
	StringSizeCalculator._canvas.height = StringSizeCalculator._height;
	StringSizeCalculator._ctx = StringSizeCalculator._canvas.getContext("2d");
//	document.body.appendChild(StringSizeCalculator._canvas);
	
	StringSizeCalculator._metricsCache = new Dictionary();
	
    /**
    * @method getStringMetrics
	* Calculating the size of the given text
    * @param {String} p_strText The string to measure
    * @param {String} p_strFont The font to measure with
    * @param {Number} p_intSize The font size
    * @return {Object} The metrics of the given text with the given font
    * @return {string} return.string The measured text
    * @return {Number} return.fontSize The measured font size
    * @return {String} return.font The measured font
    * @return {Number} return.width The calculated width
    * @return {Number} return.height The calculated height
    * @return {Number} return.offsetX The X offset of the text from the center
    * @return {Number} return.offsetY The Y offset of the text from the center
	*/
	StringSizeCalculator.getStringMetrics = function (p_strText, p_strFont, p_intSize)
	{
		if (p_intSize != null)
		{
			StringSizeCalculator._ctx.font = p_intSize + "px " + p_strFont;
		}
		else
		{
			StringSizeCalculator._ctx.font = p_strFont;
		}
		
		var arrFontData = p_strFont.split(' ');
		var intFontSize = parseInt(arrFontData[0].replace(/[^\d.]/g, ''));
		var strFontName = arrFontData[1];
		
	    var strFontKey = p_strText + "." + strFontName;
		var strKey = p_strText + "." + p_strFont.toLowerCase();
		
		var blnCalculateOnlyYOffset = false;
		
	    // Checking if the specific font, characater and the SIZE was calcualted already
		var objTextMetrics = StringSizeCalculator._metricsCache.item(strKey);
		if (objTextMetrics)
		{
		    return objTextMetrics;
		}
		else {
		    // Checking if the specific font, characater WITOUT the size was calcualted already.
		    // for this case we are only calculating the OffsetY because it is not linear,
		    // the rest we are scaling by the sizes difference
		    objFontMetrics = StringSizeCalculator._metricsCache.containsKey(strFontKey);
		    if (objFontMetrics) {
		        var objFontMetrics = StringSizeCalculator._metricsCache.item(strFontKey);

		        objTextMetrics = dojo.clone(objFontMetrics);
		        var factor = intFontSize / objTextMetrics.fontSize

		        objTextMetrics.fontSize = intFontSize;
		        objTextMetrics.width = objFontMetrics.width * factor;
		        objTextMetrics.height = objFontMetrics.height * factor;

		        blnCalculateOnlyYOffset = true;
		    }
		}
		
		var intCalcedHeight = 0;
		var intOffsetY = 0;
		
		if (p_strText.length == 1)
		{
			StringSizeCalculator._ctx.clearRect(0, 0, StringSizeCalculator._width, StringSizeCalculator._height);
			StringSizeCalculator._ctx.textAlign = 'left';
			StringSizeCalculator._ctx.textBaseline = 'top';
			StringSizeCalculator._ctx.fillText(p_strText, 0, 0);

		    // Get the pixel data from the canvas
			var data = StringSizeCalculator._ctx.getImageData(0, 0, StringSizeCalculator._width, StringSizeCalculator._height).data;

			var blnFound = false;

			if (blnCalculateOnlyYOffset) {
                
                // Finding the first non transparent pixel for the offset
			    for (intCurrRow = 0; intCurrRow < StringSizeCalculator._height; intCurrRow++) {

			        for (intCurrCol = 0; intCurrCol < StringSizeCalculator._width; intCurrCol++) {

			            var intCurrDataIdx = intCurrRow * StringSizeCalculator._width * 4 + intCurrCol * 4 + 3;
			            if (data[intCurrDataIdx]) {
			                objTextMetrics.offsetY = intCurrRow;
			                blnFound = true;
			                break;
			            }
			        }

			        if (blnFound) {
			            break;
			        }
			    }
			}
			else {

			    var first = false;
			    var last = false;

			    var intCurrRow = StringSizeCalculator._height;
			    var intCurrCol = 0;


			    // Find the last line with a non-transparent pixel
			    while (!blnFound && intCurrRow) {
			        intCurrRow--;
			        for (intCurrCol = 0; intCurrCol < StringSizeCalculator._width; intCurrCol++) {
			            var intCurrDataIdx = intCurrRow * StringSizeCalculator._width * 4 + intCurrCol * 4 + 3;
			            if (data[intCurrDataIdx]) {
			                last = intCurrRow;
			                blnFound = true;
			                break;
			            }
			        }
			    }

			    // If we found some pixel from down, we look now from up
			    if (blnFound) {
			        blnFound = false;
			        intCurrRow = 0;

			        // Find the first line with a non-transparent pixel
			        while (!blnFound && intCurrRow < last) {
			            for (intCurrCol = 0; intCurrCol < StringSizeCalculator._width; intCurrCol++) {
			                var intCurrDataIdx = intCurrRow * StringSizeCalculator._width * 4 + intCurrCol * 4 + 3;
			                if (data[intCurrDataIdx]) {
			                    first = intCurrRow;
			                    blnFound = true;
			                    break;
			                }
			            }

			            // If we've got it then return the height
			            if (blnFound) {
			                intCalcedHeight = (last - first) + 2;
			                intOffsetY = first;
			            }

			            intCurrRow++;
			        }
			    }
			}
		}
		else
		{
			intOffsetY = 0;
			intCalcedHeight = intFontSize + intFontSize / 3;
		}
	    
        // If the objects already exists - means that we used the existed font&char metrics in the cache and only calculate the OffsetY
		if (!objTextMetrics) {
		    objTextMetrics = {};
		    objTextMetrics.string = p_strText;
		    objTextMetrics.fontSize = intFontSize;
		    objTextMetrics.font = p_strFont;
		    objTextMetrics.width = StringSizeCalculator._ctx.measureText(p_strText).width;
		    objTextMetrics.height = intCalcedHeight;
		    objTextMetrics.offsetY = intOffsetY;
		    objTextMetrics.offsetX = 0;

		    // We are adding also the data as font&char (without size in the key) so we won't have to calculate the rest of the linear params when we get different size.
            // Like height and width
		    StringSizeCalculator._metricsCache.add(strFontKey, objTextMetrics);
		}

		StringSizeCalculator._metricsCache.add(strKey, objTextMetrics);

		/*StringSizeCalculator._ctx.fillStyle = 'red';
		NeWMI.Draw.Draw2D.point(StringSizeCalculator._ctx, objTextMetrics.offsetX,
		objTextMetrics.offsetY, 3);

		console.log(objTextMetrics.offsetY);*/
		
    	return objTextMetrics;
	};
	
	return StringSizeCalculator;
});
