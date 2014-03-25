/**
* @class NeWMI.Draw.Styles.Geometry.Fill.HatchPatterns
* Provides an hatch pattern services
* @static
* <pre><code>
* // In draw cycle
* p_objContext.fillStyle = HatchPatterns.getPattern(p_objContext, HatchPatterns.Types.ZigZag);
* NeWMI.Draw.Draw2D.geometry(p_objMap, p_objContext, geometry);
* </code></pre>
*/
define(["dojo/_base/declare",
        "NeWMI/Draw/Draw2D"],
        function (  declare, Draw2D) {
        var HatchPatterns = declare("NeWMI.Draw.Styles.Geometry.Fill.HatchPatterns", null, {

            constructor: function () {
                this._hatchImages = {};
                this._hatchImages[HatchPatterns.Types.Percent20] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVQIW2NkYGD4D8SMQAwGcAY2AbBKDBUAVuYCBQPd34sAAAAASUVORK5CYII=';
                this._hatchImages[HatchPatterns.Types.Percent40] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVQIW2NkgID/jCACiBkBDx8CAhQOwfMAAAAASUVORK5CYII=';
                this._hatchImages[HatchPatterns.Types.Percent60] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVQIW2NkgID/UJqBEZkDEkQWALMxVAAAqFwFAVHEKVUAAAAASUVORK5CYII=';
                this._hatchImages[HatchPatterns.Types.Percent80] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAYAAACzzX7wAAAAG0lEQVQIW2NkgID/UBqDYsQnCVKNTQGKGEETAGCrBQH887/vAAAAAElFTkSuQmCC';
                this._hatchImages[HatchPatterns.Types.Horizontal] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAICAYAAAA4GpVBAAAAEklEQVQIW2NkYGD4zwgkGPATACS4AQh+JU/nAAAAAElFTkSuQmCC';
                this._hatchImages[HatchPatterns.Types.Vertical] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAABCAYAAADjAO9DAAAAE0lEQVQIW2NkYGD4D8SMQIwVAAAdPgECoiDbKwAAAABJRU5ErkJggg==';
                this._hatchImages[HatchPatterns.Types.LightUpwardDiagonal] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAHklEQVQIW2NkQAX/GZH4/4FsRpgAmAOSBBFwDkgAAIKuBATRTAAZAAAAAElFTkSuQmCC';
                this._hatchImages[HatchPatterns.Types.LightDownwardDiagonal] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAH0lEQVQIW2NkYGD4D8SMQAwGMAZcEC4DU4ksANLxHwCC4QQE/R3QmAAAAABJRU5ErkJggg==';
                this._hatchImages[HatchPatterns.Types.ForwardDiagonal] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPUlEQVQYV2NkYGDYDMQzgXgLEKMDH0agiA8Qp+NSBFIAAjgVwRTgVISsAKsidAUYirApQFEE8wVWL4J8BwBHAw9U8AK7ywAAAABJRU5ErkJggg==';
                this._hatchImages[HatchPatterns.Types.BackwardDiagonal] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPUlEQVQYV2NkYGDwAeItQIwOQOINjFgkQEJgSVwK4JIgk9FNQJEEGYWsAEMSWQFWSZgCnJIwBWegLsbqVQBiRQ9twzIJ4AAAAABJRU5ErkJggg==';
                this._hatchImages[HatchPatterns.Types.Cross] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGUlEQVQYV2NkYGD4D8Q4ASNUAYjGCoaHAgCIyAgI9PJYGAAAAABJRU5ErkJggg==';
                this._hatchImages[HatchPatterns.Types.DiagonalCross] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPUlEQVQYV2NkYGA4A8QNQLwFiNGBDyNQxAeqAF0RWBykAATQFcH5MAXoikCmgU1EVoDNJAaiTcDrBry+AAAVIRaFjvIqKgAAAABJRU5ErkJggg==';
                this._hatchImages[HatchPatterns.Types.ZigZag] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAYAAACzzX7wAAAAKUlEQVQIW2NkQAX/oVxGmDCcARQAScL4cDaGAJKBYEUgBcg60Wxk+A8AlcAHBMN+CT0AAAAASUVORK5CYII=';

                // Saved for caching the images
                this._images = {};
            }

        });
	

    /**
    * @method getPattern
    * Creating an hatch style pattern
    * @param {Object} p_objContext The canvas context object
    * @param {NeWMI.Draw.Styles.Geometry.Fill.HatchPatterns.Types} p_eHatchType The type of hatch we want
    * @param {Object} [p_fallbackStyle='black'] The fall-back style in case of error 
    * @return {Object} An HTML5 pattern fill Style
    * @static
    */
    HatchPatterns.getPattern = function (p_objContext, p_eHatchType, p_fallbackStyle) {

        var image = HatchPatterns._instance._images[p_eHatchType];

        if (!image) {
            var imgSrc = HatchPatterns._instance._hatchImages[p_eHatchType];
            if (imgSrc) {
                image = new Image();
                image.src = imgSrc;

                HatchPatterns._instance._images[p_eHatchType] = image;
            }
        }

        if (!image) {
            return p_fallbackStyle || 'black';
        }

        return p_objContext.createPattern(image, 'repeat');
    }

    /** @enum {String} NeWMI.Draw.Styles.Geometry.Fill.HatchPatterns.Types
        * The possible hatch types
        */
    HatchPatterns.Types = {
        /** 20 Percent fill */
        Percent20: "Percent20",
        /** 40 Percent fill */
        Percent40: "Percent40"
        /** 60 Percent fill */,
        Percent60: "Percent60",
        /** 80 Percent fill */
        Percent80: "Percent80",
        Percent60: "Percent60",
        /** Horizontal lines */
        Horizontal: "Horizontal",
        /** Vertical lines */
        Vertical: "Vertical",
        /** Diagonal lines */
        LightUpwardDiagonal: "LightUpwardDiagonal",
        /** Downward Diagonal lines */
        LightDownwardDiagonal: "LightDownwardDiagonal",
        /** Thicker Diagonal lines */
        ForwardDiagonal: "ForwardDiagonal",
        /** Thicker Downward Diagonal lines */
        BackwardDiagonal: "BackwardDiagonal",
        /** Cross fill */
        Cross: "Cross",
        /** 45 degreed cross fill */
        DiagonalCross: "DiagonalCross",
        /** zigzag waves fill */
        ZigZag: "ZigZag",
    }

    HatchPatterns._instance = new HatchPatterns();

    return HatchPatterns;
});
