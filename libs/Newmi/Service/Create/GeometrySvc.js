define(["dojo/_base/declare",
    "NeWMI/Modules/GeometryModule",
    "NeWMI/Service/Math/ConversionsSvc",
    "NeWMI/Service/Math/MeasurementSvc",
    "NeWMI/Service/Math/InfoSvc",
    "NeWMI/Draw/Types/Vector3D"],
    function (declare,
            Geometry,
            ConversionsSvc,
            MeasurementSvc,
            InfoSvc,
            Vector3D)
{
    var CreateGeoSvc = declare("NeWMI.Service.Create.GeometrySvc", null, {});
	
    ////////////////////////////////////////////////////// OUTLINE //////////////////////////////////////////////////

    CreateGeoSvc.createOutline = function (p_objPts, p_dblWidth, exParams) {

        exParams = exParams || {};
        exParams.isClosed = exParams.isClosed || false;
        exParams.cornerFlexFactor = exParams.cornerFlexFactor || 3;
        exParams.widening = exParams.widening || 0;
        exParams.polyLength = exParams.polyLength || 0;


        var objPts = [];

        if (p_objPts.length > 1 &&
            (!exParams.isClosed || p_objPts.length > 2)) {
            //////// Widening ////////////

            var dblFactor = 1;

            if (exParams.widening != 0) {
                if (exParams.polyLength == 0) {
                    exParams.polyLength = InfoSvc.getPolylineLength(p_objPts, exParams.isClosed);
                }
            }

            var dblCurrWidth = p_dblWidth;

            //////// Widening ////////////


            for (var intCurrPntIndex = 0; intCurrPntIndex < p_objPts.length; intCurrPntIndex++) {

                var dblLength = dblCurrWidth;

                var objCurrPt = p_objPts[intCurrPntIndex];
                var objNextPt = p_objPts[(intCurrPntIndex + 1) % p_objPts.length];
                var objPrevPt = p_objPts[(p_objPts.length + intCurrPntIndex - 1) % p_objPts.length];

                objPts.push(CreateGeoSvc.calculateOutlinePoint(
                    objPrevPt,
                    objCurrPt,
                    objNextPt,
                    dblCurrWidth,
                    dblLength,
                    exParams.cornerFlexFactor,
                    p_objPts.length,
                    intCurrPntIndex,
                    exParams.isClosed));

                // Calculating the next width due to widening
                if (exParams.widening != 0) {
                    dblCurrWidth += (MeasurementSvc.distance(objNextPt.x, objNextPt.y, objCurrPt.x, objCurrPt.y) / exParams.polyLength) * exParams.widening;
                }
            }
        }

        return objPts;
    };

    CreateGeoSvc.calculateOutlinePoint = function(p_objPrevPt,
        p_objCurrPt,
        p_objNextPt,
        p_dblWidth,
        p_dblLength,
        p_dblCornerFlexFactor,
        p_intPointCounts,
        p_intCurrPntIndex,
        p_blnIsClosed){
            
            var objMiddleVector;
            var objPt = new Vector3D(p_objCurrPt.x, p_objCurrPt.y);

            if (p_intCurrPntIndex == 0 && !p_blnIsClosed)
            {
                // Getting the perpendicular vector of the first line vector
                objMiddleVector = Vector3D.sub(p_objCurrPt, p_objNextPt);
                objMiddleVector.normalize();
                objMiddleVector = new Vector3D(-objMiddleVector.y, objMiddleVector.x);
            }
            else if (p_intCurrPntIndex == p_intPointCounts - 1 && !p_blnIsClosed)
            {
                // Getting the perpendicular vector of the last line vector
                objMiddleVector = Vector3D.sub(p_objPrevPt, p_objCurrPt);
                objMiddleVector.normalize();
                objMiddleVector = new Vector3D(-objMiddleVector.y, objMiddleVector.x);
            }
            else
            {
                var objV1 = Vector3D.sub(p_objCurrPt, p_objPrevPt);
                objV1.normalize();
                var objV2 = Vector3D.sub(p_objCurrPt, p_objNextPt);
                objV2.normalize();

                // Getting the perpendicular vector of one of the vectors (doesn't matter which) - And negate it
                var objVecPerp = new Vector3D(objV1.y, -objV1.x);

                if (!MeasurementSvc.isRightTurn(p_objPrevPt, p_objCurrPt, p_objNextPt))
                {
                    objV1.x *= -1;
                    objV1.y *= -1;
                    objV2.x *= -1;
                    objV2.y *= -1;
                }

                // Getting the middle vector
                objMiddleVector = Vector3D.add(objV1, objV2);
                objMiddleVector.normalize();

                // Calculating the size of the middle vector
                // + is the point we are searching for
                // -------------+
                //             /|  The diagonal vector is the length we are looking for
                //    ......../ |
                //           .  |

                // Calculating the angle by multiplying the middle vector with the perpendicular
                // Angle = Math.Acos(objDP.X * objVecPerp.X + objDP.Y * objVecPerp.Y);
                // dblLength = p_dblWidth / Math.Cos(Angle)
                // But Math.Cos(Angle) = (objDP.X * objVecPerp.X + objDP.Y * objVecPerp.Y)
                // So we just do that
                p_dblLength = p_dblWidth / (objMiddleVector.x * objVecPerp.x + objMiddleVector.y * objVecPerp.y);

                if (p_dblLength >= 0)
                {
                    p_dblLength = Math.min(p_dblLength, p_dblWidth * p_dblCornerFlexFactor);
                }
                else
                {
                    p_dblLength = Math.max(p_dblLength, p_dblWidth * p_dblCornerFlexFactor);
                }
            }

            // When both points are equal it causes NaN situation
            if (!isNaN(objMiddleVector.x) && !isNaN(objMiddleVector.y))
            {
                objPt = new Vector3D(p_objCurrPt.x + objMiddleVector.x * p_dblLength,
                                    p_objCurrPt.y + objMiddleVector.y * p_dblLength);               
            }

            return objPt;
    };

    ////////////////////////////////////////////////// END OF OUTLINE ///////////////////////////////////////////////

    CreateGeoSvc.adjustEdges = function (p_arrPts, p_dblStartOffset, p_dblEndOffset, p_blnIsClosed, p_blnClone) {
        var polyLength = InfoSvc.getPolylineLength(p_arrPts) - p_dblEndOffset;

        if (p_dblStartOffset > polyLength)
            return null;

        var objFromStart;
        var sliceFrom = 0;
        if (p_dblStartOffset) {

            if (p_dblStartOffset > 0) {
                objFromStart = InfoSvc.getPointOnPolyline(p_arrPts, p_dblStartOffset, false, p_blnIsClosed);
                sliceFrom = objFromStart.segmentIndex + 1;
            }
            else {
                
                objFromStart = { point: InfoSvc.getPointOnLine(
                                        p_arrPts[0],
                                        p_arrPts[1],
                                        p_dblStartOffset) };
                sliceFrom = 0;
            }           
        }
        
        var objFromEnd;
        var sliceTill = p_arrPts.length;
        if (p_dblEndOffset) {
            if (p_dblEndOffset > 0) {
                objFromEnd = InfoSvc.getPointOnPolyline(p_arrPts, p_dblEndOffset, true, p_blnIsClosed);
                sliceTill = objFromEnd.segmentIndex + 1;
            }
            else {
                var lastIndex = p_arrPts.length - 1;
                var beforeLastIndex = p_arrPts.length - 2;

                if (p_blnIsClosed) {
                    beforeLastIndex = lastIndex;
                    lastIndex = 0;
                }

                objFromEnd = {
                    point: InfoSvc.getPointOnLine(
                           p_arrPts[lastIndex],
                           p_arrPts[beforeLastIndex],
                           p_dblEndOffset)
                };
                
                sliceTill = p_arrPts.length;
            }
        }
        else if (p_blnIsClosed) {
            sliceTill = p_arrPts.length;
            objFromEnd = {
                point: p_arrPts[0]
	};
        }

        if (objFromStart && objFromEnd && objFromStart.segmentIndex > objFromEnd.segmentIndex)
            return null;

        
        var arrPts = p_arrPts;
        if (p_blnClone) {
            arrPts = p_arrPts.slice(sliceFrom, sliceTill);
        }
        else {
            p_arrPts.splice(sliceTill);
            p_arrPts.splice(0, sliceFrom);
        }

        if (objFromStart) {
            arrPts.splice(0, 0, objFromStart.point);
        }
        if (objFromEnd) {
            arrPts.push(objFromEnd.point);
        }

        return arrPts;
    }

    return CreateGeoSvc;
});