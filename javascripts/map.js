var newmiConfig = 
{
    url: "/libs/Newmi",
    engine : ["google"],
    callback: onNeWMILoaded
};

function onNeWMILoaded() {
    google.load("maps", "3", {other_params:'sensor=false', callback : function() {
        loadNeWMIModules(
            {
                callback: onReady,
                modules: ["Draw", "Geometry", "GoogleEngine", "Object", "Layer"]
            });
    }});
}

var map;
var image;
function onReady() {
    map = new NeWMI.Engine.Google.Map('mapContainer');
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

    var arrDrawFlags = { 500 : [ true, true, true, true, true ],
        2000 : [ true, true, false, false, false ],
        "Whatever will be here that it's not a number will be fixed with the max scale" : [ true, false, false, false, false ]};

    arrDrawFlags[500].symbolSizeFactor = 1.5;
    arrDrawFlags[2000].symbolSizeFactor = 1;
    arrDrawFlags["Whatever will be here that it's not a number will be fixed with the max scale"].symbolSizeFactor = 0.5;

    objLayer.setDrawData(p_objTemplates["Forces"], arrDrawStyles, arrDrawFlags);
    objLayer.geoColor = color;

    map.layersMgr.insertAppLayer(objLayer);

    setInterval(function() {

        $.getJSON('http://localhost:3000/planes', function(data) {
            console.log("got data.")
            $.each(data, function(key, value) {


                if (objLayer.dataSource.objects.containsKey(key))
                {
                    var obj = objLayer.dataSource.objects.item(key);

                    obj.drawValues.push([1], value[0], value[4], value[8], value[9]);
                    obj.geometry.x = value[2];
                    obj.geometry.y = value[1];

                    objLayer.dataSource.updateObject(obj);
                }
                else
                {
                    var obj = new NeWMI.Draw.Template.TemplateObject(value[2], value[1]);

                    obj.drawValues.push([1], value[0], value[4], value[8], value[9]);
                    obj.id = key;

                    objLayer.dataSource.addObject(obj);
                }
            });
        })

        objLayer.refresh();
    }, 3000);
}