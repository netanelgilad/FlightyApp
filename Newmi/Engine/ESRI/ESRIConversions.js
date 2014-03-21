/**
* @class NeWMI.Engine.ESRI.ConversionSvc
* <p>Provides a esri map conversion services, such as map units to screen and more</p>
* @extends NeWMI.Map.Base.AConversionSvc
*/
define(["dojo/_base/declare",
        "esri/geometry", 
        "esri/SpatialReference",
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Engine/ESRI/ESRIEventsMgr",
        "NeWMI/Map/Base/AConversionSvc"],
        function(declare, 
        		Geometry, 
        		SpatialReference, 
        		MeasurementSvc,
        		AEventsManager,
        		ESRIEventsMgr,
                AConversionSvc)
       {
            return declare("NeWMI.Engine.ESRI.ConversionSvc", AConversionSvc, {
	
			constructor : function(p_objMap)
			{
				this.map = p_objMap;
				this.mainSpatialReference = null;
				this.webMercatorSpatialReference = null;
				
				this.eventsMgr = new ESRIEventsMgr(p_objMap, this, this._onMapEvent);
				this.eventsMgr.connect([AEventsManager.EMapEvents.ExtentChange]);
				this._pix0 = {x:0,y:0};
				this._xScale = 0;
				this._yScale = 0;
			},
			
			_onMapEvent : function(evt)
			{
				var pix0 = this.toMap(0, 0);
	        	var pix100 = this.toMap(100, 100);
	        	
	        	this._xScale = 100 / (pix100.x - pix0.x);
	        	this._yScale = 100 / (pix100.y - pix0.y);
	        	this._pix0 = pix0;
			},
			
			toMap : function(p_dblX, p_dblY)
			{
				var objMapPoint = this.map.core.toMap(new Geometry.ScreenPoint(p_dblX, p_dblY)); 
				
				return new NeWMI.Geometry.Point({ "x": objMapPoint.x, "y": objMapPoint.y });
			},
			
			toScreen : function(p_dblX, p_dblY, p_blnFast)
			{
				p_blnFast = p_blnFast != null ? p_blnFast : true;
				
				if (p_blnFast)
				{
					var objScreenPt = 
					{ x : (p_dblX - this._pix0.x) * this._xScale, 
					  y : (p_dblY - this._pix0.y) * this._yScale };
					
					return objScreenPt;
				}
				
				//console.log(objScreenPt.x + "-" + objScreenPt.y);
				
				var objScreenPoint = null;
				
					if(this.mainSpatialReference == null)
					{
						this.mainSpatialReference = new SpatialReference({"wkid" : this.MainSR_WKID});
					}
					
					var objMapPoint = new Geometry.Point(p_dblX, p_dblY, this.mainSpatialReference);
					
					objScreenPoint = this.map.core.toScreen(objMapPoint); 
				
				//console.log(objScreenPoint.x + "-" + objScreenPoint.y);
				
				return { "x": objScreenPoint.x, "y": objScreenPoint.y };
			},
			
			toScreenSize : function(p_dblSize)
			{
				var dblPnt1 = this.toScreen(0,0, true);
				var dblPnt2 = this.toScreen(p_dblSize, 0, true);
				
				return Math.abs(dblPnt2.x - dblPnt1.x);
			},
			
			toMapSize : function (p_dblWidth, p_dblHeight)
			{
			    var blnCalcAvg = false;
			    if (p_dblHeight === undefined) {
			        p_dblHeight = p_dblWidth;
			        blnCalcAvg = true;
			    }
				var dblPnt1 = this.toMap(0,0, true);
				var dblPnt2 = this.toMap(p_dblWidth, p_dblHeight, true);
				
				if (blnCalcAvg) {
				    return (Math.abs(dblPnt2.x - dblPnt1.x) + Math.abs(dblPnt2.y - dblPnt1.y)) / 2;
				}
				else {
				    return { "width": Math.abs(dblPnt2.x - dblPnt1.x), "height": Math.abs(dblPnt2.y - dblPnt1.y) };
				}
			},
						
			geoToMeters: function(p_dblX, p_dblY,p_dblLength)
			{
				var dblMetersLength = -1;
				
				var objMainSR = this.getMainSR();
				
				var objTempLine = Geometry.Polyline(objMainSR);
				
				objTempLine.addPath([new Geometry.Point({"x" :p_dblX - p_dblLength / 2,"y" : p_dblY, "factoryCode" : objMainSR}), 
				                     new Geometry.Point({"x" :p_dblX + p_dblLength / 2,"y" : p_dblY, "factoryCode" : objMainSR})]);
				
				var objResGeo = Geometry.webMercatorUtils.geographicToWebMercator(objTempLine);
				
				var objFrom = objResGeo.getPoint(0,0);
				var objTo = objResGeo.getPoint(0,1);
				
				dblMetersLength = MeasurementSvc.distance(objFrom.x, objFrom.y, objTo.x, objTo.y);
				
				return dblMetersLength;
			},
			
			getMainSR : function()
			{
				if(this.mainSpatialReference == null)
				{
					this.mainSpatialReference = new SpatialReference({"wkid" : this.MainSR_WKID});
				}
				
				return this.mainSpatialReference;
			},
			
			getWebMercatorSR : function()
			{
				if(this.webMercatorSpatialReference == null)
				{
					this.webMercatorSpatialReference = new SpatialReference({"wkid" : this.WebMercatorSR_WKID});
				}
				
				return this.webMercatorSpatialReference;
			},
			
			metersToGeo: function(p_dblX, p_dblY, p_dblLength)
			{
				var dblGeoLength = -1;
				
				var objMainSR = this.getMainSR();
				
				var objWMSR = this.getWebMercatorSR();
				
				var objTempLine = Geometry.Polyline(objWMSR);
				
				var objCenterPoint = new Geometry.Point(p_dblX, p_dblY, objMainSR);
				
				var objTempWebMercatorPnt = Geometry.webMercatorUtils.geographicToWebMercator(objCenterPoint);
					
				objTempLine.addPath([new Geometry.Point(objTempWebMercatorPnt.x - p_dblLength/2 ,objTempWebMercatorPnt.y, objMainSR), 
				                     new Geometry.Point(objTempWebMercatorPnt.x + p_dblLength/2 ,objTempWebMercatorPnt.y, objMainSR)]);
				
				var objResGeo = Geometry.webMercatorUtils.webMercatorToGeographic(objTempLine);
				
				var objFrom = objResGeo.getPoint(0,0);
				var objTo = objResGeo.getPoint(0,1);
				
				dblGeoLength = MeasurementSvc.distance(objFrom.x,objFrom.y,objTo.x,objTo.y);
				
				return dblGeoLength;
			},
		});
}); 
	