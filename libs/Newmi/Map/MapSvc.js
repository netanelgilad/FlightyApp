/**
* @class NeWMI.Map.MapSvc
* <p>Provides the map services, such as blinking,...</p>
* Each map instance contains property NeWMI.Map.Base.ABasicMap.svc which provides this services instance
*/
define(["dojo/_base/declare",
        "NeWMI/Map/SvcBL/BlinkingSvc"],
        function (declare,
                  BlinkingSvc)
        {
            return declare("NeWMI.Map.MapSvc", null,
            {
                constructor: function (p_objMap)
                {
                    this.m_objMap = p_objMap;
                },

                //#REGION_______!!!!!!_______BLINKING_______!!!!!!_______
                _getBlinkSvc: function ()
                {
                    //creating the blinking services instance on the first time it was called (no need to create it on a map that never used blinking)
                    this.m_blinkSvc = this.m_blinkSvc || new BlinkingSvc(this.m_objMap);
                    return this.m_blinkSvc;
                },

                /**
                 * @method blink
		         * Blinking given geometries, texts and images
                 *
		         * @param {Object} p_objData2Blink The data to blink
                 * @param {NeWMI.Geometry.Base.AGeometry[]} [p_objData2Blink.geos] The geometries to blink
                 * @param {Array} [p_objData2Blink.imgs] The images array to blink - Each item is an object as describes below
                 * @param {Object} p_objData2Blink.imgs.item The image item in the array
                 * @param {Object} p_objData2Blink.imgs.item.center The center point of the image
                 * @param {Number} p_objData2Blink.imgs.item.center.x The center X point of the image
                 * @param {Number} p_objData2Blink.imgs.item.center.y The center Y point of the image
                 * @param {Object} p_objData2Blink.imgs.item.img The image (HTML object)
                 * @param {Array} [p_objData2Blink.txts] The texts array to blink
                 * @param {Object} p_objData2Blink.txts.item Text item
                 * @param {Object} p_objData2Blink.txts.item.center The center point of the image
                 * @param {Number} p_objData2Blink.txts.item.center.x The center X point of the image
                 * @param {Number} p_objData2Blink.txts.item.center.y The center Y point of the image
                 * @param {String} p_objData2Blink.txts.item.txt The string text value
                 * @param {Object} p_objData2Blink.style The styles for the blink
                 * @param {String} p_objData2Blink.style.txtColor The text color
                 * @param {Number} p_objData2Blink.style.txtSize The text size
                 * @param {String} p_objData2Blink.style.txtFont The text font
                 * @param {String} p_objData2Blink.style.geoColor The geometries color
                 * @param {Number} p_objData2Blink.style.geoWidth The geometries width
                 * @param {Number} p_objData2Blink.style.pointSize The point size
                 * @param {Number} [p_intDuration=3000] The total time of the blinking process
                 * @param {Number} [p_intSpeed=300] The time between showing and hiding the blinking drawings
		         */
                blink: function (p_objData2Blink, p_intDuration, p_intSpeed)
                {
                    this._getBlinkSvc().blink(p_objData2Blink, p_intDuration, p_intSpeed);
                },

                /**
                 * @method reBlink
		         * Blinking the last given parameters
                 */
                reBlink : function()
                {
                    this._getBlinkSvc().startBlinkingLastValues();
                },

                /**
                 * @method stopBlink
		         * stop the blinking process
                 */
                stopBlink: function ()
                {
                    this._getBlinkSvc().stopBlinking();
                }
                //#ENDREGION_______!!!!!!_______BLINKING_______!!!!!!_______
            });
        });