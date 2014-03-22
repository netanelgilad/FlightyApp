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
                modules: ["GoogleEngine", "Object", "Layer"]
            });
    }});
}

function onReady()
{
    dojo.declare("BoundariesLayer", NeWMI.Layer.Base.ACustomObjectsLayer,{

        plane : new Image(),
        imageloaded : false,

        // In dojo - Tell the object that we will call the base object constructor explicitly
        "-chains-" :
        {
            constructor: "manual"
        },

        constructor : function()
        {
            // Calling the base constructor with second parameter true, to support only Canvas 2D Context drawing
            this.inherited(arguments, [false, true]);
        },

        drawObjects2D : function (p_objMap, p_objContext, p_arrObjToDraw)
        {
            p_arrObjToDraw.forEach(function(currObjects)
            {
                p_arrObjToDraw.forEach(function(currObjects)
                {
                    var makeSureImageIsLoaded = function(p_objContext, geometry, layer) {
                        if (layer.imageloaded) {
                            layer.drawImage(p_objContext, layer.plane, geometry);
                        }
                        else {
                            $(layer.plane)
                                .load(function() {
                                    layer.imageloaded = true;
                                    layer.drawImage(p_objContext, layer.plane, geometry);
                                })
                                .attr("src", '/resources/images/plane.png');
                        }
                    }

                    makeSureImageIsLoaded(p_objContext, currObjects.geometry, this);
                }, this);
            }, this);
        },

        drawImage : function(p_objContext, image, geometry) {
            NeWMI.Draw.Draw2D.imageCenter(p_objContext, image, geometry.xCenter, geometry.yCenter, 150,150);
        }
    });

	var map = new NeWMI.Engine.Google.Map('mapContainer');
	map.setPosition(34,31,7);

    $.getJSON('http://localhost:3000/planes', function(data) {
        var first;

        $.each(data, function(key, value) {
            if (!first) {
                first = value;
            }
        });

        var myFirstNeWMIObject = new NeWMI.Object.NeWMIObjectSelfDraw();
        myFirstNeWMIObject.id = "MyObjectID";
        console.log(first[1]);
        console.log(first[2]);
        var rect = new NeWMI.Geometry.Rectangle( { xCenter: first[2], yCenter: first[1], width: 0.5, height: 0.5} );
        myFirstNeWMIObject.geometry = rect;

        // getEnvelope will return a Rectangle geometry, getRect will return the its NeWMI.Draw.Types.Rect type
        myFirstNeWMIObject.boundsRect = rect.getEnvelope().getRect();

        myFirstNeWMIObject.setFillAsImage('/resources/images/plane.png');

        // Creating a simple layer which draws the object's geometry
        var myLayer = new BoundariesLayer();

        myLayer.dataSource.addObject(myFirstNeWMIObject);

        map.layersMgr.insertAppLayer(myLayer);
    })
}