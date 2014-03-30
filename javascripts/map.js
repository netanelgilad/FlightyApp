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
var plotTimer;
var plotFunction;
var configObj = function() {
    this.refresh = true;
    this.refreshInterval = 50;
    this.simulate = true;
    this.simulateInterval = 50;
    this.real = true;
    this.realInterval = 3000;

    this.planeCount = 0;
    this.plotCreationTime = 3000;
    this.plotPerPlane = 1;
    this.plotCount = 0;
};
var config = new configObj();

var objLayer;
var plotLayer;

function onReady() {
    map = new NeWMI.Engine.ESRI.Map('mapContainer');

    var onlineMap = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer");
    map.layersMgr.insertStaticLayer(onlineMap);
    map.setPosition(34,31,7);

    require(["esri/dijit/Scalebar", "esri/dijit/OverviewMap", "dojo/domReady!"
    ], function(Scalebar, OverviewMap) {
        var scalebar = new Scalebar({
            map: map.core,
            // "dual" displays both miles and kilmometers
            // "english" is the default, which displays miles
            // use "metric" for kilometers
            scalebarUnit: "dual"
        });

        var overviewMapDijit = new OverviewMap({
            map: map.core,
            visible: true,
            attachTo: 'bottom-right',
            width: 100,
            height: 100
        });
        overviewMapDijit.startup();
    });

    image = new Image();

    $(image).load(function() {
        NeWMI.Draw.Template.TemplateParser.parse("http://localhost/NewmiTest/Template/template.php", onTemplateLoaded);
    }).attr('src', "/resources/images/plane.png");
}

function onTemplateLoaded(p_objTemplates) {
    addPlots();
    objLayer = new NeWMI.Layer.TemplateLayer(false);

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

    var datastats = new Stats();
    datastats.setMode(1);
    datastats.domElement.style.position = 'absolute';
    datastats.domElement.style.top = '0px';
    datastats.domElement.style.left = '200px';
    datastats.domElement.style.zIndex = 100;
    $("#mapContainer").append(datastats.domElement);

    var plotIDCounter = 0;
    realFunction = function() {
        $.getJSON('http://localhost:3000/planes', function(data) {
            datastats.begin();
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
                    //obj.data.mps = map.conversionsSvc.metersToGeo(obj.geometry.x, obj.geometry.y, (((value[5] * 1.852) * 1000) / 3600) / (1000 / config.simulateInterval));

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
                    obj.data.plotids = [];
                    //obj.data.mps = map.conversionsSvc.metersToGeo(obj.geometry.x, obj.geometry.y, (((value[5] * 1.852) * 1000) / 3600) / (1000 / config.simulateInterval));

                    objLayer.dataSource.addObject(obj);
                }
            });

            $.each(objLayer.dataSource.objects.getValueList(), function(key, value) {
                if (!data.hasOwnProperty(value.id)) {
                    objLayer.dataSource.removeObject(objLayer.dataSource.objects.item(value.id));
                }
            });

            config.planeCount = objLayer.dataSource.objects.count;

            datastats.end();
        })
    };

    realTimer = setInterval(realFunction, config.realInterval);

    var simulatestats = new Stats();
    simulatestats.setMode(1);
    simulatestats.domElement.style.position = 'absolute';
    simulatestats.domElement.style.top = '0px';
    simulatestats.domElement.style.left = '100px';
    simulatestats.domElement.style.zIndex = 100;
    $("#mapContainer").append(simulatestats.domElement);

    simulateFunction = function() {
        simulatestats.begin();
        $.each(objLayer.dataSource.objects.getValueList(), function(key, value) {
            if (value.geometry.angle != 0 && value.data.mps != 0) {
                //value.geometry.x = value.geometry.x + (Math.cos(value.geometry.angle) * value.data.mps);
                //value.geometry.y = value.geometry.y + (Math.sin(value.geometry.angle) * value.data.mps);
                value.geometry.x += 0.001;
                value.geometry.y += 0.001;
                objLayer.dataSource.updateObject(value);
            }
        });
        simulatestats.end();
    };
    simulateTimer = setInterval(simulateFunction, config.simulateInterval);

    var fpsstats = new Stats();
    fpsstats.domElement.style.position = 'absolute';
    fpsstats.domElement.style.top = '0px';
    fpsstats.domElement.style.zIndex = 100;
    $("#mapContainer").append(fpsstats.domElement);

    refreshFunction = function() {
        objLayer.refresh();
        plotLayer.refresh();
        fpsstats.update();
    };

    refreshTimer = setInterval(refreshFunction, config.refreshInterval);

    var gui = new dat.GUI();
    gui.add(config, 'planeCount').listen();
    gui.add(config, 'plotCount').listen();
    var configFolder = gui.addFolder('Parameters');
    configFolder.add(config, 'refresh').onFinishChange(function (value) {
        if (value) {
            refreshTimer = setInterval(refreshFunction, value);
        }
        else {
            clearInterval(refreshTimer);
        }
    });
    configFolder.add(config, 'refreshInterval', 16, 1000).onFinishChange(function (value) {
        if (config.refresh) {
            clearInterval(refreshTimer);
            refreshTimer = setInterval(refreshFunction, value);
        }
    });
    configFolder.add(config, 'simulate').onFinishChange(function (value) {
        if (value) {
            simulateTimer = setInterval(simulateFunction, value);
        }
        else {
            clearInterval(simulateTimer);
        }
    });
    configFolder.add(config, 'simulateInterval', 16, 1000).onFinishChange(function (value) {
        if (config.simulate) {
            clearInterval(simulateTimer);
            simulateTimer = setInterval(simulateFunction, value);
        }
    });
    configFolder.add(config, 'real').onFinishChange(function (value) {
        if (value) {
            realTimer = setInterval(realFunction, value);
        }
        else {
            clearInterval(realTimer);
        }
    });
    configFolder.add(config, 'realInterval', 1000, 10000).onFinishChange(function (value) {
        if (config.real) {
            clearInterval(realTimer);
            realTimer = setInterval(realFunction, value);
        }
    });
    configFolder.add(config, 'plotPerPlane', 0, 50);
    configFolder.add(config, 'plotCreationTime', 1000, 10000).onFinishChange(function (value) {
        clearInterval(plotTimer);
        plotTimer = setInterval(plotFunction, value);
    });
}

function addPlots() {
    plotLayer = new NeWMI.Layer.SimpleLayer();
    var plotIDCounter = 0;
    
    plotFunction = function() {
        $.each(objLayer.dataSource.objects.getValueList(), function(key, value) {
              if (!value.data.plotids) {
                  value.data.plotids = [];
              }
              
              if (value.data.plotids.length >= config.plotPerPlane) {
                 var removed = value.data.plotids.splice(0, value.data.plotids.length - config.plotPerPlane + 1);
                 $.each(removed, function (key, value) {
                     plotLayer.dataSource.removeObject(plotLayer.dataSource.objects.item(value));
                 });
              }
              
              var plot = new NeWMI.Object.NeWMIObject();
              plot.id = ++plotIDCounter;
              var plotPoint = new NeWMI.Geometry.Point({ x: value.geometry.x, y:value.geometry.y });
              plot.geometry = plotPoint;
              plot.boundsRect = plotPoint.getEnvelope().getRect();
              plotLayer.dataSource.addObject(plot);
              
              value.data.plotids.push(plot.id);
        });
        
        config.plotCount = plotLayer.dataSource.objects.count;
    };
    
    plotTimer = setInterval(plotFunction, config.plotCreationTime);
    
    map.layersMgr.insertAppLayer(plotLayer);
}