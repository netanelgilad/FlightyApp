/**
* @class NeWMI.Map.Base.AConversionSvc
* <p>Provides a map conversion services, such as map units to screen and more</p>
* Each map instance contains property NeWMI.Map.Base.ABasicMap.conversionsSvc which provides this conversion services
* @abstract
* <p>See also {@link NeWMI.Engine.ESRI.ConversionSvc} esri conversions, {@link NeWMI.Engine.Google.ConversionSvc} Google conversions</p>
*/
define(["dojo/_base/declare"],
        function (declare)
{
	
    return declare("NeWMI.Map.Base.AConversionSvc", null,
    {
        /** @property {Number} MainSR_WKID=4326
        * The main spatial reference factory code
        * @static
        * @readonly
        */
        MainSR_WKID: 4326,

        /** @property {Number} WebMercatorSR_WKID=102100
        * The Web Mercator spatial reference factory code
        * @static
        * @readonly
        */
        WebMercatorSR_WKID : 102100,

        /**
        * @method toMap
        * Converting the screen point to map
        *
        * @param {Number} p_dblX The screen X value
        * @param {Number} p_dblY The screen Y value
        * @return {Object} the map point
        * @return {Number} return.x the X value
        * @return {Number} return.y the Y value
        */
        toMap: function (p_dblX, p_dblY) { return null; },

        /**
        * @method toScreen
        * Converting the map point to screen
        *
        * @param {Number} p_dblX The map X value
        * @param {Number} p_dblY The map Y value
        * @param {Boolean} [p_blnFast=true] If true, a fast mathematical conversion will be performed. Otherwise, it will perform engine conversion
        * @return {Object} the screen point
        * @return {Number} return.x the X value
        * @return {Number} return.y the Y value
        */
        toScreen: function (p_dblX, p_dblY, p_blnFast) { return null; },

        /**
        * @method toScreenSize
        * Converting the map size to screen size
        *
        * @param {Number} p_dblSize The map size to convert
        * @return {Number} The screen size
        */
        toScreenSize: function (p_dblSize) { return null; },

        /**
        * @method toMapSize
        * Converting the screen size to map size
        *
        * @param {Number} p_dblWidth The screen horizontal size. 
        * @param {Number} [p_dblHeight] The screen vertical size
        * @return {Number} When the method gets single parameter - The return value will be average of horizontal and vertical conversion
        * @return {Object} The conversion value
        * @return {Number} return.width The conversion horizontal value
        * @return {Number} return.height The conversion vertical value
        */
        toMapSize: function (p_dblWidth, p_dblHeight) { return null; },


        /**
       * @method geoToMeters
       * Converting the geographical length to meters
       *
       * @param {Number} p_dblX The location where the length need to be converted - X Value 
       * @param {Number} p_dblY The location where the length need to be converted - Y Value 
       * @param {Number} p_dblLength The length in geographical units to convert
       * @return {Number} The converted meters length
       */
        geoToMeters: function (p_dblX, p_dblY, p_dblLength) { return null; },

        /**
        * @method metersToGeo
        * Converting the meters length to geographical
        *
        * @param {Number} p_dblX The location where the length need to be converted - X Value 
        * @param {Number} p_dblY The location where the length need to be converted - Y Value 
        * @param {Number} p_dblLength The length in meters units to convert
        * @return {Number} The converted geographical length
        */
        metersToGeo: function (p_dblX, p_dblY, p_dblLength) { return null; },

        /**
        * @method pageToControl
        * Converting the screen point to map point - in pixels units
        *
        * @param {Number} x The location where the length need to be converted - X Value 
        * @param {Number} y The location where the length need to be converted - Y Value 
        * @return {Object} The point location on the map - Pixels
        * @return {Number} return.x The X point location on the map - Pixels
        * @return {Number} return.y The Y point location on the map - Pixels
        */
        pageToControl: function (x, y)
        {
            var mapLayout = this.map.getControlLayout();

            return { "x": x - mapLayout.x, "y": y - mapLayout.y };
        }
    });
});
            