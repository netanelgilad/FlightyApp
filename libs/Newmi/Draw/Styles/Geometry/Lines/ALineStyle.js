/**
* @class NeWMI.Draw.Styles.Geometry.Lines.ALineStyle
* Represents the common properties of all the lines styles
* @extends NeWMI.Draw.Styles.Geometry.AGeoStyle
* @abstract
*/
define(["dojo/_base/declare",
        "NeWMI/Draw/Styles/Geometry/AGeoStyle",
        "NeWMI/Service/Create/GeometrySvc"],
        function (declare,
                    AGeoStyle,
                    CreateGeoSvc) {
        return declare("NeWMI.Draw.Styles.Geometry.Lines.ALineStyle", AGeoStyle, {
		
        "-chains-":
		{
		    constructor: "manual"
		},

        constructor: function (params)
        {
            this.inherited(arguments);

            params = params || {};

            /**
            * @property {Object} contextParams
            * Contains the properties as they are in the Canvas (Context '2d'), and their values
            */
            this.contextParams = {};

            // If there are fill params for the StartEndSymbolStyle
            if (params.contextParams) {
                dojo.mixin(this.contextParams, params.contextParams);
            }

            /**
            * @property {Boolean} [seperateSegments=false]
            * If true, it means that each segment in the line will be referenced as new line
            */
            this.seperateSegments  = params.seperateSegments || false;

            /**
            * @property {Number} [outline=0]
            * The outlined offset from the real line in the beginning of th line
            */
            this.outline = params.outline || 0;

            /**
            * @property {Number} [endOutline=NeWMI.Draw.Styles.Geometry.Lines.ALineStyle.outline]
            * The outlined offset from the real line in the end of the line
            */
            this.endOutline = params.endOutline === undefined ? this.outline : params.endOutline;

            /**
            * @property {Number} [outlineCornerFlex=3]
            * The corner flexibility when using outline
            */
            this.outlineCornerFlex  = params.outlineCornerFlex === undefined ? 3 : params.outlineCornerFlex;

            /**
            * @property {Number} [startOffset=0]
            * The offset from the beginning of the line - When we want to change out start our the line position
            */
            this.startOffset = params.startOffset || 0;

            /**
            * @property {Number} [endOffset=0]
            * The offset from the end of the line - When we want to change out end our the line position
            */
            this.endOffset = params.endOffset || 0;
        },

        _getPoints: function (p_arrPts, p_blnIsClosed) {

            var arrPts = [];
            var retVal = {
                polylines: arrPts,
                isCloseSegIncluded: !p_blnIsClosed
            };

            var blnIsCloned = false;

            if (this.seperateSegments) {

                var intClosedSeg = 0;
                if (p_blnIsClosed) {
                    intClosedSeg = 1;
                }
                for (var intCurrPtIndex = 0; intCurrPtIndex < p_arrPts.length - 1 + intClosedSeg; intCurrPtIndex++) {
                    arrPts.push([p_arrPts[intCurrPtIndex],
                                    p_arrPts[(intCurrPtIndex + 1) % p_arrPts.length]]);
                }

                blnIsCloned = true;

                // Setting the closed flag to false because we just create the segments now
                p_blnIsClosed = false;
                retVal.isCloseSegIncluded = true;
            }
            else {
                arrPts.push(p_arrPts);
            }

            if (this.outline || this.endOutline || this.startOffset || this.endOffset) {
                arrPts.forEach(function (item, index) {

                    // Making the outline
                    if (this.outline || this.endOutline) {

                        arrPts[index] = CreateGeoSvc.createOutline(item, this.outline, { widening: this.endOutline - this.outline, isClosed: p_blnIsClosed, cornerFlexFactor: this.outlineCornerFlex });
                        blnIsCloned = true;
                    }

                    // Offsetting the edges
                    if (this.startOffset || this.endOffset) {
                        arrPts[index] = CreateGeoSvc.adjustEdges(arrPts[index], this.startOffset, this.endOffset, p_blnIsClosed, !blnIsCloned);

                        if (p_blnIsClosed) {
                            retVal.isCloseSegIncluded = p_blnIsClosed;
                        }
                    }
                }, this);
            }
            
            if (arrPts.length == 0)
            {
                arrPts.push(p_arrPts);
            }
            
            return retVal;
        },

        /**
        * @method draw
        * Drawing a given points in this style
        * @param {Object} p_objContext The canvas context
        * @param {{x,y}[]} p_arrPts Array of simple points object
        * @param {Boolean} p_blnIsClosed Is the points represents closed shape
        */
        draw: function (p_objContext, p_arrPts, p_blnIsClosed) {
        }
	});

});
