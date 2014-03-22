define(["dojo/_base/declare", 
        "NeWMI/Structure/KDTree/KDTree",
        "NeWMI/Service/Math/MeasurementSvc"], 
		function(declare, 
				KDTree,
				MeasurementSvc)
{
	return declare("NeWMI.Structure.KDTree.KDTree2D", KDTree, 
	{
		"-chains-" : 
		{
			constructor: "manual"
		},
		
		constructor : function(points) 
		{
			this.inherited(arguments, [points, MeasurementSvc.distancePnts, ['x', 'y'] ] );
		}
	});
});