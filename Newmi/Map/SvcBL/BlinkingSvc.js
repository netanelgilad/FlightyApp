define(["dojo/_base/declare",
        "NeWMI/Layer/Base/ACustomLayer",
        "NeWMI/Layer/Base/ALayersManager",
        "NeWMI/Draw/Draw2D",
        "NeWMI/Draw/StringSizeCalculator"],
        function (declare,
        		ACustomLayer,
                ALayersManager,
        		Draw2D,
                StringSizeCalculator)
        {
            var BlinkingSvc = declare("NeWMI.Map.SvcBL.BlinkingSvc", null,
            {
                "-chains-":
		        {
		            constructor: "manual"
		        },

                //declaring "private" members variable just for intellisense (this is not required since it is being define within the ctor)
                /*
                m_objMap: undefined,
                m_intDefaultDuration: undefined,
                m_intDefaultSpeed: undefined,
                m_intLastDuration: undefined,
                m_intLastSpeed: undefined,
                m_objBlinkLayer: undefined,
                m_objBlinkerSpeedTimer: undefined,
                m_objBlinkerDurationTimer: undefined,
                */

                constructor: function (p_objMap, p_intDefaultDuration, p_intDefaultSpeed)
                {
                    this.inherited(arguments, [false, true]);

                    this.m_objMap = p_objMap;
                    this.m_intDefaultDuration = p_intDefaultDuration || 3000;
                    this.m_intDefaultSpeed = p_intDefaultSpeed || this.m_intDefaultDuration / 10;
                    this.m_intLastDuration = this.m_intDefaultDuration;
                    this.m_intLastSpeed = this.m_intDefaultSpeed;
                    this.m_objBlinkLayer = new BlinkingSvc.Layer();
                    this.m_objBlinkerSpeedTimer = null;
                    this.m_objBlinkerDurationTimer = null;
                },

                blink: function (p_objBlinkData, p_intDuration, p_intSpeed)
                {
                    //if duration and/or speed params were not specified then we're using the pre-defined default values.
                    p_intDuration = p_intDuration || this.m_intDefaultDuration;
                    p_intSpeed = p_intSpeed || this.m_intDefaultSpeed;

                    //now we actually blinking the given geos if the specified speed is smaller than (or equal to) the duration time
                    //cause it make no sense otherwise....at most the dev-user can set an equal value to the speed and duration params
                    //and by doing so he simply flashing (NOT BLINKING) the geos for the amount of time specified by the duration param
                    //meaning if p_intDuration=p_intSpeed the geos will appear on the map for the total p_intDuration time and then will disappear.
                    if (p_intDuration >= p_intSpeed)
                    {
                        this.m_intLastDuration = p_intDuration;
                        this.m_intLastSpeed = p_intSpeed;

                        this.stopBlinking();
                        this.m_objBlinkLayer.drawingData = p_objBlinkData;
                        this._startBlinkingLastValues(true);
                    }
                },

                startBlinkingLastValues : function()
                {
                    this._startBlinkingLastValues(false);
                },

                _startBlinkingLastValues : function(p_blnSkipStop)
                {
                    if(!p_blnSkipStop)
                    {
                        this.stopBlinking();
                    }
                    
                    this.m_objMap.layersMgr.insertLayer(ALayersManager.LayersTypes._Additional, this.m_objBlinkLayer);
                    var layerDiv = this.m_objBlinkLayer.containsInMaps.item(this.m_objMap.id).div;
                    this.m_objBlinkerSpeedTimer = setInterval(function ()
                    {
                        layerDiv.style.display = layerDiv.style.display ? "" : "none";
                        //layerDiv.style.visibility = layerDiv.style.visibility ? "" : "hidden";
                    }, this.m_intLastSpeed);
                    this.m_objBlinkerDurationTimer = setTimeout(dojo.hitch(this, this.stopBlinking), this.m_intLastDuration);
                },

                stopBlinking: function ()
                {
                    if (this.m_objBlinkerDurationTimer)
                    {
                        clearTimeout(this.m_objBlinkerDurationTimer);
                        this.m_objBlinkerDurationTimer = null;
                    }
                    if (this.m_objBlinkerSpeedTimer)
                    {
                        clearInterval(this.m_objBlinkerSpeedTimer);
                        this.m_objBlinkerSpeedTimer = null;
                    }
                    this.m_objMap.layersMgr.removeLayer(ALayersManager.LayersTypes._Additional, this.m_objBlinkLayer);
                }
            });

            BlinkingSvc.Layer = declare("NeWMI.Map.SvcBL.BlinkingSvc.Layer", ACustomLayer,
            {
                "-chains-":
		        {
		            constructor: "manual"
		        },

                /* DrawingData Object Structure:
                {
                    geos : [g1,g2,g3..gn], //geometries array
                    imgs : [{center: geo_point, img: HTML Image}1, {center: geo_point, img: HTML Image}2...{}n], //array of Point&Image objects
                    txts : [{center: geo_point, txt: "string"}1, {center: geo_point, txt: "string"}2...{}n], //array of Point&String objects
                    style : {
                                txtColor : string, // color name --> p_objContext.fillStyle = "blue";
                                txtSize : number, // windows font size --> p_objContext.font = "10pt {}"
                                txtFont : string, // windows font name --> p_objContext.font = "{} ariel"
                                geoColor : string, // color name --> p_objContext.strokeStyle = "red";
                                geoWidth : number, // non-points geometries line width --> p_objContext.lineWidth = 1;
                                pointSize : number // custom size for drawing points --> Draw2D.geometry(...p_objOptions.pointSize)
                            }
                }
                */
                drawingData : null,

                constructor: function ()
                {
                    this.inherited(arguments, [false, true]);
                },

                draw2D: function (p_objMap, p_objContext)
                {
                    if (this.drawingData)
                    {
                        var styling = this.drawingData.style || {};

                        //if got any geos to draw...
                        if (this.drawingData.geos)
                        {
                            //firsts setting the geos styling params (if we got any)
                            p_objContext.strokeStyle = styling.geoColor || p_objContext.strokeStyle; //Setting geometry colors
                            p_objContext.fillStyle = p_objContext.strokeStyle; //setting this for points colors!!
                            p_objContext.lineWidth = styling.geoWidth || p_objContext.lineWidth;
                            //now drawing...
                            this.drawingData.geos.forEach(function (item)
                            {
                                Draw2D.geometry(p_objMap, p_objContext, item, undefined, styling);
                            }, this);
                        }

                        //if got any images to draw...
                        if (this.drawingData.imgs)
                        {
                            //we dont have images stylings, so simply drawing the images...
                            this.drawingData.imgs.forEach(function (item)
                            {
                                var objScreenPt = p_objMap.conversionsSvc.toScreen(item.center.x, item.center.y);
                                
                                Draw2D.imageCenter(p_objContext, item.img, objScreenPt.x, objScreenPt.y);
                            }, this);
                        }

                        //if got any strings to draw...
                        if (this.drawingData.txts)
                        {
                            //firsts setting the texts styling params (if we got any)
                            p_objContext.fillStyle = styling.txtColor || p_objContext.fillStyle;
                            var fontSplitIdx = p_objContext.font.indexOf(" ");
                            p_objContext.font =
                                (styling.txtSize ? styling.txtSize + "pt" : p_objContext.font.substr(0, fontSplitIdx))
                                +
                                (styling.txtFont ? " " + styling.txtFont : p_objContext.font.substr(fontSplitIdx));

                            p_objContext.textBaseline = 'middle';
                            p_objContext.textAlign = 'center';

                            //now drawing...
                            this.drawingData.txts.forEach(function (item)
                            {
                                var objScreenPt = p_objMap.conversionsSvc.toScreen(item.center.x, item.center.y);
                                Draw2D.symbol(p_objContext, item.txt, objScreenPt.x, objScreenPt.y);
                                //p_objContext.fillText(item.txt, objScreenPt.x, objScreenPt.y);
                            }, this);
                        }
                    }
                }
            });
            return BlinkingSvc;
        });