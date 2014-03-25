define([ "dojo/_base/declare", "dojox/timing"], 
         function(declare, Timing) 
{	
	var AGeometryFeedback = declare("NeWMI.Tool.Feedback.Base.AGeometryFeedback", null, 
	{
		constructor: function(p_objMap, p_objGeo, p_eType)
		{
			this._map = p_objMap;
			this._createFeedback = p_objGeo == null;
			this._geometry = p_objGeo || this._createGeoInstance(p_eType);
			this._hitIndex = null;
			
			var m_intHoverInterval = 10;
			this._autoScrollTimer = new Timing.Timer(m_intHoverInterval);
			this._autoScrollTimer.onTick = dojo.hitch(this, this._autoScrollTimer_Tick);
			
			this._isScrollingNow = false;
			
			this.autoScrolling = true;
			
			if (typeof esriConfig != 'undefined')
			{
				this._esriConfigParams = {};
				this._esriConfigParams.panDuration = esriConfig.defaults.map.panDuration;
				this._esriConfigParams.panRate = esriConfig.defaults.map.panRate;
				this._esriConfigParams.zoomDuration = esriConfig.defaults.map.zoomDuration;
				this._esriConfigParams.zoomRate = esriConfig.defaults.map.zoomRate;
			}
		},
		
		////////////////////////////////////////////////////////////////////////////
		/////////////////////////////// For Overrids ///////////////////////////////
		////////////////////////////////////////////////////////////////////////////
		
		_hitTest : function (p_objPnt)
		{
		    return this._geometry.hitTest(this._map, p_objPnt);
		},
		
		mouseDown : function(evt)
		{
			this._hitResult = this._hitTest(evt.mapPoint);
			
			this._mapControlBounds = this._map.getControlLayout();
			
			if (this._hitResult.hitResult)
			{
				this._map.setCursor("move");
			}
		},
		
		mouseDrag : function(evt)
		{
			this._handleAutoScroll(evt);
		},
		
		mouseUp : function(evt)
		{
			this._autoScrollTimer.stop();
			
			this._map.setCursor("default");
		},
		
		end : function()
		{
			this._autoScrollTimer.stop();
		},
		
		////////////////////////////////////////////////////////////////////////////
		/////////////////////////////// Auto Scroll ////////////////////////////////
		////////////////////////////////////////////////////////////////////////////
		
		_updateExtent : function(p_objScreenPoint)
		{			
			var m_intAutoScrollingMoveEdgePixels = 25;
			
			var intDX = 0;
            var intDY = 0;

            if (p_objScreenPoint.y < m_intAutoScrollingMoveEdgePixels)
            {
                intDY = p_objScreenPoint.y - m_intAutoScrollingMoveEdgePixels;
            }
            else if (p_objScreenPoint.y > this._mapControlBounds.height - m_intAutoScrollingMoveEdgePixels)
            {
                intDY = p_objScreenPoint.y - (this._mapControlBounds.height - m_intAutoScrollingMoveEdgePixels);
            }

            if (p_objScreenPoint.x < m_intAutoScrollingMoveEdgePixels)
            {
                intDX = p_objScreenPoint.x - m_intAutoScrollingMoveEdgePixels;
            }
            else if (p_objScreenPoint.x > this._mapControlBounds.width - m_intAutoScrollingMoveEdgePixels)
            {
                intDX = p_objScreenPoint.x - (this._mapControlBounds.width - m_intAutoScrollingMoveEdgePixels);
            }
            
            if (intDX != 0 || intDY != 0)
            {
                if (this._isScrollingNow)
                {
                	var objOffset = this._map.conversionsSvc.toMapSize(intDX, intDY);
                	var objCurrExtent = this._map.getCenter();

                	var fltFactorX = intDX < 0 ? -1 : 1;
                	var fltFactorY = intDY < 0 ? 1 : -1;

                	objCurrExtent.x += fltFactorX * objOffset.width;
                	objCurrExtent.y += fltFactorY * objOffset.height;

                	this._map.setCenter(objCurrExtent.x, objCurrExtent.y, true);
                }
                else if (this.autoScrolling && !this._autoScrollTimer.isRunning)
                {
                	this._startTimer();
                }
            }
            else if (this.autoScrolling && !this._isScrollingNow)
            {
            	this._stopTimer();
            }
		},
		
		_startTimer : function ()
		{
			if (typeof esriConfig != 'undefined')
			{
				esriConfig.defaults.map.panDuration = 1;
	    		esriConfig.defaults.map.panRate = 1;
	    		esriConfig.defaults.map.zoomDuration = 1;
	    		esriConfig.defaults.map.zoomRate = 1;
			}
			
			this._autoScrollTimer.start();
		},
		
		_stopTimer : function ()
		{
			if (typeof esriConfig != 'undefined')
			{
				esriConfig.defaults.map.panDuration = this._esriConfigParams.panDuration;
				esriConfig.defaults.map.panRate = this._esriConfigParams.panRate;
				esriConfig.defaults.map.zoomDuration = this._esriConfigParams.zoomDuration;
				esriConfig.defaults.map.zoomRate = this._esriConfigParams.zoomRate;
			}
			
			this._autoScrollTimer.stop();
		},
		
		_handleAutoScroll : function(evt)
		{
			this._lastMouseDragEvt = evt;

			if (this.autoScrolling && !this._isScrollingNow)
			{
				this._updateExtent(this._lastMouseDragEvt.screenPoint);
			}
		},
		
		_autoScrollTimer_Tick : function()
        {
			this._isScrollingNow = true;

			this._updateExtent(this._lastMouseDragEvt.screenPoint);
			
			this._lastMouseDragEvt.mapPoint = this._map.conversionsSvc.toMap(this._lastMouseDragEvt.screenPoint.x, this._lastMouseDragEvt.screenPoint.y);
			
			this.mouseDrag(this._lastMouseDragEvt);
			
			this._isScrollingNow = false;
        }
	});
	
	return AGeometryFeedback;
});