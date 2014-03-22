/**
* @class NeWMI.Draw.Styles.Geometry.Lines.ASymbolLineStyle
* Basic implementation for lines styles contains symbol\s
* @extends NeWMI.Draw.Styles.Geometry.Lines.ALineStyle
* @abstract
*/
define(["dojo/_base/declare",
        "NeWMI/Draw/Styles/Geometry/AGeoStyle",
        "NeWMI/Draw/Styles/Geometry/Lines/ALineStyle",
        "NeWMI/Service/Create/GeometrySvc",
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Draw/Types/FontValue",
        "NeWMI/Draw/Draw2D"],
        function (declare,
                AGeoStyle,
                ALineStyle,
                CreateGeoSvc,
                MeasurementSvc,
                FontValue,
                Draw2D) {
        return declare("NeWMI.Draw.Styles.Geometry.Lines.ASymbolLineStyle", ALineStyle, {
		
        "-chains-":
		{
		    constructor: "manual"
		},

        ///
        /// Possible params
        ///{
        ///     contextParams : {
        ///         fillStyle : 'red',
        ///         ...
        ///     },
        ///     rotateToLine : false,
        ///     seperateSegments : false,
        ///     outline: 15,
        ///     endOutline : 15,
        ///     startOffset: 0,
        ///     endOffset: 0
        ///}

        constructor: function (params)
        {
            this.inherited(arguments);
        },

       _setContext: function (p_objContext) {

            this.inherited(arguments);

            Draw2D.setContextParams(p_objContext, this.contextParams);

            /*else if (this.ctxLineParams) {
                Draw2D.setContextParams(p_objContext, this.ctxLineParams);

                if (this.dash) {
                    p_objContext.setLineDash(this.dash.data);
                    p_objContext.lineDashOffset = this.dash.offset;
                }
            }*/

            // Seting the symbol drawing to be in the center of the point
            p_objContext.textAlign = 'center';
            p_objContext.textBaseline = 'middle';
       },

       _drawSymbol : function(p_objContext, p_objFontValue, p_objPnt, p_dblAngle)
       {
           // Rotating the symbol
           if (p_dblAngle) {
               p_objContext.save();
               Draw2D.rotateAtPoint(p_objContext, p_objPnt.x, p_objPnt.y, p_dblAngle);
           }

           p_objContext.font = p_objFontValue.font;
           Draw2D.symbol(p_objContext, p_objFontValue.value, p_objPnt.x, p_objPnt.y);

           //Draw2D.point(p_objContext, p_objPnt.x, p_objPnt.y, 5);

           if (p_dblAngle) {
               p_objContext.restore();
           }
       }
	});

});
