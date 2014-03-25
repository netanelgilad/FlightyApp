/**
 * Created by Netanel on 22/03/14.
 */
var mapModule = angular.module('map', []);
console.log('do');
mapModule.config(function() {
        var newmiConfig =
        {
            url: "/libs/Newmi",
            engine : ["google"],
            callback: onNeWMILoaded
        };

        function onNeWMILoaded() {
            require('https://www.google.com/jsapi', function() {
                google.load("maps", "3", {other_params:'sensor=false'});
            });
        }
    }).
    directive('map-host', function() {
        function link(scope, element, attrs) {
            require('/libs/NeWMI/NeWMI-1.0.0.js', function() {

                loadNeWMIModules(
                    {
                        callback: onReady,
                        modules: ["GoogleEngine", "Object", "Layer"]
                });

                function onReady() {
                    var map = new NeWMI.Engine.Google.Map(element.attr('id'));
                    map.setPosition(34,31,7);

                    $.getJSON('http://localhost:3000/planes', function(data) {
                        var first;

                        for (first in data){ break; }

                        var myFirstNeWMIObject = new NeWMI.Object.NeWMIObjectSelfDraw();
                        myFirstNeWMIObject.id = "MyObjectID";

                        var rect = new NeWMI.Geometry.Rectangle( { xCenter: first["1"], yCenter: first["2"], width: 0.1, height: 0.1 } );
                        myFirstNeWMIObject.geometry = rect;

                        // getEnvelope will return a Rectangle geometry, getRect will return the its NeWMI.Draw.Types.Rect type
                        myFirstNeWMIObject.boundsRect = rect.getEnvelope().getRect();

                        myFirstNeWMIObject.setFillAsImage('/resources/images/plane.png');

                        // Creating a simple layer which draws the object's geometry
                        var myLayer = new NeWMI.Layer.SimpleLayer();

                        myLayer.dataSource.addObject(myFirstNeWMIObject);

                        map.layersMgr.insertAppLayer(myLayer);
                    })
                }
            });
        }

        return {
            link: link
        };
    });