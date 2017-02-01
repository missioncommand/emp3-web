
/* global leafLet, L, emp, armyc2, sec */

leafLet.utils = leafLet.utils || {};

leafLet.utils.airspace = (function(){
    var privateInterface = {
    };

    var publicInterface = {
        createAirspace: function(args)
        {
            var oAirspace;
            var cAirspaceType = emp.typeLibrary.airspaceSymbolCode;
            
            switch (args.item.data.symbolCode)
            {
                case cAirspaceType.SHAPE3D_CYLINDER:
                    oAirspace = new leafLet.typeLibrary.airspace.Cylinder(args);
                    break;
                case cAirspaceType.SHAPE3D_POLYGON:
                    oAirspace = new leafLet.typeLibrary.airspace.Polygon(args);
                    break;
                case cAirspaceType.SHAPE3D_CURTAIN:
                    oAirspace = new leafLet.typeLibrary.airspace.Curtain(args);
                    break;
                case cAirspaceType.SHAPE3D_ORBIT:
                    oAirspace = new leafLet.typeLibrary.airspace.Orbit(args);
                    break;
                case cAirspaceType.SHAPE3D_ROUTE:
                    oAirspace = new leafLet.typeLibrary.airspace.Route(args);
                    break;
                case cAirspaceType.SHAPE3D_TRACK:
                    oAirspace = new leafLet.typeLibrary.airspace.Track(args);
                    break;
                case cAirspaceType.SHAPE3D_RADARC:
                    oAirspace = new leafLet.typeLibrary.airspace.RadArc(args);
                    break;
                case cAirspaceType.SHAPE3D_POLYARC:
                    oAirspace = new leafLet.typeLibrary.airspace.PolyArc(args);
                    break;
                default:
                    throw new Error("Airspace of this type are not yet supported.");
            }
            
            return oAirspace;
        },
        createEditor: function(oInstanceInterface, oTransaction, oEmpItem, oAirspace)
        {
            var oEditor;
            var cAirspaceType = emp.typeLibrary.airspaceSymbolCode;
            var sSymbolCode = (oAirspace? oAirspace.getData().symbolCode: oEmpItem.symbolCode);
            var oParameters = {
                transaction: oTransaction,
                EmpDrawEditItem: oEmpItem,
                feature: oAirspace,
                instanceInterface: oInstanceInterface
            };

            switch (sSymbolCode)
            {
                case cAirspaceType.SHAPE3D_CURTAIN:
                    oEditor = new leafLet.editor.AirspaceCurtain(oParameters);
                    break;
                case cAirspaceType.SHAPE3D_POLYGON:
                    oEditor = new leafLet.editor.AirspacePolygon(oParameters);
                    break;
                case cAirspaceType.SHAPE3D_CYLINDER:
                    oEditor = new leafLet.editor.AirspaceCylinder(oParameters);
                    break;
                case cAirspaceType.SHAPE3D_ORBIT:
                    oEditor = new leafLet.editor.AirspaceOrbit(oParameters);
                    break;
                case cAirspaceType.SHAPE3D_ROUTE:
                    oEditor = new leafLet.editor.AirspaceRoute(oParameters);
                    break;
                case cAirspaceType.SHAPE3D_TRACK:
                    oEditor = new leafLet.editor.AirspaceTrack(oParameters);
                    break;
                case cAirspaceType.SHAPE3D_RADARC:
                    oEditor = new leafLet.editor.AirspaceRadArc(oParameters);
                    break;
                case cAirspaceType.SHAPE3D_POLYARC:
                    oEditor = new leafLet.editor.AirspacePolyArc(oParameters);
                    break;
                default:
                    throw new Error("Airspace Editor for this type is not yet implemented.");
            }
            
            return oEditor;
        }
    };
    
    return publicInterface;
}());
