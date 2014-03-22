/**
* @class NeWMI.Draw.Template.TemplateParser
* <p>Provides a template reader\parser from a given XML\URL to xml</p>
* @static
*/
define(["dojo/_base/declare",
        "NeWMI/Draw/Template/TemplateObjectPosProps"], 
        function(declare, TemplateObjectPosProps){
	
        var TemplateParser = dojo.declare("NeWMI.Draw.Template.TemplateParser", null, {});

        /**
        * @method parse
		* Parsing a given XML URL to templates arrays 
        * @param {String} xmlPath URL to the templates XML
        * @param {Function} callbackFunc Callback for end parser event. The callback will get an Dictionary with the templates. The keys will be the name of the template and the value will be
        * the array of NeWMI.Draw.Template.TemplateObjectPosProps
        * @static
        */
        TemplateParser.parse = function(xmlPath, callbackFunc){
					
            var me = this;
					
            $.get(xmlPath, function(xmlDoc)
            {
                var ret = me.parseXml($(xmlDoc));
						
                callbackFunc(ret);
            });
        };

        /**
        * @method parseString
		* Parsing a given xml as string to templates arrays
        * @param {String} str Templates XML structured string
        * @return {dojox.collections.Dictionary} Dictionary with the templates. The keys will be the name of the template and the value will be
        * the array of NeWMI.Draw.Template.TemplateObjectPosProps
        * @static
        */
        TemplateParser.parseString = function(str)
        {
            var objDomParser = new DOMParser();
            var xml = objDomParser.parseFromString(str, "text/xml");
            var $xml = $(xml);
            return this.parseXml($xml);
        };

        /**
        * @method parseXml
		* Parsing a given jquery xml to templates arrays
        * @param {Object} $xml Templates jquery xml structured
        * @return {dojox.collections.Dictionary} Dictionary with the templates. The keys will be the name of the template and the value will be
        * the array of NeWMI.Draw.Template.TemplateObjectPosProps
        * @static
        */
        TemplateParser.parseXml = function ($xml) {
            var colTemplate = {};

            var me = this;

            $xml.find("Template").each(function () {

                var templateName = $(this).children("Name").text();
                var colPosProps = [];
                var objPosProps;

                $(this).find("CCTemplateObjectPosProps").each(function () {

                    var objectPosPropsName = $(this).find("Name").text();

                    var arrTemp;

                    arrTemp = ($(this).find("OffsetPixels").length > 0) ? $(this).find("OffsetPixels").text().split(",") : [];
                    var _OffsetPixels;
                    if (arrTemp.length > 0)
                        _OffsetPixels = { x: arrTemp[0], y: arrTemp[1], z: 0 };

                    arrTemp = ($(this).find("RelativeSizePosition").length > 0) ? $(this).find("RelativeSizePosition").text().split(",") : [];
                    var _RelativeSizePosition;
                    if (arrTemp.length > 0)
                        _RelativeSizePosition = { width: parseFloat(arrTemp[0]), height: parseFloat(arrTemp[1]) };

                    var txtRelatedToIndex = $(this).find("RelatedToIndex").text();
                    if (txtRelatedToIndex.length == 0) {
                        txtRelatedToIndex = -1;
                    }
                    var txtDrawItem = $(this).find("IsDrawItem").text();
                    if (txtDrawItem.length == 0) {
                        txtDrawItem = 'true';
                    }
                    var txtHorizAlign = $(this).find("HorizontalAlignment").text();
                    var txtVertAlign = $(this).find("VerticalAlignment").text();

                    objPosProps = new TemplateObjectPosProps({
                        name: objectPosPropsName,
                        isSpecific: (txtRelatedToIndex != "" && txtRelatedToIndex == "-1") ? true : false,
                        relatedToIndex: parseInt(txtRelatedToIndex),
                        relativeSizePosition: _RelativeSizePosition,
                        offset: _OffsetPixels,
                        isDrawItem: Boolean(txtDrawItem),
                        horizontalAlignment: me.convertAlignment(txtHorizAlign, false),
                        verticalAlignment: me.convertAlignment(txtVertAlign, true)
                    });

                    colPosProps.push(objPosProps);

                });

                colTemplate[templateName] = colPosProps;


            });

            return colTemplate;
        };
			
        /**
        * @method convertAlignment
        * Converting an .Net alignment to HTML
        * @param {String} align The alignment value
        * @param {Boolean} isVert Is the alignment is vertical
        * @return {String} HTML Alignment string
        * @static
        */
        TemplateParser.convertAlignment = function (align, isVert) {
            if (isVert) {
                switch (align.toLowerCase()) {
                    case ('near'):
                        return 'top';
                        break;
                    case ('center'):
                        return 'middle';
                        break;
                    case ('far'):
                        return 'bottom';
                        break;
                }

                return 'middle';
            }
            else {
                switch (align.toLowerCase()) {
                    case ('near'):
                        return 'start';
                        break;
                    case ('center'):
                        return 'center';
                        break;
                    case ('far'):
                        return 'end';
                        break;
                }

                return 'center';
            }
        };
        
		
	return TemplateParser;
});