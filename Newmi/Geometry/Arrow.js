define(["dojo/_base/declare", 
        "NeWMI/Geometry/Base/AGeometry",
        "NeWMI/Geometry/Polyline",         
        "NeWMI/Geometry/Rectangle",
        "NeWMI/Service/Create/ArrowSvc"], 
		function(declare,
				AGeometry,
				Polyline,				
				Rectangle,
				ArrowSvc ){
	return declare("NeWMI.Geometry.Arrow",Polyline,{ 

		GeoType : AGeometry.EGeometryType.Arrow,
			
		    //All widths and heights suppose to be in map units!!!!
		constructor: function (p_objInitData) {
		    if (p_objInitData.jsonData != null) {
		        this._fromJson(p_objInitData.jsonData);
		    }
		    else {
		        this.points = p_objInitData.body;
		        this.subArrows = [];
		        this.arrowType = p_objInitData.arrowType;
		        this.bodyWidth = p_objInitData.bodyWidth;
		        this.bodyExtension = p_objInitData.bodyExtension;
		        this.headWidth = p_objInitData.headWidth;
		        this.headHeigth = p_objInitData.headHeigth;
		        this.headType = p_objInitData.headType;
		    }
		},
			
		_fromJson: function (p_strJsonSerialization) {
		    var objJsonPoint = JSON.parse(p_strJsonSerialization);
		    if (objJsonPoint != null && objJsonPoint.points.length > 0) {
		        this.points = [];
		        for (var intIdx = 0; intIdx < objJsonPoint.length; intIdx++) {
		            this.points.push(
                        new NeWMI.Geometry.Point({ jsonData : objJsonPoint.points[intIdx] }));
		        }

		        this.subArrows = [];
		        this.arrowType = objJsonPoint.arrowType;
		        this.bodyWidth = objJsonPoint.bodyWidth;
		        this.bodyExtension = objJsonPoint.bodyExtension;
		        this.headWidth = objJsonPoint.headWidth;
		        this.headHeigth = objJsonPoint.headHeigth;
		        this.headType = objJsonPoint.headType;
		    }
		},

			clone: function()
			{
				var objClonedGeo = new NeWMI.Geometry.Arrow(this.points,this.arrowType, this.bodyWidth, 
						this.bodyExtension,this.headWidth,this.headHeigth, this.headType);
				
				objClonedGeo._copyBaseProperties(this);
				
				return objClonedGeo;
			},
			
			getDrawingPoints : function()
			{
				this.rebuildOutlinePoints();
				
				return this.bodyOutline;
			},
			
			rebuildOutlinePoints : function()
			{
				if(this.bodyOutline == null)
				{
					var objArrowOutline = ArrowSvc.CreateArrowBody(this.points,                    	                           
	                    	this.arrowType,
	        				this.bodyExtension,
	        				this.bodyWidth,
	        				this.headWidth,
	        				this.headHeigth);
					this.bodyOutline = objArrowOutline;
				}								
			},
			
			_createGeometryEnvelope : function()
			{
				
				this.rebuildOutlinePoints();				
				
				var dblMinX = Number.MAX_VALUE;
				var dblMaxX = -Number.MAX_VALUE;
				var dblMinY = Number.MAX_VALUE;
				var dblMaxY = -Number.MAX_VALUE;
				
				this.bodyOutline.forEach(function(objCurrPt)
				{
					dblMinX = Math.min(dblMinX, objCurrPt.x);
					dblMaxX = Math.max(dblMaxX, objCurrPt.x);
					dblMinY = Math.min(dblMinY, objCurrPt.y);
					dblMaxY = Math.max(dblMaxY, objCurrPt.y);
				}, this);
				
				var objRect = new Rectangle({ xmin: dblMinX, xmax: dblMaxX, ymin: dblMinY, ymax: dblMaxY });
				
				return objRect;
			}
			
			
		});
});