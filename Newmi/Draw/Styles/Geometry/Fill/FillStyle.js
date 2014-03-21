/**
* @class NeWMI.Draw.Styles.Geometry.Fill.FillStyle
* Represents a styled fill in NeWMI
* @extends NeWMI.Draw.Styles.Geometry.Fill.AFillStyle
* <pre><code>
* 
* var outlineStyle = new NeWMI.Draw.Styles.Geometry.Lines.SimpleLineStyle({
*       contextParams: {
*           lineWidth: 3,
*           strokeStyle: "red"
*       }});
* var style = this.fillStyle = new NeWMI.Draw.Styles.Geometry.Fill.FillStyle({
*		        contextParams: [{
*		                            fillStyle: 'rgba(255,255,0,0.2)'
*		                        },
*                                {
*                                    fillStyle: null
*                                }],
*		        outline: outlineStyle
*		    });
* .
* .
* .
* // In draw cycle
* NeWMI.Draw.Draw2D.styled(p_objMap, p_objContext, geometry, style);
* </code></pre>
*/
define(["dojo/_base/declare",
        "NeWMI/Draw/Styles/Geometry/Fill/AFillStyle",
        "NeWMI/Draw/Draw2D"],
        function (  declare,
                    AFillStyle,
                Draw2D) {
        var FillStyle = declare("NeWMI.Draw.Styles.Geometry.Fill.FillStyle", AFillStyle, {
		
        "-chains-":
		{
		    constructor: "manual"
		},

        /**
        * @constructor
        * Creates new StartEndSymbolStyle instance
        * @param {Object} [params] The style initial parameters
        * @param {Object[]} [params.contextParams=[]] Array objects which each object properties are the properties names as they are in the Canvas (Context '2d'), and their values
        * @param {NeWMI.Draw.Styles.Geometry.Lines.ALineStyle} [params.outline] If the fill style contains outline style as well
        */
        constructor: function (params)
        {
            this.inherited(arguments);            
        },

        /**
        * @method drawGeometry
        * Drawing a given geometry with this style - on the map
        * @param {NeWMI.Map.Base.ABasicMap} p_objMap The map
        * @param {Object} p_objContext The canvas context
        * @param {NeWMI.Geometry.Base.AGeometry} p_objGeometry The geometry to draw
        */
        drawGeometry: function (p_objMap, p_objContext, p_objGeometry) {

            this.contextParams.forEach(function (item, index) {

                Draw2D.setContextParams(p_objContext, item);

                Draw2D.geometry(p_objMap,
                                p_objContext,
                                p_objGeometry,
                                this.hDraw);
            }, this);
            

            if (this.outline) {
                Draw2D.styled(p_objMap, p_objContext, p_objGeometry, this.outline);
            }
        },

        /**
        * @method draw
        * Drawing a given points set with this style
        * @param {Object} p_objContext The canvas context
        * @param {{x,y}[]} p_arrPts The shape points
        */
        draw: function (p_objContext, p_arrPts) {

            this.contextParams.forEach(function (item, index) {

                Draw2D.setContextParams(p_objContext, item);

                Draw2D.lines(p_objContext, p_arrPts, true, this.hDraw );

            }, this);

            if (this.outline) {
                this.outline.draw(p_objContext, p_arrPts, true);
            }
        }
	});

    FillStyle.Hatch =
    {
        Percent20: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVQIW2NkYGD4D8SMQAwGcAY2AbBKDBUAVuYCBQPd34sAAAAASUVORK5CYII=',
        Percent40: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVQIW2NkgID/jCACiBkBDx8CAhQOwfMAAAAASUVORK5CYII=',
        Percent60: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVQIW2NkgID/UJqBEZkDEkQWALMxVAAAqFwFAVHEKVUAAAAASUVORK5CYII=',
        Percent80: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAYAAACzzX7wAAAAG0lEQVQIW2NkgID/UBqDYsQnCVKNTQGKGEETAGCrBQH887/vAAAAAElFTkSuQmCC',
        Horizontal: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAICAYAAAA4GpVBAAAAEklEQVQIW2NkYGD4zwgkGPATACS4AQh+JU/nAAAAAElFTkSuQmCC',
        Vertical: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAABCAYAAADjAO9DAAAAE0lEQVQIW2NkYGD4D8SMQIwVAAAdPgECoiDbKwAAAABJRU5ErkJggg==',
        LightUpwardDiagonal: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAHklEQVQIW2NkQAX/GZH4/4FsRpgAmAOSBBFwDkgAAIKuBATRTAAZAAAAAElFTkSuQmCC',
        LightDownwardDiagonal: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAH0lEQVQIW2NkYGD4D8SMQAwGMAZcEC4DU4ksANLxHwCC4QQE/R3QmAAAAABJRU5ErkJggg==',
        ForwardDiagonal: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPUlEQVQYV2NkYGDYDMQzgXgLEKMDH0agiA8Qp+NSBFIAAjgVwRTgVISsAKsidAUYirApQFEE8wVWL4J8BwBHAw9U8AK7ywAAAABJRU5ErkJggg==',
        BackwardDiagonal: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPUlEQVQYV2NkYGDwAeItQIwOQOINjFgkQEJgSVwK4JIgk9FNQJEEGYWsAEMSWQFWSZgCnJIwBWegLsbqVQBiRQ9twzIJ4AAAAABJRU5ErkJggg==',
        Cross: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGUlEQVQYV2NkYGD4D8Q4ASNUAYjGCoaHAgCIyAgI9PJYGAAAAABJRU5ErkJggg==',
        DiagonalCross: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPUlEQVQYV2NkYGA4A8QNQLwFiNGBDyNQxAeqAF0RWBykAATQFcH5MAXoikCmgU1EVoDNJAaiTcDrBry+AAAVIRaFjvIqKgAAAABJRU5ErkJggg==',
        ZigZag: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAYAAACzzX7wAAAAKUlEQVQIW2NkQAX/oVxGmDCcARQAScL4cDaGAJKBYEUgBcg60Wxk+A8AlcAHBMN+CT0AAAAASUVORK5CYII=',

        _images: {},

        createPattern: function (p_objContext, p_strHatchStyle, p_fallbackStyle) {

            var image = this._images[p_strHatchStyle];

            if (!image) {
                var imgSrc = this[p_strHatchStyle];
                if (imgSrc) {
                    image = new Image();
                    image.src = imgSrc;

                    this._images[p_strHatchStyle] = image;
                }
            }

            if (!image) {
                return p_fallbackStyle || 'black';
            }

            return p_objContext.createPattern(image, 'repeat');
        }
    }

    return FillStyle;
});
