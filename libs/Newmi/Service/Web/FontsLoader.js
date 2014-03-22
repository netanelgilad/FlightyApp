/**
* @class NeWMI.Service.Web.FontsLoader
* Provides services for loading font from the server to the client side
* <pre><code>
* var fontLoadeder = new NeWMI.Service.Web.FontsLoader(
* 	{
* 		fonts: [{ name: 'MyFont', url: 'fonts/font.ttf' }],
* 		callback: dojo.hitch(this, this.onFontLoader)
* 	});
* fontLoadeder.start();
* 
* .
* .
* .
*
* function onFontLoader(failedItems)
* {
*     if (failedItems.length > 0) {
*         alert("One or more fonts have failed to load");
*     }
*		
*     console.log("Well done. All fonts have been loaded");
* }
* </code></pre>
*/
define(["dojo/_base/declare", "dojox/timing"], function (declare, Timing) {
	
	return declare("NeWMI.Service.Web.FontsLoader", null, {
	
	    /**
        * @constructor
        * Creates new FontsLoader instance
        * @param {Object} args The arguments
        * @param {Object[]} args.fonts The fonts we want to load. Each object contains two properties. <ul><li>name - The name of the font, like arial.</li><li>url - URL to the font</li></ul>
        * @param {Function} args.callback The callback function which will be called when the fonts are loaded or timeout. The callback we get on argument with the fonts who failed to load.
        * @param {Number} [args.timeout=1000] The timeout in milliseconds for loading the fonts
        * @param {Number} [args.defaultFont='arial'] The fall back font when the fonts we wanted to load failed
        */
		constructor : function(args)
		{
			this.fonts = args.fonts;
			this.callback = args.callback;
			this.timeout = args.timeout || 1000;
			this.defaultFont = args.defaultFont || "arial";
			this.interval = args.interval || 5;

			this.canvas = document.createElement("canvas");
		    this.context = this.canvas.getContext("2d");

		    this.text = "abcdefghijklmnopqrstuvwxyz0123456789";
		    this.context.font = "72px " + this.defaultFont;
		    this.baselineSize = this.context.measureText(this.text).width;
		    
		    this.spans = [];
		    
		    for (var intCurrFontIdx = 0; intCurrFontIdx < this.fonts.length; ++intCurrFontIdx)
	    	{
		    	var strCurrFontName = this.fonts[intCurrFontIdx].name;
		    	var strCurrFontUrl = this.fonts[intCurrFontIdx].url;
		    	
		    	// Adding the style
		    	var newStyle = document.createElement('style');
		    	newStyle.appendChild(document.createTextNode("\
		    	@font-face {\
		    	    font-family: '" + strCurrFontName + "';\
		    	    src: url('" + strCurrFontUrl + "');\
		    	}\
		    	"));
		    	document.head.appendChild(newStyle);
		    	
		    	// Adding span that uses this style - locating it outside the page so we'll not see it
		    	var objTempSpan = document.createElement("span");
				objTempSpan.style.position = "absolute";
				objTempSpan.style.margin = "-100px";
				objTempSpan.style.fontFamily = strCurrFontName;
				var node = document.createTextNode("1");
				objTempSpan.appendChild(node);
				
				document.body.appendChild(objTempSpan);
				
				this.spans.push(objTempSpan);
	    	}
		    
		    this.timer = new Timing.Timer(this.interval);
			this.timer.onTick = dojo.hitch(this, this._checkFonts);
		},
		
	    /**
        * @method start
        * start checking for the loaded fonts
        */
		start : function()
		{
			this.startTime = new Date().getTime();
			this.timer.start();
		},
		
		_checkFonts : function () 
		{
			var intCurrFontIdx = 0;
			while (intCurrFontIdx < this.fonts.length)
			{
				var fontName = this.fonts[intCurrFontIdx].name;
				this.context.font = "72px " + fontName + ", " + this.defaultFont;
				
				// checking the size of the font we want to check
			    var newSize = this.context.measureText(this.text).width;
			    
			    // If different size means that it loaded and we can remove it from the fonts to check list
			    if (newSize != this.baselineSize) 
			    {
			    	this.fonts.splice(intCurrFontIdx, 1);
			    }
			    else
		    	{
			    	++intCurrFontIdx;
		    	}
			}
			
			if (this.fonts.length == 0)
			{
				this._end();
				
				if (this.callback)
					this.callback(this.fonts);
			}
			else 
			{
				var nowTime = new Date().getTime();
				
				if (nowTime - this.startTime > this.timeout)
				{
					this._end();
					
					if (this.callback)
						this.callback(this.fonts);
				}
			}
		},
		
		_end : function()
		{
			this.timer.stop();
			
			this.spans.forEach(function(item)
			{
				document.body.removeChild(item);
			});
			
			this.spans = [];
		}
	});
});

