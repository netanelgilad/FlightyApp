/**
 * Created by Netanel on 22/03/14.
 */
define(["dojo/_base/declare",
    "NeWMI/Layer/Base/ACustomObjectsLayer"],
    function(declare,
             ACustomObjectsLayer)
    {
        return declare("BoundariesLayer", ACustomObjectsLayer,{

            plane : new Image(),
            imageloaded : false,

            // In dojo - Tell the object that we will call the base object constructor explicitly
            "-chains-" :
            {
                constructor: "manual"
            },

            constructor : function()
            {
                // Calling the base constructor with second parameter true, to support only Canvas 2D Context drawing
                this.inherited(arguments, [false, true]);
            },

            drawObjects2D : function (p_objMap, p_objContext, p_arrObjToDraw)
            {
                p_arrObjToDraw.forEach(function(currObjects)
                {
                    var makeSureImageIsLoaded = function(callback) {
                        if (imageloaded) {
                            callback();
                        }
                        else {
                            plane.onLoad = function() {
                                imageloaded = true;
                                callback();
                            }
                            plane.src = '/resources/images/plane.png';
                        }
                    }

                    makeSureImageIsLoaded(function() {
                        var currGeometry = currObjects.geometry;
                        var currGeometryEnv = currObjects.geometry.getEnvelope();

                        NeWMI.Draw.Draw2D.imageCenter(p_objContext, plane, currObjects.xCenter, currObjects.yCenter);
                    });
                }, this);
            }
        });
    });