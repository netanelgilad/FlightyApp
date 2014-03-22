/**
* @class NeWMI.Draw.Styles.Geometry.Lines.MultiLineStyles
* Multi Line styles - Allowing combine several line styles as one
* @extends NeWMI.Draw.Styles.Geometry.Lines.ALineStyle
*/
define(["dojo/_base/declare",
        "NeWMI/Draw/Styles/Geometry/AGeoStyle",
        "NeWMI/Draw/Styles/Geometry/Lines/ALineStyle",
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
            return declare("NeWMI.Draw.Styles.Geometry.Lines.MultiLineStyles", ALineStyle, {
		
        "-chains-":
		{
		    constructor: "manual"
		},

        ///
        /// Possible params
        ///{
        ///     styles : [ LineStyle1, LineStyle2, ...]
        ///}

        /**
        * @constructor
        * Creates new StartEndSymbolStyle instance
        * @param {Object} [params] The style initial parameters
        * @param {NeWMI.Draw.Styles.Geometry.Lines.ALineStyle[]} [params.styles=[]] The line styles for this multi style line
        */
        constructor: function (params)
        {
            this.type = AGeoStyle.Types.MultiLineStyles;

            this.inherited(arguments);
            
            params = params || {};

            /**
            * @property {NeWMI.Draw.Styles.Geometry.Lines.ALineStyle[]} [styles=[]]
            * The line styles for this multi style line
            */
            this.styles = params.styles || [];
        },

        draw: function (p_objContext, p_arrPts, p_blnIsClosed) {

            this.styles.forEach(function (item) {
                item.draw(p_objContext, p_arrPts, p_blnIsClosed);
            }, this);
            
        }
	});

});
