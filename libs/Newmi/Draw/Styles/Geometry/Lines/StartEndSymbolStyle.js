/**
* @class NeWMI.Draw.Styles.Geometry.Lines.StartEndSymbolStyle
* Start and end Symbol - Drawing symbols (Font) at the beginning and\or end of the line
* @extends NeWMI.Draw.Styles.Geometry.Lines.ASymbolLineStyle
* <pre><code>
* var style = new NeWMI.Draw.Styles.Geometry.Lines.StartEndSymbolStyle({
*		        contextParams: {
*		            fillStyle : 'green'
*		        },
*		        startSymbol: new NeWMI.Draw.Types.FontValue({ font: "40px webdings", value: "n" }),
*		        endSymbol: null,
*		        rotateToLine: true,
*		        seperateSegments: true        
*		    });
*
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
        "NeWMI/Draw/Draw2D"],
        function (declare,
                AGeoStyle,
                ALineStyle,
                ASymbolLineStyle,
                CreateGeoSvc,
                MeasurementSvc,
                FontValue,
                Draw2D) {
            return declare("NeWMI.Draw.Styles.Geometry.Lines.StartEndSymbolStyle", ASymbolLineStyle, {
		
        "-chains-":
		{
		    constructor: "manual"
		},

        ///
        /// Possible params
        ///{
        ///     contextParams : {
        ///         fillStyle : 'red'
        ///         ...
        ///     },
        ///     startSymbol : new NeWMI.Draw.Types.FontValue({font:"12px arial", value:"<"}),
        ///     endSymbol : new NeWMI.Draw.Types.FontValue({font:"12px arial", value:">"}),
        ///     rotateToLine : false,
        ///     seperateSegments : false,
        ///     outline: 15,
        ///     endOutline : 15,
        ///     startOffset: 0,
        ///     endOffset: 0,
        ///     outlineCornerFlex : 4
        ///}

        /**
        * @constructor
        * Creates new StartEndSymbolStyle instance
        * @param {Object} [params] The style initial parameters
        * @param {NeWMI.Draw.Types.FontValue} [params.startSymbol] The symbol to draw at the start of the line
        * @param {NeWMI.Draw.Types.FontValue} [params.endSymbol] The symbol to draw at the end of the line
        * @param {Boolean} [params.rotateToLine] If true, the symbols will be rotated to the angle of the line
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
            this.type = AGeoStyle.Types.StartEndSymbol;

            this.inherited(arguments);
            
            params = params || {};

            if (params.startSymbol) {
                /**
                * @property {NeWMI.Draw.Types.FontValue} startSymbol
                * The symbol to draw at the start of the line
                */
                this.startSymbol = new FontValue(params.startSymbol);
            }
            if (params.endSymbol) {
                /**
                * @property {NeWMI.Draw.Types.FontValue} endSymbol
                * The symbol to draw at the end of the line
                */
                this.endSymbol = new FontValue(params.endSymbol);
            }

            /**
            * @property {Boolean} rotateToLine
            * If true, the symbols will be rotated to the angle of the line
            */
            this.rotateToLine = params.rotateToLine || true;
        },

        draw: function (p_objContext, p_arrPts, p_blnIsClosed) {

            if (!this.startSymbol && !this.endSymbol)
                return;

            var objPts = this._getPoints(p_arrPts, p_blnIsClosed);

            this._setContext(p_objContext);

            objPts.polylines.forEach(function (objCurrPolyline) {
                if (objCurrPolyline) {

                    if (this.startSymbol) {

                        var pnt = objCurrPolyline[0];

                        var dblRotationAngle = 0;
                        if (this.rotateToLine) {
                            dblRotationAngle = MeasurementSvc.getTrigonometricAngle(pnt.x, pnt.y, objCurrPolyline[1].x, objCurrPolyline[1].y);
                        }

                        this._drawSymbol(p_objContext, this.startSymbol, pnt, dblRotationAngle);
                    }

                    if (this.endSymbol) {

                        var intCloseSeg = objPts.isCloseSegIncluded ? 0 : 1;

                        // Taking the last point - or incase of closed shape, the first point.
                        var pnt = objCurrPolyline[(objCurrPolyline.length - 1 + intCloseSeg) % objCurrPolyline.length];

                        var dblRotationAngle = 0;
                        if (this.rotateToLine) {
                            dblRotationAngle = MeasurementSvc.getTrigonometricAngle(objCurrPolyline[objCurrPolyline.length - 2 + intCloseSeg].x, objCurrPolyline[objCurrPolyline.length - 2 + intCloseSeg].y, pnt.x, pnt.y);
                        }

                        this._drawSymbol(p_objContext, this.endSymbol, pnt, dblRotationAngle);
                    }
                }
            }, this);
        }
	});

});
