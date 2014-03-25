/**
* @class NeWMI.Draw.Styles.Geometry.Lines.SimpleLineStyle
* Simple line - The line is drawn as it is with some properties
* @extends NeWMI.Draw.Styles.Geometry.Lines.ALineStyle
* <pre><code>
* var simpleLineStyle = new NeWMI.Draw.Styles.Geometry.Lines.SimpleLineStyle({
*       contextParams: {
*           lineWidth: 3,
*           strokeStyle: "red"
*       },
*       dash: [10, 10],
*       outline: 10
*   });
*
* .
* .
* .
* // In draw cycle
* NeWMI.Draw.Draw2D.styled(p_objMap, p_objContext, geometry, simpleLineStyle);
* </code></pre>
*/
define(["dojo/_base/declare",
        "NeWMI/Draw/Styles/Geometry/AGeoStyle",
        "NeWMI/Draw/Styles/Geometry/Lines/ALineStyle",
        "NeWMI/Service/Create/GeometrySvc",
        "NeWMI/Draw/Draw2D"],
        function (declare,
            AGeoStyle,
                    ALineStyle,
                    CreateGeoSvc,
                    Draw2D) {
    return declare("NeWMI.Draw.Styles.Geometry.Lines.SimpleLineStyle", ALineStyle, {
		
        "-chains-":
		{
		    constructor: "manual"
		},

        ///
        /// Possible params
        ///{
        ///     contextParams: { // All context parameters related for drawing the line
        ///         lineWidth: 3,
        ///         strokeStyle: "red",
        ///         lineDashOffset: 4
        ///         ...
        ///     },
        ///     dash: [5, 3, 10, 3, 15, 3, 20, 3],
        ///
        ///     seperateSegments : false,
        ///     outline: 15,
        ///     endOutline: 15,
        ///     startOffset: 40,
        ///     endOffset: 40,
        ///     outlineCornerFlex : 4
        ///}

        /**
        * @constructor
        * Creates new SimpleLineStyle instance
        * @param {Object} [params] The style initial parameters
        * @param {Number[]} [params.dash=[]] Dashing information - When we want the line to be dashed we can give here the values of how many pixels to draw, and how many to have space
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
            this.type = AGeoStyle.Types.SimpleLine;

            this.inherited(arguments);
            
            params = params || {};

            this.dash = params.dash || [];
        },

        _setContext: function (p_objContext) {

            this.inherited(arguments);

            Draw2D.setContextParams(p_objContext, this.contextParams);

            p_objContext.setLineDash(this.dash);
        },

        draw: function (p_objContext, p_arrPts, p_blnIsClosed) {

            var objPts = this._getPoints(p_arrPts, p_blnIsClosed);

            this._setContext(p_objContext);

            objPts.polylines.forEach(function (objCurrPolyline) {
                if (objCurrPolyline) {
                    var pixPnt = objCurrPolyline[0];

                    p_objContext.beginPath();
                    p_objContext.moveTo(pixPnt.x, pixPnt.y);

                    for (var intCurrPt = 1; intCurrPt < objCurrPolyline.length; intCurrPt++) {
                        pixPnt = objCurrPolyline[intCurrPt];
                        p_objContext.lineTo(pixPnt.x, pixPnt.y);
                    }

                    if (!objPts.isCloseSegIncluded) {
                        p_objContext.closePath();
                    }

                    p_objContext.stroke();
                }
            }, this);
        }
	});

});
