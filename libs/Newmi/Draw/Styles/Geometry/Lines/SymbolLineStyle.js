/**
* @class NeWMI.Draw.Styles.Geometry.Lines.SymbolLineStyle
* Line built on symbols and intervals - Drawing symbols in given spaces for constructing the line
* @extends NeWMI.Draw.Styles.Geometry.Lines.ASymbolLineStyle
* <pre><code>
* var style = new SymbolLineStyle({
*		        contextParams: {
*		            fillStyle: 'black'
*		        },
*		        symbol: new NeWMI.Draw.Types.FontValue({ font: "15px webdings", value: "5" }),
*		        interval: 20,
*		        seperateSegments: true,
*		        outline: 3,
*		        endOutline: 3,
*		        startOffset: 5,
*		        endOffset: 5
*		    });
* .
* .
* .
* // In draw cycle
* NeWMI.Draw.Draw2D.styled(p_objMap, p_objContext, geometry, style);
* </code></pre>
*/
define(["dojo/_base/declare",
        "NeWMI/Draw/Styles/Geometry/AGeoStyle",
        "NeWMI/Draw/Styles/Geometry/Lines/ALineStyle",
        "NeWMI/Draw/Styles/Geometry/Lines/ASymbolLineStyle",
        "NeWMI/Service/Create/GeometrySvc",
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Draw/Types/FontValue",
        "NeWMI/Draw/Draw2D",
        "NeWMI/Draw/StringSizeCalculator"],
        function (declare,
                AGeoStyle,
                ALineStyle,
                ASymbolLineStyle,
                CreateGeoSvc,
                MeasurementSvc,
                FontValue,
                Draw2D,
                StringSizeCalculator) {
            return declare("NeWMI.Draw.Styles.Geometry.Lines.SymbolLineStyle", ASymbolLineStyle, {
		
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
        ///     startSymbol : new NeWMI.Draw.Types.FontValue({font:"12px arial", value:"<"}),
        ///     endSymbol : new NeWMI.Draw.Types.FontValue({font:"12px arial", value:">"}),
        ///     rotateToLine : false,
        ///     seperateSegments : false,
        ///     outline: 15,
        ///     endOutline : 15,
        ///     startOffset: 0,
        ///     endOffset: 0
        ///     outlineCornerFlex : 4
        ///}

       /**
       * @constructor
       * Creates new SymbolLineStyle instance
       * @param {Object} [params] The style initial parameters
       * @param {NeWMI.Draw.Types.FontValue} [params.symbol] The symbol that constructs the line
       * @param {Number} [params.interval=1] The space between each symbol to the next one
       * @param {Object} [contextParams] Contains the properties as they are in the Canvas (Context '2d'), and their values
       * @param {Boolean} [seperateSegments=false] seperateSegments Contains the properties as they are in the Canvas (Context '2d'), and their values
       * @param {Number} [outline=0] The outlined offset from the real line in the beginning of th line
       * @param {Number} [endOutline=NeWMI.Draw.Styles.Geometry.Lines.ALineStyle.outline] The outlined offset from the real line in the end of the line
       * @param {Number} [outlineCornerFlex=3] Contains the properties as they are in the Canvas (Context '2d'), and their values
       * @param {Number} [startOffset=0] The offset from the beginning of the line - When we want to change out start our the line position
       * @param {Number} [endOffset=0] The offset from the end of the line - When we want to change out end our the line position
       */
        constructor: function (params)
        {
            this.type = AGeoStyle.Types.SymbolLine;

            this.inherited(arguments);
            
            params = params || {};
            /**
            * @property {NeWMI.Draw.Types.FontValue} symbol
            * The symbol that constructs the line
            */
            this.symbol = new FontValue(params.symbol);
            /**
            * @property {Number} interval
            * The space between each symbol to the next one
            */
            this.interval = params.interval || 1;
        },

        _setContext: function (p_objContext) {

            this.inherited(arguments);

            p_objContext.font = this.symbol.font;
        },

        draw: function (p_objContext, p_arrPts, p_blnIsClosed) {

            if (!this.interval)
                return;

            var objPts = this._getPoints(p_arrPts, p_blnIsClosed);

            this._setContext(p_objContext);

            var charMetrics = StringSizeCalculator.getStringMetrics(this.symbol.value, this.symbol.font);

            objPts.polylines.forEach(function (objCurrPolyline) {
                if (objCurrPolyline) {

                    var dblDistFromLastSeg = this.interval;
                    var intCloseSeg = objPts.isCloseSegIncluded ? 0 : 1;
                    for (var intCurrSeg = 0; intCurrSeg < objCurrPolyline.length - 1 + intCloseSeg; intCurrSeg++) {

                        var pnt = objCurrPolyline[intCurrSeg];
                        var objNextPnt = objCurrPolyline[(intCurrSeg + 1) % objCurrPolyline.length];

                        var dblSegDistance = MeasurementSvc.distance(pnt.x, pnt.y, objNextPnt.x, objNextPnt.y);
                        var dblAngle = MeasurementSvc.getTrigonometricAngle(pnt.x, pnt.y, objNextPnt.x, objNextPnt.y);

                        p_objContext.save();
                        Draw2D.rotateAtPoint(p_objContext, pnt.x, pnt.y, dblAngle);

                        // Cutting the leftover of the previous segment
                        dblSegDistance = dblSegDistance - (this.interval - dblDistFromLastSeg);

                        var intSymbolsInSegment = Math.floor(dblSegDistance / this.interval) + 1;

                        for (var intCurrSymbol = 0; intCurrSymbol < intSymbolsInSegment; intCurrSymbol++) {
                            var calcedPnt = {x: pnt.x + (this.interval - dblDistFromLastSeg) + (intCurrSymbol * this.interval), 
                                y: pnt.y
                            };

                            Draw2D.symbol(p_objContext, this.symbol.value, calcedPnt.x, calcedPnt.y, charMetrics);
                        }

                        p_objContext.restore();

                        dblDistFromLastSeg = dblSegDistance - ((intSymbolsInSegment - 1) * this.interval);
                    }
                }
            }, this);
        }
	});

});
