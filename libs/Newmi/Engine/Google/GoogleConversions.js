/**
* @class NeWMI.Engine.Google.ConversionSvc
* <p>Provides a Google map conversion services, such as map units to screen and more</p>
* @extends NeWMI.Map.Base.AConversionSvc
*/
define(["dojo/_base/declare",
        "NeWMI/Geometry/Point", 
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Engine/Google/GoogleEventsMgr",
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Map/Base/AConversionSvc"],
        function(declare, 
        		Point, 
        		MeasurementSvc,
        		GoogleEventsMgr,
        		AEventsManager,
                AConversionSvc)
       {
            return declare("NeWMI.Engine.Google.ConversionSvc", AConversionSvc, {
	
			constructor : function(p_objMap)
			{
				this.map = p_objMap;
		
				this._pix0 = {x:0,y:0};
				this._xScale = 0;
				this._yScale = 0;
				
				var me = this;
				this._listeners = [];
				this._listeners.push(
						google.maps.event.addListener(this.map.core, 'center_changed', 
						function() 
						{ 
							me._extentChanged = true;
						})
					);
			},
			
			_updateExtentData : function()
			{
				this._projection = this.map.core.getProjection();
				if (this._projection)
				{
					this._mapExtent = this.map.core.getBounds();
					
					this._topRightGeo = this._mapExtent.getNorthEast();
					this._bottomLeftGeo = this._mapExtent.getSouthWest();
					
					this._topRight = this._projection.fromLatLngToPoint(this._mapExtent.getNorthEast()); 
					this._bottomLeft = this._projection.fromLatLngToPoint(this._mapExtent.getSouthWest()); 
					
					this._scale = Math.pow(2, this.map.core.getZoom());
				}
				
				this._extentChanged = false;
			},
			
			toMap : function(p_dblX, p_dblY)
			{
				if (this._extentChanged)
					this._updateExtentData();
				
				
				
				var x = (p_dblX / this._scale) + this._bottomLeft.x;
				var y = (p_dblY / this._scale) + this._topRight.y;
				
				var retVal = this.map.core.getProjection().fromPointToLatLng( { x : x, y : y } );
				
				//var x = (retVal.lng() / this._scale);
				//var y = (retVal.lat() / this._scale);
				
				return {"x" :retVal.lng(),"y" : retVal.lat()};
			},
			
			toScreen : function(p_dblX, p_dblY, p_blnFast)
			{
				if (this._extentChanged)
					this._updateExtentData();
				
				if (this._projection)
				{
					var dblX = p_dblX;
					var dblY = p_dblY;

					// If it's not geo - i guess it will mercator
					if (p_dblX < -180 || p_dblX > 180)
					{
						var pnt = NeWMI.Service.Math.ConversionsSvc.ToGeographic(p_dblX, p_dblY);
						
						if (!pnt)
						    return {"x" :0,"y": 0};
						
						dblX = pnt.x;
						dblY = pnt.y;
					}
					
					
					var worldPoint = this._projection.fromLatLngToPoint(new google.maps.LatLng(dblY, dblX)); 
					//var worldPoint = this._projection.fromLatLngToPoint(new google.maps.LatLng(pnt.y, pnt.x));

					return {
					    "x": (worldPoint.x - this._bottomLeft.x) * this._scale,
					    "y": (worldPoint.y - this._topRight.y) * this._scale
					};
				}
				else
				{
				    return { "x": 0, "y": 0 };
				}
							
		         // Old Code
				
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
					this.mainSpatialReference = new SpatialReference({"wkid" : ESRIConversionSvc.MainSR_WKID});
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
				
				return dblPnt2.x - dblPnt1.x;
			},
			
			toMapSize: function (p_dblWidth, p_dblHeight) {
			    var blnCalcAvg = false;
			    if (p_dblHeight === undefined) {
			        p_dblHeight = p_dblWidth;
			        blnCalcAvg = true;
			    }
			    var dblPnt1 = this.toMap(0, 0, true);
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
				
				objTempLine.addPath([new Geometry.Point(p_dblX - p_dblLength / 2, p_dblY, objMainSR), 
				                     new Geometry.Point(p_dblX + p_dblLength / 2, p_dblY, objMainSR)]);
				
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
					this.mainSpatialReference = new SpatialReference({"wkid" : ESRIConversionSvc.MainSR_WKID});
				}
				
				return this.mainSpatialReference;
			},
			
			getWebMercatorSR : function()
			{
				if(this.webMercatorSpatialReference == null)
				{
					this.webMercatorSpatialReference = new SpatialReference({"wkid" : ESRIConversionSvc.WebMercatorSR_WKID});
				}
				
				return this.webMercatorSpatialReference;
			},
			
			metersToGeo: function(p_dblX, p_dblY, p_dblLength)
			{
				var dblGeoLength = -1;
				
				var objMainSR = this.getMainSR();
				
				var objWMSR = getWebMercatorSR();
				
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
			}
		});
}); 
	