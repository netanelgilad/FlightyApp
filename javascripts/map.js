var newmiConfig = 
{
    url: "/libs/Newmi",
    engine : ["esri"],
    callback: onNeWMILoaded
};

function onNeWMILoaded() {
    google.load("maps", "3", {other_params:'sensor=false', callback : function() {
        loadNeWMIModules(
            {
                callback: onReady,
                modules: ["Draw", "Geometry", "GoogleEngine", "Object", "Layer", "ESRIEngine"]
            });
    }});
}

var map;
var image;
var refreshTimer;
var refreshFunction;
var simulateTimer;
var simulateFunction;
var realTimer;
var realFunction;
function onReady() {
    map = new NeWMI.Engine.ESRI.Map('mapContainer');
    var onlineMap = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer");
    map.layersMgr.insertStaticLayer(onlineMap);
    map.setPosition(34,31,7);

    image = new Image();

    $(image).load(function() {
        NeWMI.Draw.Template.TemplateParser.parse("http://localhost/NewmiTest/Template/template.php", onTemplateLoaded);
    }).attr('src', "/resources/images/plane.png");
}

function onTemplateLoaded(p_objTemplates) {
    var objLayer = new NeWMI.Layer.TemplateLayer(false);

    objLayer.name = "Objects";
    objLayer.newmiProps.id = 1;

    var color = 'rgba(51,0,255,1)';
    var selectedColor = 'rgba(125,0,200,1)';

    var objStyle3 = new NeWMI.Draw.Styles.FontStyle({
        font : '8pt arial',
        fillStyle : color,
        selectedFillStyle : selectedColor
    });

    var objImageStyle = new NeWMI.Draw.Styles.ImageStyle({ image: image, size: { width: 25, height: 25 } });
    var arrImages = [];
    arrImages[1] = objImageStyle;
    var objImagesStyle = new NeWMI.Draw.Styles.ImagesFontStyle({images: arrImages});

    var arrDrawStyles = [objImagesStyle, objStyle3, objStyle3, objStyle3, objStyle3];

    var arrObj = [];

    var arrDrawFlags = { 100000 : [ true, true, true, true, true ],
        2000000 : [ true, true, false, false, false ],
        "Whatever will be here that it's not a number will be fixed with the max scale" : [ true, false, false, false, false ]};

    arrDrawFlags[100000].symbolSizeFactor = 1.5;
    arrDrawFlags[2000000].symbolSizeFactor = 1;
    arrDrawFlags["Whatever will be here that it's not a number will be fixed with the max scale"].symbolSizeFactor = 0.5;

    objLayer.setDrawData(p_objTemplates["Forces"], arrDrawStyles, arrDrawFlags);
    objLayer.geoColor = color;

    map.layersMgr.insertAppLayer(objLayer);

    realFunction = function() {

        $.getJSON('http://localhost:3000/planes', function(data) {
            var simulateRate = $('#simulate-rate').val();
            $.each(data, function(key, value) {
                if (objLayer.dataSource.objects.containsKey(key))
                {
                    var obj = objLayer.dataSource.objects.item(key);

                    obj.drawValues.push([1], value[0], value[4], value[8], value[9]);
                    var angle = 90 - value[3];
                    if (angle < 0) angle += 360;
                    obj.geometry.angle = (angle / 180) * Math.PI;
                    obj.geometry.x = value[2];
                    obj.geometry.y = value[1];
                    obj.data.mps = map.conversionsSvc.metersToGeo(obj.geometry.x, obj.geometry.y, (((value[5] * 1.852) * 1000) / 3600) / (1000 / simulateRate));

                    objLayer.dataSource.updateObject(obj);
                }
                else
                {
                    var obj = new NeWMI.Draw.Template.TemplateObject(value[2], value[1]);

                    obj.drawValues.push([1], value[0], value[4], value[8], value[9]);
                    obj.id = key;
                    var angle = 90 - value[3];
                    if (angle < 0) angle += 360;
                    obj.geometry.angle = (angle / 180) * Math.PI;
                    obj.data = {};
                    obj.data.mps = map.conversionsSvc.metersToGeo(obj.geometry.x, obj.geometry.y, (((value[5] * 1.852) * 1000) / 3600) / (1000 / simulateRate));

                    objLayer.dataSource.addObject(obj);
                }
            });

            $.each(objLayer.dataSource.objects.getValueList(), function(key, value) {
                if (!data.hasOwnProperty(value.id)) {
                    objLayer.dataSource.removeObject(objLayer.dataSource.objects.item(value.id));
                }
            });

            $("#plane-count").text(objLayer.dataSource.objects.getKeyList().length);
        })
    };

    realTimer = setInterval(realFunction, 3000);

    simulateFunction = function() {
        //var started = new Date();
        $.each(objLayer.dataSource.objects.getValueList(), function(key, value) {
            if (value.geometry.angle != 0 && value.data.mps != 0) {
                value.geometry.x = value.geometry.x + (Math.cos(value.geometry.angle) * value.data.mps);
                value.geometry.y = value.geometry.y + (Math.sin(value.geometry.angle) * value.data.mps);
                //value.geometry.x += 0.001;
                //value.geometry.y += 0.001;
                objLayer.dataSource.updateObject(value);
            }
        });
        //console.log('simulate time: ' + (new Date() - started));
    };
    simulateTimer = setInterval(simulateFunction, 50);

    var fps = 0;
    var count = 0;
    refreshFunction = function() {
        fps++;
        objLayer.refresh();
    };

    refreshTimer = setInterval(refreshFunction, 50);

    setInterval(function() {
        $("#fps-data").text(fps);
        fps = 0;
    }, 1000);
}