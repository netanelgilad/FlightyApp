var newmiConfig = 
{
    url: "/Newmi",
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
	var map = new NeWMI.Engine.Google.Map('mapContainer', {
		zoomSlider : true,
		panArrows : true
	});
	map.setPosition(34,31,7);

	var myFirstNeWMIObject = new NeWMI.Object.NeWMIObjectSelfDraw();
	myFirstNeWMIObject.id = "MyObjectID";

	var rect = new NeWMI.Geometry.Rectangle( { xCenter: 34, yCenter: 31, width: 0.1, height: 0.1 } );
	myFirstNeWMIObject.geometry = rect;

	// getEnvelope will return a Rectangle geometry, getRect will return the its NeWMI.Draw.Types.Rect type
	myFirstNeWMIObject.boundsRect = rect.getEnvelope().getRect();

	myFirstNeWMIObject.setFillAsImage('images/plane.png');

	// Creating a simple layer which draws the object's geometry
	var myLayer = new NeWMI.Layer.SimpleLayer();

	myLayer.dataSource.addObject(myFirstNeWMIObject);

	map.layersMgr.insertAppLayer(myLayer);

	var messageHandler = function(e) {
	  console.log('Background script says hello.', e.data);
	};

	window.parent.addEventListener('message', messageHandler);
}