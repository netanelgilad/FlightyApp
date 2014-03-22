/**
* @class NeWMI.Tool.EditTool
* <p>Represent the edit tool in the map.</p>
* <p>This tool is getting the geometry to edit, starting the mode of editing it. When finished it is returning the updated geometry.</p>
* @extends NeWMI.Tool.Base.AFeedbackTool
* <pre><code>
* var editTool = new NeWMI.Tool.EditTool();
* map.toolsMgr.add(editTool);
* .
* .
* .
* map.toolsMgr.activate(editTool);
* editTool.start(_selectedObject.geometry);
* .
* .
* .
* // Finishing the edit tool and setting it into our selected object
* _selectedObject.geometry = _editTool.finish();
* 
* // Notifying the datasource that this object has been changed, and setting true for automatically updating the object's boundsRect property
* _layer.dataSource.updateObject(_selectedObject, true);
* </code></pre>
*/
define(["dojo/_base/declare",
        "NeWMI/Tool/Base/AFeedbackTool", 
        "NeWMI/Geometry/Base/AGeometry",
        "NeWMI/Object/NeWMIObject",
        "NeWMI/Draw/Template/TemplateObject",
        "NeWMI/Service/Math/MeasurementSvc",
        "NeWMI/Tool/EventObject"], 
        function(declare, 
        		AFeedbackTool, 
        		AGeometry,
        		NeWMIObject,
        		TemplateObject,
        		MeasurementSvc,
        		EventObject)
{
	return declare("NeWMI.Tool.EditTool", AFeedbackTool,
	{ 

		"-chains-" : 
		{
			constructor: "manual"
		},

	    /**
        * @constructor
        * Creates new EditTool instance
        */
		constructor : function()
		{
			this.inherited(arguments);

			this.caption = "Edit";

		    /**
            * @property {Boolean} rotateGeo
            * If true, the editing will include a rotating anchor, and allow to rotate the geometry
            */
			this.rotateGeo = false;
		},
		
	    /**
        * @method start
        * Starting the editing mode
        * @param {NeWMI.Geometry.Base.AGeometry|NeWMI.Draw.Template.TemplateObject} p_objToEdit <ul><li> When given an geometry it will simply start the editing mode on it.</li>
        *<li>When given TemplateObject it will start editing its NeWMI.Draw.Template.TemplateObject.imageLastDrawn</li></ul>
        * @param {Boolean} p_blnFocusMap When true, the map will focus on the edited geometry area, and refocus back when finished
        */
		start : function(p_objToEdit, p_blnFocusMap)
		{
		    this._feedbackLayer.drawGeometryWhenImage = true;

			// If the first parameter is geometry we clone it
			if (p_objToEdit instanceof AGeometry)
			{
				this._objEditedGeo = p_objToEdit.clone();
			}
			// If we get newmi object
			else if (p_objToEdit instanceof NeWMIObject)
			{
				// First we take the geometry
				this._objEditedGeo = p_objToEdit.geometry.clone();
				
				// Then checking if the object is template for taking the image
				if (p_objToEdit instanceof TemplateObject)
				{
				    this._feedbackLayer.image = p_objToEdit.imageLastDrawn;
				    this._feedbackLayer.drawGeometryWhenImage = false;
				}
			}
			
			this.inherited(arguments, [ this._objEditedGeo , p_blnFocusMap ]);
		},
		
	    /**
        * @method finish
        * Finishing the editing mode
        * @return The updated geometry
        */
		finish : function()
		{
			this.inherited(arguments);
			
			return this._objEditedGeo;
		},
		
		_onMouseDown : function(evt)
		{
			if (this._feedbackLayer.isPointOnRotationSymbol(evt.screenPoint))
			{
				if (evt.ctrlKey)
				{				
					this._objEditedGeo.setAngle (0);
				}
				else
				{
					this.rotateGeo = true;
					this._startRotationGeoAngle = this._objEditedGeo.angle;
					this._geoPP = this._objEditedGeo.getPresentationPoint();
					this._startRotationAngle = MeasurementSvc.getTrigonometricAngle(evt.mapPoint.x, 
							evt.mapPoint.y, 
							this._geoPP.x, 
							this._geoPP.y);
				}
			}
			else
			{
				this._feedback.mouseDown(evt);
			}
			
			this._feedbackLayer.refresh();
		},
		
		_onMouseDrag : function(evt)
		{
			if (this.rotateGeo)
			{
				var dblCurrAngle = MeasurementSvc.getTrigonometricAngle(evt.mapPoint.x, 
						evt.mapPoint.y, 
						this._geoPP.x, 
						this._geoPP.y);

				this._objEditedGeo.setAngle (this._startRotationGeoAngle + (this._startRotationAngle - dblCurrAngle));				
			}
			else
			{
				this._feedback.mouseDrag(evt);
				
				this._raiseEditDrag(this._objEditedGeo);
			}
			
		    this._feedbackLayer.refresh();
		},
		_onMouseUp : function(evt)
		{		
			if (!this.rotateGeo)
			{
				this._feedback.mouseUp(evt);
			}
			
			this.rotateGeo = false;
			this._feedbackLayer.refresh();
		},
		
	    /**
         * @event editDrag
         * This even will be fired every drag of the geometry, or one of its points
         * @param {NeWMI.Tool.EventObject} evt
         * @param {"editDrag"} evt.type
         * @param {NeWMI.Geometry.Base.AGeometry} evt.object The geometry
         */
		_raiseEditDrag : function(p_objNewGeometry)
		{
			var objOnEditDrag = new EventObject(this);
			objOnEditDrag.type = "editDrag";
			objOnEditDrag.object = p_objNewGeometry;
			objOnEditDrag.raise();
		}
	});
});