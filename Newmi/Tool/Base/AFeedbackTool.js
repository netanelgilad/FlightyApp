/**
* @class NeWMI.Tool.Base.AFeedbackTool
* <p>Represent a tool who uses a geometry feedback on the map, such as NeWMI.Tool.EditTool, NeWMI.Tool.CreateTool.</p>
* @abstract
* @extends NeWMI.Tool.Base.ATool
* @evented
*/
define(["dojo/_base/declare",
        "NeWMI/Tool/Base/ATool", 
        "NeWMI/Map/Base/AEventsManager",
        "NeWMI/Layer/Base/ACustomLayer",
        "NeWMI/Geometry/Point",
        "NeWMI/Geometry/Rectangle",
        "NeWMI/Draw/Draw2D",
        "NeWMI/Layer/Base/ALayersManager",
        "NeWMI/Geometry/Base/AGeometry",
        "NeWMI/Tool/Feedback/GeometryFeedbackFactory",
        "NeWMI/Object/NeWMIObject",
        "NeWMI/Draw/Template/TemplateObject",
        "NeWMI/Service/Math/MeasurementSvc"], 
        function(declare, 
        		ATool, 
        		AEventsManager,
        		ACustomLayer,
        		Point,
        		Rectangle,
        		Draw2D,
        		ALayersManager,
        		AGeometry,
        		GeometryFeedbackFactory,
        		NeWMIObject,
        		TemplateObject,
        		MeasurementSvc)
{
	var AFeedbackTool = declare("NeWMI.Tool.Base.AFeedbackTool", ATool,
	{ 

		"-chains-" : 
		{
			constructor: "manual"
		},

	    /**
        * @constructor
        * Creates new AFeedbackTool instance
        */
		constructor : function()
		{
			this.inherited(arguments, [[AEventsManager.EMapEvents.MouseDown, AEventsManager.EMapEvents.MouseDrag, AEventsManager.EMapEvents.MouseUp]]);

			if (!this._feedbackLayer)
			    this._feedbackLayer = new AFeedbackTool.Layer();

			this.caption = "Feedback Tool";
			
		    /**
            * @property {Boolean} isStarted
            * If the tool started, The method start was called
            * @readonly
            */
			this.isStarted = false;

		    /**
            * @property {Boolean} isInputStarted
            * If the user started clicked on the map already
            * @readonly
            */
			this.isInputStarted = false;

		    /**
            * @property {Boolean} drawRotateSign
            * Flag indicates Showing\Hiding the rotating symbol 
            */
			this.drawRotateSign = true;
		},
		
		activate : function()
		{
			this.inherited(arguments);
			
			this.map.layersMgr.insertLayer(ALayersManager.LayersTypes._Additional, this._feedbackLayer).then(dojo.hitch(this, function () {
			    this._onFeedbackLayerAdded();
			    })
			);
			this.map.disablePan();
			this.map.setDoubleClickZoomState(false);
		},
		
		deactivate : function()
		{
		    this.inherited(arguments);

		    this.finish();
			
			this.map.layersMgr.removeLayer(ALayersManager.LayersTypes._Additional, this._feedbackLayer);
			this.map.enablePan();
			this.map.setDoubleClickZoomState(true);
			
			//this.isStarted = false;
		},

		_onFeedbackLayerAdded : function() { },

		onMapEvent : function(evt)
		{
			if (!this.isStarted)
				return;
			
			switch (evt.eventType)
			{
				case AEventsManager.EMapEvents.MouseDown:
				{	
					this._onMouseDown(evt);
				}
				break;
				case AEventsManager.EMapEvents.MouseDrag:
				{
					this._onMouseDrag(evt);
				}
				break;
				case AEventsManager.EMapEvents.MouseUp:
				{
					
					this._onMouseUp(evt);
				}
				break;
			}
		},
		
	    /**
        * @method start
        * Starting the feedback tool
        * @param {NeWMI.Geometry.Base.AGeometry.EGeometryType|NeWMI.Geometry.Base.AGeometry} The geometry to edit or the geometry type to create
        * @param {Boolean} p_blnFocusMap When true, the map will focus on the edited geometry area, and refocus back when finished
        */
		start : function(p_objGeo, p_blnFocusMap)
		{						
			this._feedback = GeometryFeedbackFactory.create(this.map, p_objGeo);
			this._feedbackLayer.geometry = this._feedback._geometry;
			
			this._setBackExtent = p_blnFocusMap;
			
			if (p_blnFocusMap)
			{
				this.map.saveExtent();
				
				var objNewExtent = this._feedbackLayer.geometry.getEnvelope(true);
				
				objNewExtent.scale(2, 2);
				
				this.map.setExtent(objNewExtent);
			}
			
			this.isInputStarted = false;
			this.isStarted = true;
			this._feedbackLayer.refresh();
		},
		
	    /**
        * @method finish
        * Finishing the feedback mode
        */
		finish : function()
		{
		    if (this._feedbackLayer) {
		        this._feedbackLayer.end();
		    }
		    if (this._feedback) {
		        this._feedback.end();
		    }

			this.isStarted = false;
			
			if (this._setBackExtent)
			{
				this.map.restoreExtent();
			}
			else if (this._feedbackLayer.map)
			{
				this._feedbackLayer.refresh();
			}
		},
		
		_onMouseDown : function(evt)
		{
		    this.isInputStarted = true;

			this._feedback.mouseDown(evt);
			
			this._feedbackLayer.refresh();
		},
		
		_onMouseDrag : function(evt)
		{
			this._feedback.mouseDrag(evt);	

		    this._feedbackLayer.refresh();
		},
		_onMouseUp : function(evt)
		{		
			this._feedback.mouseUp(evt);

			this._feedbackLayer.refresh();
		}
	});
	
	AFeedbackTool.Layer = declare("NeWMI.Tool.Base.AFeedbackTool.Layer", ACustomLayer,
	{
		"-chains-" : 
		{
			constructor: "manual"
		},
		
		constructor : function()
		{
			this.inherited(arguments, [false, true]);
			
			this.geometry = null;
			this.vertexDraw = [ this._drawEditPoint ];
			
			this._rotationImage = new Image();
			this._rotationImage.src = newmiConfig.url + "/tool/res/rotate_icon_small.png";
			this._rotationSymbolPnt = null;
			
			this.showGeometry = true;
			this.drawGeometryWhenImage = true;
			this.drawRotateSign = true;
		},
				
		draw2D : function(p_objMap, p_objContext)
		{
		    var mapLayout = p_objMap.getControlLayout();

			// Making the screen whiter abit
			p_objContext.fillStyle = "rgba(255, 255, 255, 0.5)";
			p_objContext.fillRect(0, 0, mapLayout.width, mapLayout.height);
		
			if (this.geometry != null && this.showGeometry)
			{				
				/*
				// Drawing text on top 
				var intFontSize = 30;
				
				var strText = "Edit Mode";
				var intTitleWidth = p_objContext.measureText(strText).width;
				var intTitleHeight = intFontSize;
				
				var intTextX = p_objMap.getWidth() / 2;
				var intTextY = 50;
				p_objContext.fillStyle = 'rgba(255,255,0, 0.8)';
				p_objContext.fillRect(intTextX - intTitleWidth / 2, intTextY - intTitleHeight, intTitleWidth, intTitleHeight);
				
				p_objContext.font = intFontSize + 'pt Calibri';
				p_objContext.textAlign = 'center';
				p_objContext.fillStyle = 'rgba(0,0,255, 0.8)';
				p_objContext.fillText(strText, p_objMap.getWidth() / 2, 50);*/
			
				if (this.geometry.GeoType == AGeometry.EGeometryType.Point)
				{
					if (this.image)
					{
						var symbolSizeFactor = 1;
						var objScreenPnt = p_objMap.conversionsSvc.toScreen(this.geometry.x, this.geometry.y);
						objScreenPnt.x = parseInt(objScreenPnt.x + Math.floor(this.image.offsetFromCenter.x * symbolSizeFactor));
						objScreenPnt.y = parseInt(objScreenPnt.y + Math.floor(this.image.offsetFromCenter.y * symbolSizeFactor));

						/*p_objContext.translate(objScreenPnt.x, objScreenPnt.y);
						var dblAngle = 45 * Math.PI/180;
						p_objContext.rotate(dblAngle);*/
						
						p_objContext.drawImage(this.image, 
								objScreenPnt.x, 
								objScreenPnt.y, 
								Math.round(this.image.width * symbolSizeFactor), Math.round(this.image.height * symbolSizeFactor));
						
						/*p_objContext.rotate(-dblAngle);
						p_objContext.translate(-objScreenPnt.x, -objScreenPnt.y);*/
						
					}
					
					if (this.drawGeometryWhenImage)
					{
						this.vertexDraw[0].call(this, p_objMap, p_objContext, this.geometry);
					}
				}
				else
				{
					if (this.drawRotateSign)
					{
						var arrRotationVec = this._getRotationVec(p_objMap, this.geometry);
						
						this._rotationSymbolPnt = arrRotationVec[1];
						
						p_objContext.lineWidth = 2;
						p_objContext.strokeStyle = 'rgba(0,0,0,0.05)';
						Draw2D.lines(p_objContext, arrRotationVec);
						Draw2D.imageCenter(p_objContext, this._rotationImage, arrRotationVec[1].x, arrRotationVec[1].y);
					}
					
					p_objContext.lineWidth = 4;
					p_objContext.strokeStyle = 'black';
					
					p_objContext.lineCap = 'round';
					
					Draw2D.geometry(p_objMap, p_objContext, this.geometry);
					
					p_objContext.setLineDash([10]);
					p_objContext.lineWidth = 3;
					p_objContext.strokeStyle = 'white';
					
					Draw2D.geometry(p_objMap, p_objContext, this.geometry);
					
					p_objContext.setLineDash([0]);
					
					var points = this.geometry.getDrawingPoints();

					if (this.geometry.GeoType == AGeometry.EGeometryType.Polyline ||
						this.geometry.GeoType == AGeometry.EGeometryType.Polygon ||
						this.geometry.GeoType == AGeometry.EGeometryType.Rectangle)
					{
					    for (var intCurrPnt = 0; intCurrPnt < points.length; ++intCurrPnt)
						{
					        this.vertexDraw[intCurrPnt % this.vertexDraw.length].call(this, p_objMap, p_objContext, points[intCurrPnt]);
						}
					}
					else if(this.geometry.GeoType == AGeometry.EGeometryType.Arrow)					
					{
					    for (var intCurrPnt = 0; intCurrPnt < points.length; ++intCurrPnt)
						{
					        this.vertexDraw[intCurrPnt % this.vertexDraw.length].call(this, p_objMap, p_objContext, points[intCurrPnt]);
						}
						
						
					}
				}
				
				
				/*if (this.geometry instanceof nemiGeos.WPolyline)
				{
					if(this.arrowProps == null)
					{
						
					}
					else
					{
						context.lineWidth = 4;
						context.strokeStyle = 'black';
						
						DrawMultiPointGeo(p_objMap, context, this.geometry, true, false);
						
						context.lineWidth = 4;						
						context.strokeStyle = 'white';											
						
						context.setLineDash([0]);
						
						for (var intCurrPnt = 0; intCurrPnt < this.arrowProps.internalPoints.length; ++intCurrPnt)
						{
							this.drawEditPoint(context, this.arrowProps.internalPoints[intCurrPnt]);
						}
						//context.strokeStyle = 'red';				
						this._drawEditPoint(context, this.arrowProps.bodyWidthEditPnt);
						this._drawEditPoint(context, this.arrowProps.headHeigthEditPnt);
						this._drawEditPoint(context, this.arrowProps.headWidthEditPnt);						
					}
						
				}
				else
				{
					this.drawEditPoint(context, this.geometry.points[0]);
				}
				
				if (this.boldIndex != -1 && this.arrowProps == null)
				{
					context.fillStyle = 'red';
					DrawPointAsCircle(p_objMap, context, this.geometry.points[this.boldIndex], 5);					
				}*/
			}
		},
		
		_getRotationVec : function(p_objMap, p_objGeo)
		{
			var objFirstPnt = dojo.clone(this.geometry.getPresentationPoint());										
			
			var objSecPnt = dojo.clone(objFirstPnt);
								
			var offsetSymbol = {
			    "x": Math.sin(p_objGeo.angle) * this._rotationImage.height,
			    "y": -Math.cos(p_objGeo.angle) * this._rotationImage.height
			};

			var dblVal = 0;

			switch (p_objGeo.GeoType)
			{
				case (AGeometry.EGeometryType.Circle):
				{
				    dblVal = Math.abs(p_objGeo.radius);
				}
				break;
				case (AGeometry.EGeometryType.Ellipse):
				{
				    dblVal = Math.abs(p_objGeo.yRadius);
				}
				break;
				case (AGeometry.EGeometryType.Rectangle):
				{
				    dblVal = Math.abs(p_objGeo.height / 2);
				}
				break;
			    case (AGeometry.EGeometryType.Polyline):
			    case (AGeometry.EGeometryType.Polygon):
			    {
			        var objGeoEnv = this.geometry.getUnrotatedEnvelope();
			        
			        var objDistanceFromCenter = objFirstPnt.y - objGeoEnv.yCenter;

			        dblVal = Math.abs(objGeoEnv.height / 2) - objDistanceFromCenter;
			    }
			    break;
				default:
				{
				    var objGeoEnv = this.geometry.getEnvelope();
				    dblVal = objGeoEnv.height / 2;
				}
			}

			objSecPnt.x += Math.sin(p_objGeo.angle) * dblVal;
			objSecPnt.y += Math.cos(p_objGeo.angle) * dblVal;
			
			var arrPts = [	p_objMap.conversionsSvc.toScreen(objFirstPnt.x, objFirstPnt.y),
			              	p_objMap.conversionsSvc.toScreen(objSecPnt.x, objSecPnt.y) ];
			
			arrPts[1].x += offsetSymbol.x;
			arrPts[1].y += offsetSymbol.y;
			
			return arrPts; 
		},
		
		_drawEditPoint: function(p_objMap, p_objContext, p_objPoint)
		{
			p_objContext.fillStyle = 'black';
			Draw2D.pointGeometry(p_objMap, p_objContext, p_objPoint, 7);
			
			p_objContext.fillStyle = 'white';
			Draw2D.pointGeometry(p_objMap, p_objContext, p_objPoint, 4);
		},
		
		end : function()
		{
			this.geometry = null;
			this.image = null;
			
		},
		
		isPointOnRotationSymbol : function (p_objPixelPoint)
		{
			return this._rotationSymbolPnt && 
					MeasurementSvc.distancePnts(p_objPixelPoint, this._rotationSymbolPnt) <= this._rotationImage.width / 2;
			
		}
	});
	
	return AFeedbackTool;
});