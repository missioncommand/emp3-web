// Ensure the namespace has been created
var cesiumEngine = cesiumEngine || {};



cesiumEngine.geoLibrary = {
    METERS_PER_DEG: 111319.49079327357264771338267056,
    Point: function (x, y)
    {
        /*this.x = null;
         this.y = null;
         if (x != null)
         this.x = x;
         if (y != null)
         this.y = y;*/
        return {
            x: x,
            y: y
        };
    },
    metersPerPixel: function (scale)
    {
        var inchPerMeter = 39.3700787,
                pixelsPerInch = 96,
                step1 = scale / pixelsPerInch;
        return step1 / inchPerMeter;
    },
    ddToMGRS: function (latDD, longDD)
    {
        var NS = "N",
                EW = "E",
                lat,
                lng;

        if (latDD < 0)
        {
            latDD = Math.abs(latDD);
            NS = "S";
        }
        if (longDD < 0)
        {
            longDD = Math.abs(longDD);
            EW = "W";
        }
        lat = emp.geoLibrary.ddToDMS(latDD);
        lng = emp.geoLibrary.ddToDMS(longDD);
        return emp.geoLibrary.dmsToMGRS(lat.deg, lat.minute, lat.sec, lng.deg, lng.minute, lng.sec, NS, EW);
    },
    ddToDMS: function (decDeg)
    {
        var deg = Math.abs(decDeg),
                DMS = {},
                sec;
        DMS.deg = Math.abs(Math.floor(deg));
        DMS.minute = Math.floor(Math.abs(deg - DMS.deg) * 60);
        sec = (((deg - DMS.deg) * 60) - DMS.minute) * 60;
        DMS.sec = sec;
        return DMS;
    },
    deg2rad: function (deg)
    {
        var conv_factor = (2.0 * Math.PI) / 360.0;
        return (deg * conv_factor);
    },
    dmsToMGRS: function (latDegrees, latMinutes, latSeconds, longDegrees, longMinutes, longSeconds, NS, EW)
    {
        //with (Math) {
        var Deg2Rad = Math.PI / 180.0,
                Area = "UTM2",
                Alpha100km = 'VQLFAVQLFAWRMGBWRMGBXSNHCXSNHCYTOJDYTOJDZUPKEZUPKEVQLFAVQLFAWRMGBWRMGBXSNHCXSNHCYTOJDYTOJDZUPKEZUPKE',
                // UTM WGS84 Ellipsoid
                F0 = 0.9996,
                A1 = 6378137.0 * F0,
                B1 = 6356752.3142 * F0,
                K0 = 0,
                N0 = 0,
                E0 = 500000,
                N1 = (A1 - B1) / (A1 + B1),
                // n
                N2 = N1 * N1,
                N3 = N2 * N1,
                E2 = ((A1 * A1) - (B1 * B1)) / (A1 * A1),
                // e^2
                Deg = latDegrees,
                Min = latMinutes,
                Sec = latSeconds,
                Lat = Math.abs(Deg) + Math.abs(Min) / 60.0 + Math.abs(Sec) / 3600.0,
                South = ((NS.toUpperCase() === 'S') && (Lat > 0)),
                West,
                North,
                East,
                IEast,
                INorth,
                EastStr,
                NorthStr,
                Long,
                K,
                L,
                SINK,
                COSK,
                TANK,
                TANK2,
                COSK2,
                COSK3,
                K3,
                K4,
                Merid,
                MeridWest,
                L0,
                J3,
                J4,
                J5,
                J6,
                M,
                Temp,
                V,
                R,
                H2,
                P,
                P2,
                P4,
                J7,
                J8,
                J9,
                GR100km,
                GRremainder,
                LongZone,
                GR,
                Letters,
                Pos,
                LatZone,
                N100km,
                E100km;

        if (South)
        {
            Lat = -Lat;
        }

        Deg = longDegrees;
        Min = longMinutes;
        Sec = longSeconds;
        West = (EW.toUpperCase() === 'W');
        Long = 1.0 * Math.abs(Deg) + Math.abs(Min) / 60.0 + Math.abs(Sec) / 3600.0;
        if (West)
        {
            Long = -Long;
        }
        K = Lat * Deg2Rad;
        L = Long * Deg2Rad;
        SINK = Math.sin(K);
        COSK = Math.cos(K);
        TANK = SINK / COSK;
        TANK2 = TANK * TANK;
        COSK2 = COSK * COSK;
        COSK3 = COSK2 * COSK;
        K3 = K - K0;
        K4 = K + K0;
        Merid = Math.floor((Long) / 6) * 6 + 3;
        if ((Lat >= 72) && (Long >= 0))
        {
            if (Long < 9)
            {
                Merid = 3;
            }
            else if (Long < 21)
            {
                Merid = 15;
            }
            else if (Long < 33)
            {
                Merid = 27;
            }
            else if (Long < 42)
            {
                Merid = 39;
            }
        }
        if ((Lat >= 56) && (Lat < 64))
        {
            if ((Long >= 3) && (Long < 12))
            {
                Merid = 9;
            }
        }
        MeridWest = Merid < 0;
        L0 = Merid * Deg2Rad;
        // Long of True Origin (3,9,15 etc)
        // ArcofMeridian
        J3 = K3 * (1 + N1 + 1.25 * (N2 + N3));
        J4 = Math.sin(K3) * Math.cos(K4) * (3 * (N1 + N2 + 0.875 * N3));
        J5 = Math.sin(2 * K3) * Math.cos(2 * K4) * (1.875 * (N2 + N3));
        J6 = Math.sin(3 * K3) * Math.cos(3 * K4) * 35 / 24 * N3;
        M = (J3 - J4 + J5 - J6) * B1;
        // VRH2
        Temp = 1 - E2 * SINK * SINK;
        V = A1 / Math.sqrt(Temp);
        R = V * (1 - E2) / Temp;
        H2 = V / R - 1.0;
        P = L - L0;
        P2 = P * P;
        P4 = P2 * P2;
        J3 = M + N0;
        J4 = V / 2 * SINK * COSK;
        J5 = V / 24 * SINK * (COSK3) * (5 - (TANK2) + 9 * H2);
        J6 = V / 720 * SINK * COSK3 * COSK2 * (61 - 58 * (TANK2) + TANK2 * TANK2);
        North = J3 + P2 * J4 + P4 * J5 + P4 * P2 * J6;
        if (((Area === 'UTM1') || (Area === 'UTM2')) && South)
        {
            North = North + 10000000.0;
            // UTM S hemisphere
        }
        J7 = V * COSK;
        J8 = V / 6 * COSK3 * (V / R - TANK2);
        J9 = V / 120 * COSK3 * COSK2;
        J9 = J9 * (5 - 18 * TANK2 + TANK2 * TANK2 + 14 * H2 - 58 * TANK2 * H2);
        East = E0 + P * J7 + P2 * P * J8 + P4 * P * J9;
        IEast = Math.round(East);
        INorth = Math.round(North);
        // should strictly be trunc
        EastStr = '';
        EastStr = EastStr + Math.abs(IEast);
        NorthStr = '';
        NorthStr = NorthStr + Math.abs(INorth);
        while (EastStr.length < 7)
        {
            EastStr = '0' + EastStr;
        }
        while (NorthStr.length < 7)
        {
            NorthStr = '0' + NorthStr;
        }
        GR100km = EastStr.substring(1, 2) + NorthStr.substring(1, 2);
        GRremainder = EastStr.substring(2, 7) + " " + NorthStr.substring(2, 7);

        if ((Area === 'UTM1') || (Area === 'UTM2'))
        {
            // UTM
            LongZone = (Merid - 3) / 6 + 31;
            if (LongZone % 1 !== 0)
            {
                //non-UTM central meridian
                GR = null;
            }
            else
            {
                if (IEast < 100000 || Lat < -80 || IEast > 899999 || Lat >= 84)
                {
                    // outside UTM grid area
                    GR = null;
                }
                else
                {
                    Letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
                    Pos = Math.round(Lat / 8 - 0.5) + 10 + 2;
                    LatZone = Letters.substring(Pos, Pos + 1);
                    if (LatZone > 'X')
                    {
                        LatZone = 'X';
                    }
                    Pos = Math.round(Math.abs(INorth) / 100000 - 0.5);
                    while (Pos > 19)
                    {
                        Pos = Pos - 20;
                    }
                    if (LongZone % 2 === 0)
                    {
                        Pos = Pos + 5;
                        if (Pos > 19)
                        {
                            Pos = Pos - 20;
                        }
                    }
                    N100km = Letters.substring(Pos, Pos + 1);

                    Pos = GR100km / 10 - 1;
                    P = LongZone;
                    while (P > 3)
                    {
                        P = P - 3;
                    }
                    Pos = Pos + ((P - 1) * 8);
                    E100km = Letters.substring(Pos, Pos + 1);
                    GR = LongZone + LatZone + ' ' + E100km + N100km + ' ' + GRremainder;
                }
            }
            return GR;
        }

        return "Did not convert correctly";
    },
    ValidLongZone: function (ZoneCell)
    {
        if ((ZoneCell < 1) || (ZoneCell > 60))
        {
            return false;
        }
        else
        {
            return true;
        }
    },
    UTMCMfromLongZone: function (ZoneCell)
    {
        if (!this.ValidLongZone(ZoneCell))
        {
            return -181; //"#INVALID LONGITUDE ZONE";
        }
        else
        {
            return (ZoneCell - 1) * 6 - 180 + 3;
        }
    },
    truncateDecimal: function (value)
    {
        var precision = 5,
                returnValue = value,
                valString = value.toString(),
                dotIndex = valString.indexOf("."),
                baseValue,
                decValue,
                isNegative = valString.indexOf("-"); //Added by AOrechovesky because this does not take into acount
        //negative coords that do not have a base (i.e. -0.7)
        if (dotIndex !== -1)
        {
            if (dotIndex + precision <= valString.length)
            {
                baseValue = parseFloat(valString.substr(0, dotIndex));
                decValue = parseFloat(valString.substr(dotIndex, precision + 1));
                //if "isNegative" means that it found a "no base value"
                //negative number
                if (baseValue < 0 || isNegative !== -1)
                {
                    if (decValue === 0.99999)
                    {
                        baseValue -= 1;
                        decValue = 0.0;
                    }
                    returnValue = baseValue - decValue;
                }
                else
                {
                    if (decValue === 0.99999)
                    {
                        baseValue += 1;
                        decValue = 0.0;
                    }
                    returnValue = baseValue + decValue;
                }
            }
        }
        return returnValue;
    },
    TM2LL: function (LatLong, EastCell, NorthCell, Merid)
    {
        var Area = 4,
                Deg2Rad = 3.14159265358979 / 180,
                MGRS_Old = (Area < 0),
                F0,
                A1,
                B1,
                K0,
                L0,
                N0,
                N1,
                N2,
                N3,
                E0,
                E2,
                N,
                E,
                NRel,
                K,
                K3,
                K4,
                J3,
                J4,
                J5,
                J6,
                M,
                Finished,
                SINK,
                COSK,
                TANK,
                TANK2,
                Temp,
                V,
                R,
                H2,
                V3,
                Y1,
                Y12,
                K9,
                J7,
                J8,
                J9,
                L;

        if (MGRS_Old)
        {
            Area = -Area;
        }
        if (Area === 4)
        {
            // ' UTM WGS84 Ellipsoid
            F0 = 0.9996;
            //' Local scale factor on Central Meridian
            A1 = 6378137 * F0;
            // ' Major Semi-axis, WGS84 ellipsoid
            B1 = 6356752.3142 * F0;
            // ' Minor Semi-axis, WGS84 ellipsoid
            K0 = 0;
            // ' Lat of True Origin
            L0 = Merid * Deg2Rad;
            // ' Long of True Origin (3,6,9 etc)
            N0 = 0;
            // ' Grid Northing of True Origin (m)
            E0 = 500000;
            // ' Grid Easting of True Origin (m)
        }
        else
        {
            return -181; //"#INVALID AREA 8";
        }

        N1 = (A1 - B1) / (A1 + B1);
        // ' n
        N2 = N1 * N1;
        N3 = N2 * N1;
        E2 = ((A1 * A1) - (B1 * B1)) / (A1 * A1);
        // ' e^2
        N = NorthCell;
        E = EastCell;
        NRel = N - N0;
        K = NRel / A1 + K0;

        while (!Finished)
        {
            K3 = K - K0;
            K4 = K + K0;
            J3 = K3 * (1 + N1 + 1.25 * (N2 + N3));
            J4 = Math.sin(K3) * Math.cos(K4) * (3 * (N1 + N2 + 0.875 * N3));
            J5 = Math.sin(2 * K3) * Math.cos(2 * K4) * (1.875 * (N2 + N3));
            J6 = Math.sin(3 * K3) * Math.cos(3 * K4) * 35 / 24 * N3;
            M = (J3 - J4 + J5 - J6) * B1;
            Finished = Math.abs(NRel - M) < 0.001;
            if (!Finished)
            {
                K = K + (NRel - M) / A1;
            }
        }
        SINK = Math.sin(K);
        COSK = Math.cos(K);
        TANK = SINK / COSK;
        TANK2 = TANK * TANK;
        Temp = 1 - E2 * SINK * SINK;
        V = A1 / Math.sqrt(Temp);
        R = V * (1 - E2) / Temp;
        H2 = V / R - 1;
        V3 = V * V * V;
        Y1 = E - E0;
        Y12 = Y1 * Y1;
        J3 = TANK / (2 * R * V);
        J4 = TANK / (24 * R * V3) * (5 + 3 * TANK2 + H2 - 9 * TANK2 * H2);
        J5 = TANK / (720 * R * Math.pow(V, 5)) * (61 + 90 * TANK * TANK + 45 * Math.pow(TANK, 4));
        K9 = K - Y12 * J3 + Y12 * Y12 * J4 - Math.pow(Y1, 6) * J5;
        J6 = 1 / (COSK * V);
        J7 = 1 / (COSK * 6 * V3) * (V / R + 2 * TANK2);
        J8 = 1 / (COSK * 120 * Math.pow(V, 5)) * (5 + 28 * TANK * TANK + 24 * Math.pow(TANK, 4));
        J9 = 1 / (COSK * 5040 * Math.pow(V, 7));
        J9 = J9 * (61 + 662 * TANK * TANK + 1320 * Math.pow(TANK, 4) + 720 * Math.pow(TANK, 6));
        L = L0 + Y1 * J6 - Y1 * Y12 * J7 + Math.pow(Y1, 5) * J8 - Math.pow(Y1, 7) * J9;
        //var L = L0 + Y1 * J6 - Y1 * Y12 * J7 + Y1 ^ 5 * J8 - Y1 ^ 7 * J9;
        K = K9;
        if (LatLong.toUpperCase() === "LATITUDE")
        {
            //return -181;//
            return this.truncateDecimal(K / Deg2Rad);
            //'TM2LL = Int(K / Deg2Rad * 100000 + 0.5) / 100000
        }
        else if (LatLong.toUpperCase() === "LONGITUDE")
        {
            return this.truncateDecimal(L / Deg2Rad);
            //'TM2LL = Int(L / Deg2Rad * 100000 + 0.5) / 100000
        }
        else
        {
            return -181; //"#FIRST PARAMETER MUST BE 9";
            // & Chr(34) & "latitude" & Chr(34) & " or " & Chr(34) & "longitude" & Chr(34)
        }
    },
    mgrsToDD: function (LatLong, GRCell)
    {
        var Area = 4,
                noSpace = GRCell.split(" "),
                isEven,
                S,
                i,
                LongZoneNumber,
                Posn,
                MGRS_Old,
                GRLength,
                LatZoneNumber,
                GRX,
                LatZoneLetter,
                Long100Letter,
                Lat100Letter,
                LongZoneMerid,
                Long100Number,
                LatZoneDeg,
                Lat100Number,
                ApproxLatZoneKm,
                LatKm,
                Neg,
                Diff,
                PrevDiff,
                GRY,
                Ndigits,
                X,
                Y,
                nn,
                HalfDigits,
                Mult,
                hj,
                Merid;
        GRCell = noSpace.join("");
        isEven = false;
        if ((GRCell.length >= 6) && (!isEven))
        {
            GRLength = GRCell.length;
            if (GRLength > 2)
            {
                S = "";
                for (i = 0; i < GRLength; i += 1)
                {
                    if (GRCell.substr(i, 1) !== " ")
                    {
                        S = S + GRCell.substr(i, 1);
                    }
                }
                GRCell = S;
            }
            GRLength = GRCell.length;
            if (GRLength < 3)
            {
                //#INVALID MGRS GRID REFERENCE 1

                return -181; //"#INVALID GRID REFERENCE 1";
            }
            GRCell = GRCell.toUpperCase();
            MGRS_Old = Area < 0;
            if (MGRS_Old)
            {
                Area = -Area;
            }
            if (Area === 4)
            {

                //' analyse UTM code
                if (!isNaN(parseFloat(GRCell.substr(0, 2))))
                {
                    //if (parseInt(GRCell.substr(1, 1)))
                    //{
                    Posn = 2;

                    LongZoneNumber = parseFloat(GRCell.substr(0, 2));
                    //}
                    //else
                    //{
                    //	Posn = 1;
                    //}

                }
                else
                {
                    //#INVALID MGRS GRID REFERENCE 2
                    //return -181;//"#INVALID MGRS GRID REFERENCE 2";
                    Posn = 1;

                    LongZoneNumber = parseFloat(GRCell.substr(0, 1));

                }
                LatZoneLetter = GRCell.substr(Posn, 1);
                Posn = Posn + 1;
                Long100Letter = GRCell.substr(Posn, 1);
                Posn = Posn + 1;
                Lat100Letter = GRCell.substr(Posn, 1);
                Posn = Posn + 1;
                //' deal with longitude params
                LongZoneMerid = (LongZoneNumber - 1) * 6 - 180 + 3;
                Long100Number = Long100Letter.charCodeAt(0) - 64;
                if ((Long100Number < 1) || (Long100Number > 26) || (Long100Number === 9) || (Long100Number === 15))
                {
                    return -181; //"#INVALID MGRS GRID REFERENCE 3";
                }
                //' 24 long codes 'A'..'Z' missing out 'I' and 'O'
                //' ABCDEFFG  JKLMNPQR  STUVWXYZ
                //' 12345678  12345678  12345678
                if (Long100Number > 8)
                {
                    // ' 'I'...
                    Long100Number = Long100Number - 9;
                    if (Long100Number > 5)
                    {
                        // Then ' 'O'...
                        Long100Number = Long100Number - 1;
                        if (Long100Number > 8)
                        {
                            Long100Number = Long100Number - 8;
                        }
                    }
                }
                GRX = 100000 * Long100Number;
                //' 100km to M
                //' deal with latitude params
                LatZoneNumber = LatZoneLetter.charCodeAt(0) - 66;
                if ((LatZoneNumber < 1) || (LatZoneNumber > 22) || (LatZoneNumber === 7) || (LatZoneNumber === 13))
                {
                    // INVALID MGRS GRID REFERENCE 4
                    return -181; //"#INVALID MGRS GRID REFERENCE 4";
                }
                //' 20 lat zones 'C'..'X' Missing out I' and 'O' 'C'=1  at 80S
                if (LatZoneNumber > 6)
                {
                    //  ' get rid of 'I' and 'O'
                    LatZoneNumber = LatZoneNumber - 1;
                    if (LatZoneNumber > 11)
                    {
                        LatZoneNumber = LatZoneNumber - 1;
                    }
                }
                LatZoneDeg = (LatZoneNumber - 1) * 8 - 80;
                //' N from 80S
                Lat100Number = Lat100Letter.charCodeAt(0) - 64;
                if ((Lat100Number < 1) || (Lat100Number > 22) || (Lat100Number === 9) || (Lat100Number === 15))
                {
                    //INVALID MGRS GRID REFERENCE 5
                    return -181; //;
                }
                //' 20 lat codes 'A'..'V' missing out 'I' and 'O'
                if (Lat100Number > 8)
                {
                    // Then  ' get rid of 'I' and 'O'
                    Lat100Number = Lat100Number - 1;
                    if (Lat100Number > 13)
                    {
                        Lat100Number = Lat100Number - 1;
                    }
                }
                if ((LongZoneNumber % 2) === 0)
                {
                    // Then ' convert 'F'..'V'..'E' to 'A'..'V''
                    if (Lat100Number > 5)
                    {
                        Lat100Number = Lat100Number - 5;
                    }
                    else
                    {
                        Lat100Number = Lat100Number + 15;
                    }
                }
                ApproxLatZoneKm = LatZoneDeg * 110;
                LatKm = (Lat100Number - 1) * 100;
                Neg = ApproxLatZoneKm < 0;
                if (Neg)
                {
                    LatKm = 2000 - LatKm;
                    ApproxLatZoneKm = -ApproxLatZoneKm;
                }
                if (Neg)
                {
                    ApproxLatZoneKm = ApproxLatZoneKm - 110 * 8;
                }
                Diff = 0;
                PrevDiff = 1;
                while (Diff < PrevDiff)
                {
                    PrevDiff = Math.abs(LatKm - ApproxLatZoneKm);
                    LatKm = LatKm + 2000;
                    Diff = Math.abs(LatKm - ApproxLatZoneKm);
                }
                LatKm = LatKm - 2000;
                if ((LatZoneLetter === "X") && (LatKm < (Math.floor(ApproxLatZoneKm / 100) * 100)))
                {
                    LatKm = LatKm + 2000;
                }
                if (Neg)
                {
                    LatKm = -LatKm;
                }
                if (MGRS_Old)
                {
                    LatKm = LatKm - 1000;
                }
                GRY = LatKm * 1000;
                //' now locate within 100km square
                Ndigits = GRCell.length - (Posn + 1);
                X = 0;
                Y = 0;
                switch (Ndigits)
                {
                    case 0:
                        // ' 100km
                    case 1:
                        //  ' 50km
                        nn = parseInt(GRCell.substr(Posn, 1), 10);
                        switch (nn)
                        {
                            case 1:
                                Y = 50000;
                                break;
                            case 2:
                            case 3:
                                X = 50000;
                                Y = 50000;
                                break;
                            case 4:
                                X = 50000;
                                break;
                            default:
                                // INVALID MGRS GRID REFERENCE 5
                                return -181; //;
                        }
                        break;
                    case 2:
                    case 4:
                    case 6:
                    case 8:
                    case 10:
                    default:
                        // ' 10km...1m
                        HalfDigits = Ndigits / 2;
                        X = parseInt(GRCell.substr(Posn, HalfDigits + 1), 10);
                        Y = parseInt(GRCell.substr((Posn + HalfDigits + 1), HalfDigits + 1), 10);
                        Mult = 100000;
                        for (hj = 0; hj < HalfDigits; hj += 1)
                        {
                            Mult = Mult / 10;
                        }
                        X = X * Mult;
                        Y = Y * Mult;
                        // INVALID MGRS GRID REFERENCE 6
                        break;
                }
                GRX = GRX + X;
                GRY = GRY + Y;
                Merid = this.UTMCMfromLongZone(LongZoneNumber);
                return this.TM2LL(LatLong, GRX, GRY, Merid);
            }
            else
            {
                // UNSUPPORTED AREA 7
                return -181;

            }
        }
        // end of function bad return
        return -181;
    },
    getMetersPerDegAtLat: function (lat) // Compute lengths of degrees
    {

        var m1,
                m2,
                m3,
                m4,
                p1,
                p2,
                p3,
                latlen,
                longlen;

        // Convert latitude to radians
        lat = emp.geoLibrary.deg2rad(lat);

        // Set up "Constants"
        m1 = 111132.92; // latitude calculation term 1

        m2 = -559.82; // latitude calculation term 2

        m3 = 1.175; // latitude calculation term 3

        m4 = -0.0023; // latitude calculation term 4

        p1 = 111412.84; // longitude calculation term 1

        p2 = -93.5; // longitude calculation term 2

        p3 = 0.118; // longitude calculation term 3

        // Calculate the length of a degree of latitude and longitude in meters

        latlen = m1 + (m2 * Math.cos(2 * lat)) + (m3 * Math.cos(4 * lat)) + (m4 * Math.cos(6 * lat));

        longlen = (p1 * Math.cos(lat)) + (p2 * Math.cos(3 * lat)) + (p3 * Math.cos(5 * lat));

        return longlen; //,latlen];

        //return emp.geoLibrary.measureDistance(lat,0,lat,1,"meters");
    },
    getPointFromDistanceBearing: function (startLat, startLon, distance, bearing)
    {
        var milsPerDegree = 17.7777777778;
        // Comvert bearing in degrees to bearing in mils for calculation
        bearing = bearing * Math.PI / 180;
        //Earths radius according to WGS84
        var R = 6371; // 007.1809;
        var lat2 = Math.asin(Math.sin(startLat) * Math.cos(distance / R) + Math.cos(startLat) * Math.sin(distance / R) * Math.cos(bearing));
        var lon2 = startLon + Math.atan2(Math.sin(bearing) * Math.sin(distance / R) * Math.cos(startLat), Math.cos(distance / R) - Math.sin(startLat) * Math.sin(lat2));
        return {
            lat: lat2,
            lon: lon2
        };
    },
    getMidPoint: function (lat1, lon1, lat2, lon2)
    {
        var lat3 = (lat1 + lat2) / 2;
        var f1 = Math.tan(Math.PI / 4 + lat1 / 2);
        var f2 = Math.tan(Math.PI / 4 + lat2 / 2);
        var f3 = Math.tan(Math.PI / 4 + lat3 / 2);
        var lon3 = ((lon2 - lon1) * Math.log(f3) + lon1 * Math.log(f2) - lon2 * Math.log(f1)) / Math.log(f2 / f1);
        return lon3;
    },
    /*
     getBearing: function(){
     var y = Math.sin(dLon) * Math.cos(lat2);
     var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
     var brng = Math.atan2(y, x).toDeg();
     return brng;
     },
     */
    measureDistance: function (latitude1, longitude1, latitude2, longitude2, unitOfMeasure)
    {
        // latitude1,latitude2 = latitude, longitude1,longitude2 = longitude
        //Radius is 6378.1 (km), 3963.1 (mi), 3443.9 (nm

        var distance = -1,
                rad;
        //if((validateCoordinate(latitude1,longitude1) == true)&&(validateCoordinate(latitude2,longitude2) == true))
        //{

        switch (unitOfMeasure.toLowerCase())
        {
            case "kilometers":
                rad = 6378.137;
                break;
            case "meters":
                rad = 6378137;
                break;
            case "miles":
                rad = 3963.1;
                break;
            case "feet":
                rad = 20925524.9;
                break;
            case "yards":
                rad = 6975174.98;
                break;
            case "nautical":
                rad = 3443.9;
                break;
            case "nautical miles":
                rad = 3443.9;
                break;
            default:
                return -1;
        }
        latitude1 = latitude1 * (Math.PI / 180);
        latitude2 = latitude2 * (Math.PI / 180);
        longitude1 = longitude1 * (Math.PI / 180);
        longitude2 = longitude2 * (Math.PI / 180);
        distance = (Math.acos(Math.cos(latitude1) * Math.cos(longitude1) * Math.cos(latitude2) * Math.cos(longitude2) + Math.cos(latitude1) * Math.sin(longitude1) * Math.cos(latitude2) * Math.sin(longitude2) + Math.sin(latitude1) * Math.sin(latitude2)) * rad);
        //}
        return distance;
    },
    coordinateArrayToString: function (coordinates)
    {
        var len = coordinates.length,
                coordString = '',
                controlLong = coordinates[0][0],
                controlLat = coordinates[0][1],
                i;

        for (i = 0; i < len; i += 1)
        {
            if (i > 0)
            {
                coordString += ' ';
            }
            coordString += coordinates[i][0].toString() + "," + coordinates[i][1].toString();
            if (coordinates[i].length === 3)
            {
                coordString += "," + coordinates[i][2].toString();
            }
            else
            {
                coordString += ",0";
            }
        }
        return coordString;
    },
    coordinateStringToArray: function (coordinates)
    {
        var coordArr = [],
                pairs,
                len,
                i,
                values,
                alt;
        if (coordinates.length > 0)
        {
            pairs = coordinates.split(" ");
            len = pairs.length;
            for (i = 0; i < len; i += 1)
            {
                values = pairs[i].split(',');
                alt = 0;
                if (values.length === 3)
                {
                    alt = parseInt(values[2], 10);
                }
                coordArr.push({
                    lat: parseFloat(values[1]),
                    lon: parseFloat(values[0]),
                    alt: alt
                });
            }
        }
        return coordArr;
    },
    validateLatLon: function (lat, lon)
    {
        var valid = false;
        if (!isNaN(lat) && !isNaN(lon))
        {
            if (lat <= 90 && lat >= -90 && lon <= 180 && lon >= -180)
            {
                valid = true;
            }
        }
        return valid;
    },
    //private static double sm_a	= 6378137;WGS-84
    /*
     Degrees To Radians
     */
    DegToRad: function (deg)
    {
        return deg / 180.0 * Math.PI;
    },
    /*
     Radians to Degrees
     */
    RadToDeg: function (rad)
    {
        return rad / Math.PI * 180.0;
    },
    /**
     * Returns the azimuth from true north between two points
     * @param c1 - geocoord object with 'x' and 'y' parameters
     * @param c2 - geocoord object with 'x' and 'y' parameters
     * @return the azimuth from c1 to c2 in degrees
     */
    GetAzimuth: function (c1, c2)
    { //was private
        var theta = 0;
        try
        {
            var lat1 = this.DegToRad(c1.y);
            var lon1 = this.DegToRad(c1.x);
            var lat2 = this.DegToRad(c2.y);
            var lon2 = this.DegToRad(c2.x);
            //formula
            //θ = atan2( sin(Δlong).cos(lat2),
            //cos(lat1).sin(lat2) − sin(lat1).cos(lat2).cos(Δlong) )
            //var theta = Math.atan2( Math.sin(lon2-lon1)*Math.cos(lat2),
            //Math.cos(lat1)*Math.sin(lat2) − Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1) );
            var y = Math.sin(lon2 - lon1);
            y *= Math.cos(lat2);
            var x = Math.cos(lat1);
            x *= Math.sin(lat2);
            var z = Math.sin(lat1);
            z *= Math.cos(lat2);
            z *= Math.cos(lon2 - lon1);
            x = x - z;
            theta = Math.atan2(y, x);
            theta = this.RadToDeg(theta);
        }
        catch (error)
        {
            //System.out.println(e.getMessage());
        }
        return theta; //RadToDeg(k);
    },
    /**
     * Calculates a geodesic point and given distance and azimuth from the srating geodesic point
     *
     * @param start the starting point
     * @param distance the distance in meters
     * @param azimuth the azimuth or bearing in degrees
     *
     * @return the calculated point
     */
    geodesic_coordinate: function (start,
            distance,
            azimuth)
    {
        pt = this.Point();

        var sm_a = 6378137; //WGS - 84
        try
        {
            //formula
            //lat2 = asin(sin(lat1)*cos(d/R) + cos(lat1)*sin(d/R)*cos(θ))
            //lon2 = lon1 + atan2(sin(θ)*sin(d/R)*cos(lat1), cos(d/R)−sin(lat1)*sin(lat2))

            var a = 0,
                    b = 0,
                    c = 0,
                    d = 0,
                    e = 0,
                    f = 0,
                    g = 0,
                    h = 0,
                    j = 0,
                    k = 0,
                    l = 0,
                    m = 0,
                    n = 0,
                    p = 0,
                    q = 0;

            a = this.DegToRad(start.y);
            b = Math.cos(a);
            c = this.DegToRad(azimuth);
            d = Math.sin(a);
            e = Math.cos(distance / sm_a);
            f = Math.sin(distance / sm_a);
            g = Math.cos(c);
            //uncomment to test calculation
            //var lat2 = RadToDeg(Math.asin(Math.sin(DegToRad(start.y)) * Math.cos(DegToRad(distance / sm_a)) + Math.cos(DegToRad(start.y)) * Math.sin(DegToRad(distance / sm_a)) * Math.cos(DegToRad(azimuth))));
            //lat2 = asin(sin(lat1)*cos(d/R) + cos(lat1)*sin(d/R)*cos(θ))
            //var lat2 = RadToDeg(Math.asin(Math.sin(DegToRad(start.y)) * Math.cos(distance / sm_a) + Math.cos(DegToRad(start.y)) * Math.sin(distance / sm_a) * Math.cos(DegToRad(azimuth))));
            //double lat2 = RadToDeg(Math.asin(Math.sin(DegToRad(start.y)) * Math.cos(distance / sm_a) + Math.cos(DegToRad(start.y)) * Math.sin(distance / sm_a) * Math.cos(DegToRad(azimuth))));
            var lat = this.RadToDeg(Math.asin(d * e + b * f * g));
            h = Math.sin(c);
            k = Math.sin(h);
            l = Math.cos(a);
            m = this.DegToRad(lat);
            n = Math.sin(m);
            p = Math.atan2(h * f * b, e - d * n);
            //uncomment to test calculation
            //var lon2 = start.x + DegToRad(Math.atan2(Math.sin(DegToRad(azimuth)) * Math.sin(DegToRad(distance / sm_a)) * Math.cos(DegToRad(start.y)), Math.cos(DegToRad(distance / sm_a)) - Math.sin(DegToRad(start.y)) * Math.sin(DegToRad(lat))));
            //lon2 = lon1 + atan2(sin(θ)*sin(d/R)*cos(lat1), cos(d/R)−sin(lat1)*sin(lat2))
            //var lon2 = start.x + RadToDeg(Math.atan2(Math.sin(DegToRad(azimuth)) * Math.sin(distance / sm_a) * Math.cos(DegToRad(start.y)), Math.cos(distance / sm_a) - Math.sin(DegToRad(start.y)) * Math.sin(DegToRad(lat2))));
            var lon = start.x + this.RadToDeg(p);
            pt = this.Point();
            pt.x = lon;
            pt.y = lat;

        }
        catch (error)
        {
            //clsUtility.WriteFile("Error in mdlGeodesic.geodesic_distance");

        }
        return pt;
    },
    /**
     * Calculates a geodesic point and given distance and azimuth from the srating geodesic point
     *
     * @param start the starting point
     * @param distance the distance in meters
     * @param azimuth the azimuth or bearing in degrees
     *
     * @return the calculated point
     */
    geodesic_destinationPointTais: function (start,
            distance,
            azimuth)
    {
        //pt = this.Point();
        var airspacePoint = new AirspacePoint();

        var sm_a = 6378137; //WGS - 84
        try
        {
            //formula
            //lat2 = asin(sin(lat1)*cos(d/R) + cos(lat1)*sin(d/R)*cos(θ))
            //lon2 = lon1 + atan2(sin(θ)*sin(d/R)*cos(lat1), cos(d/R)−sin(lat1)*sin(lat2))

            var a = 0,
                    b = 0,
                    c = 0,
                    d = 0,
                    e = 0,
                    f = 0,
                    g = 0,
                    h = 0,
                    j = 0,
                    k = 0,
                    l = 0,
                    m = 0,
                    n = 0,
                    p = 0,
                    q = 0;

            a = this.DegToRad(start.y);
            b = Math.cos(a);
            c = this.DegToRad(azimuth);
            d = Math.sin(a);
            e = Math.cos(distance / sm_a);
            f = Math.sin(distance / sm_a);
            g = Math.cos(c);
            //uncomment to test calculation
            //var lat2 = RadToDeg(Math.asin(Math.sin(DegToRad(start.y)) * Math.cos(DegToRad(distance / sm_a)) + Math.cos(DegToRad(start.y)) * Math.sin(DegToRad(distance / sm_a)) * Math.cos(DegToRad(azimuth))));
            //lat2 = asin(sin(lat1)*cos(d/R) + cos(lat1)*sin(d/R)*cos(θ))
            //var lat2 = RadToDeg(Math.asin(Math.sin(DegToRad(start.y)) * Math.cos(distance / sm_a) + Math.cos(DegToRad(start.y)) * Math.sin(distance / sm_a) * Math.cos(DegToRad(azimuth))));
            //double lat2 = RadToDeg(Math.asin(Math.sin(DegToRad(start.y)) * Math.cos(distance / sm_a) + Math.cos(DegToRad(start.y)) * Math.sin(distance / sm_a) * Math.cos(DegToRad(azimuth))));
            var lat = this.RadToDeg(Math.asin(d * e + b * f * g));
            h = Math.sin(c);
            k = Math.sin(h);
            l = Math.cos(a);
            m = this.DegToRad(lat);
            n = Math.sin(m);
            p = Math.atan2(h * f * b, e - d * n);
            //uncomment to test calculation
            //var lon2 = start.x + DegToRad(Math.atan2(Math.sin(DegToRad(azimuth)) * Math.sin(DegToRad(distance / sm_a)) * Math.cos(DegToRad(start.y)), Math.cos(DegToRad(distance / sm_a)) - Math.sin(DegToRad(start.y)) * Math.sin(DegToRad(lat))));
            //lon2 = lon1 + atan2(sin(θ)*sin(d/R)*cos(lat1), cos(d/R)−sin(lat1)*sin(lat2))
            //var lon2 = start.x + RadToDeg(Math.atan2(Math.sin(DegToRad(azimuth)) * Math.sin(distance / sm_a) * Math.cos(DegToRad(start.y)), Math.cos(distance / sm_a) - Math.sin(DegToRad(start.y)) * Math.sin(DegToRad(lat2))));
            var xRad = this.DegToRad(start.x);
            var xDeg = this.RadToDeg(xRad);
            var lon = xDeg + this.RadToDeg(p);
            airspacePoint.Latitude = lat + "";
            airspacePoint.Longitude = lon + "";
            //pt = {} ; //this.Point();
            //point.Longitude = lon + "";
            //point.Latitude = lat + "";

        }
        catch (error)
        {
            //clsUtility.WriteFile("Error in mdlGeodesic.geodesic_distance");

        }
        return airspacePoint;
    },
    /**
     * returns intersection of two lines, each defined by a point and a bearing
     *
     * @param p1
     * @param brng1
     * @param p2
     * @param brng2
     * @return {string}
     */
    IntersectLines: function (p1,
            brng1,
            p2,
            brng2)
    {
        ptResult = null;
        try
        {
            var lat1 = this.DegToRad(p1.y); //p1._lat.toRad();
            var lon1 = this.DegToRad(p1.x); //p1._lon.toRad();
            var lat2 = this.DegToRad(p2.y); //p2._lat.toRad();
            var lon2 = this.DegToRad(p2.x); //p2._lon.toRad();
            var brng13 = this.DegToRad(brng1); //brng1.toRad();
            var brng23 = this.DegToRad(brng2); //brng2.toRad();
            var dLat = lat2 - lat1;
            var dLon = lon2 - lon1;


            var dist12 = 2 * Math.asin(Math.sqrt(Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)));

            if (dist12 == 0)
            {
                return null;
            }

            var brngA = Math.acos((Math.sin(lat2) - Math.sin(lat1) * Math.cos(dist12)) /
                    (Math.sin(dist12) * Math.cos(lat1)));

            if (isNaN(brngA))
            {
                brngA = 0; // protect against rounding
            }
            var brngB = Math.acos((Math.sin(lat1) - Math.sin(lat2) * Math.cos(dist12)) /
                    (Math.sin(dist12) * Math.cos(lat2)));

            var brng12 = 0,
                    brng21 = 0;
            if (Math.sin(lon2 - lon1) > 0)
            {
                brng12 = brngA;
                brng21 = 2 * Math.PI - brngB;
            }
            else
            {
                brng12 = 2 * Math.PI - brngA;
                brng21 = brngB;
            }

            var alpha1 = (brng13 - brng12 + Math.PI) % (2 * Math.PI) - Math.PI; // angle 2-1-3
            var alpha2 = (brng21 - brng23 + Math.PI) % (2 * Math.PI) - Math.PI; // angle 1-2-3

            if (Math.sin(alpha1) == 0 && Math.sin(alpha2) == 0)
            {
                return null; // infinite intersections
            }
            if (Math.sin(alpha1) * Math.sin(alpha2) < 0)
            {
                return null; // ambiguous intersection
            }
            //alpha1 = Math.abs(alpha1);
            //alpha2 = Math.abs(alpha2);  // ... Ed Williams takes abs of alpha1/alpha2, but seems to break calculation?
            var alpha3 = Math.acos(-Math.cos(alpha1) * Math.cos(alpha2) +
                    Math.sin(alpha1) * Math.sin(alpha2) * Math.cos(dist12));

            var dist13 = Math.atan2(Math.sin(dist12) * Math.sin(alpha1) * Math.sin(alpha2),
                    Math.cos(alpha2) + Math.cos(alpha1) * Math.cos(alpha3));

            var lat3 = Math.asin(Math.sin(lat1) * Math.cos(dist13) +
                    Math.cos(lat1) * Math.sin(dist13) * Math.cos(brng13));
            var dLon13 = Math.atan2(Math.sin(brng13) * Math.sin(dist13) * Math.cos(lat1),
                    Math.cos(dist13) - Math.sin(lat1) * Math.sin(lat3));
            var lon3 = lon1 + dLon13;
            lon3 = (lon3 + Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..180º

            //return new POINT2(lat3.toDeg(), lon3.toDeg());
            ptResult = this.Point(RadToDeg(lon3), RadToDeg(lat3));

        }
        catch (error)
        {

        }
        return ptResult;
    },
    /**
     Checks to see if two bounding boxes touch each other.   Includes intesections or containment of one box within
     the other.  Takes into the case if one of the boxes cross the international date line.
     */
    doesBoundingBoxIntersect: function (bbox1, bbox2)
    {
        var bbox1a;
        var bbox1b;
        var bbox2a;
        var bbox2b;
        // Check edge case where boxes cross the international date line
        // (180th Meridian)
        if (bbox1.left > bbox1.right)
        {
            // Divide the bounding box into 2 sections, one to the left of the 180th Meridian
            // and one to the right.
            bbox1a = new cesiumEngine.geoLibrary.BoundingBox();
            bbox1a.left = bbox1.left;
            bbox1a.right = 180.0;
            bbox1a.top = bbox1.top;
            bbox1a.bottom = bbox1.bottom;
            bbox1b = new cesiumEngine.geoLibrary.BoundingBox();
            bbox1b.left = -180.0;
            bbox1b.right = bbox1.right;
            bbox1b.top = bbox1.top;
            bbox1b.bottom = bbox1.bottom;
            // Check to see if the second bounding box crosses the 180th Meridian
            if (bbox2.left > bbox2.right)
            {
                bbox2a = new cesiumEngine.geoLibrary.BoundingBox();
                bbox2a.left = bbox2.left;
                bbox2a.right = 180.0;
                bbox2a.top = bbox2.top;
                bbox2a.bottom = bbox2.bottom;
                bbox2b = new cesiumEngine.geoLibrary.BoundingBox();
                bbox2b.left = -180.0;
                bbox2b.right = bbox2.right;
                bbox2b.top = bbox2.top;
                bbox2b.bottom = bbox2.bottom;
                // The 2nd bounding box does not cross the meridian, so just compare the
                // the split first bouding box.  If any piece intersects with bbox2 it intersects.
                if (this.checkBboxOverlap(bbox1a, bbox2a) == true || this.checkBboxOverlap(bbox2a, bbox1a) == true || this.checkBboxOverlap(bbox1b, bbox2b) == true || this.checkBboxOverlap(bbox2b, bbox1b) == true)
                {
                    return true;
                }
                return false;
            }
            else
            {
                // Divide the bounding box into 2 sections, one to the left of the 180th Meridian
                // and one to the right.
                bbox2a = new cesiumEngine.geoLibrary.BoundingBox();
                bbox2a.left = bbox2.left;
                bbox2a.right = 180.0;
                bbox2a.top = bbox2.top;
                bbox2a.bottom = bbox2.bottom;
                bbox2b = new cesiumEngine.geoLibrary.BoundingBox();
                bbox2b.left = -180.0;
                bbox2b.right = bbox2.right;
                bbox2b.top = bbox2.top;
                bbox2b.bottom = bbox2.bottom;
                // The 2nd bounding box does not cross the meridian, so just compare the
                // the split first bouding box.  If any piece intersects with bbox2 it intersects.
                if (this.checkBboxOverlap(bbox1, bbox2a) == true || this.checkBboxOverlap(bbox2a, bbox1) == true || this.checkBboxOverlap(bbox1, bbox2b) == true || this.checkBboxOverlap(bbox2b, bbox1) == true)
                {
                    return true;
                }
                return false;
            }
        }
        else if (bbox2.left > bbox2.right)
        {
            if (this.checkBboxOverlap(bbox1a, bbox2) == true || this.checkBboxOverlap(bbox2, bbox1a) == true || this.checkBboxOverlap(bbox1b, bbox2) == true || this.checkBboxOverlap(bbox2, bbox1b) == true)
            {
                return true;
            }
            return false;
        }
        else
        {
            if (this.checkBboxOverlap(bbox1, bbox2) == true || this.checkBboxOverlap(bbox2, bbox1) == true)
            {
                return true;
            }
            return false;
        }
    },
    pointInBbox: function (bbox, x, y)
    {
        if (bbox != null || bbox.left != undefined || bbox.right != undefined || bbox.top != undefined || bbox.bototm != undefined)
        {
            if ((x >= bbox.left) && (x <= bbox.right) && (y >= bbox.bottom) && (y <= bbox.top))
            {
                return true;
            }
        }
        return false;
    },
    checkBboxOverlap: function (bbox1, bbox2)
    {
        if (bbox1 != null && bbox2 != null)
        {
            if (this.pointInBbox(bbox1, bbox2.left, bbox2.top))
            {
                return true;
            }
            if (this.pointInBbox(bbox1, bbox2.right, bbox2.top))
            {
                return true;
            }
            if (this.pointInBbox(bbox1, bbox2.left, bbox2.bottom))
            {
                return true;
            }
            if (this.pointInBbox(bbox1, bbox2.right, bbox2.bottom))
            {
                return true;
            }
        }
        return false;
    },
    //Rectangle.intersection adapted from Rectangle.java to work with geo coords based bounding boxes
    //TODO: Needs more work.  Still returns false in some "true" scenarios.
    checkBboxIntersects: function (bbox1, bbox2)
    {
        var tw = bbox1.right - bbox1.left;
        var th = bbox1.top - bbox1.bottom;//this.height;
        var rw = bbox2.right - bbox2.left;
        var rh = bbox2.top - bbox2.bottom;
        if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0)
        {
            return false;
        }
        var tx = bbox1.left;
        var ty = bbox1.top;
        var rx = bbox2.left;
        var ry = bbox2.top;
        rw += rx;
        rh += ry;
        tw += tx;
        th += ty;
        //      overflow || intersect
        return ((rw < rx || rw > tx) &&
                (rh > ry || rh < ty) &&
                (tw < tx || tw > rx) &&
                (th > ty || th < ry));
    },
    //This code for checkLineIntersectsBox/////////////////////////////////////
    OUT_LEFT: 1,
    OUT_TOP: 2,
    OUT_RIGHT: 4,
    OUT_BOTTOM: 8,
    outcode: function (bbox, x, y)
    {

        var out = 0;
        if (bbox.width <= 0)
        {
            out |= this.OUT_LEFT | this.OUT_RIGHT;
        }
        else if (x < bbox.left)
        {
            out |= this.OUT_LEFT;
        }
        else if (x > bbox.right)
        {
            out |= this.OUT_RIGHT;
        }
        if (bbox.height <= 0)
        {
            out |= this.OUT_TOP | this.OUT_BOTTOM;
        }
        else if (y > bbox.top)
        {
            out |= this.OUT_TOP;
        }
        else if (y < bbox.bottom)
        {
            out |= this.OUT_BOTTOM;
        }
        return out;
    },
    //Checks if a line segment intersects a bounding box
    checkLineIntersectsBox: function (bbox, x1, y1, x2, y2)
    {
        var out1, out2;
        if ((out2 = this.outcode(bbox, x2, y2)) === 0)
        {
            return true;
        }
        while ((out1 = this.outcode(bbox, x1, y1)) !== 0)
        {
            if ((out1 & out2) !== 0)
            {
                return false;
            }
            if ((out1 & (this.OUT_LEFT | this.OUT_RIGHT)) !== 0)
            {
                var x = bbox.left;
                if ((out1 & this.OUT_RIGHT) !== 0)
                {
                    x = bbox.right;
                }
                y1 = y1 + (x - x1) * (y2 - y1) / (x2 - x1);
                x1 = x;
            }
            else
            {
                var y = bbox.top;
                if ((out1 & this.OUT_BOTTOM) !== 0)
                {
                    y = bbox.bottom;
                }
                x1 = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
                y1 = y;
            }
        }
        return true;
    },
    //End, this code for checkLineIntersectsBox////////////////////////////////

    BoundingBox: function (pointString)
    {
        var left,
                right,
                top,
                bottom,
                len,
                points,
                p1,
                p2,
                point,
                i;
        // if the user passes in a coordinate string, parse
        // the coordinate string and find the min and max values for
        // each to get the bounding box.
        // at sacrifice for accuracy if difference between left and right is
        // greater than 180, make the asssumption they crossed the 180th meridian.
        if (pointString != null)
        {
            points = pointString.split(" ");
            len = points.length;
            for (i = 0; i < len; i++)
            {
                point = points[i].split(",");
                p1 = parseFloat(point[0]);
                p2 = parseFloat(point[1])
                if (point.length >= 2)
                {
                    if (this.left == null)
                    {
                        this.left = p1;
                    }
                    else
                    {
                        if (p1 < this.left)
                        {
                            this.left = p1;
                        }
                    }
                    if (this.right == null)
                    {
                        this.right = p1;
                    }
                    else
                    {
                        if (p1 > this.right)
                        {
                            this.right = p1;
                        }
                    }
                    if (this.top == null)
                    {
                        this.top = p2;
                    }
                    else
                    {
                        if (p2 > this.top)
                        {
                            this.top = p2;
                        }
                    }
                    if (this.bottom == null)
                    {
                        this.bottom = p2;
                    }
                    else
                    {
                        if (point[1] < this.bottom)
                        {
                            this.bottom = p2;
                        }
                    }
                    // if the difference between right and left is greater
                    // than 180 there is a good chance that the user intends
                    // to cross the 180th meridian.  reverse left and right in
                    // that case.  There is no way to prove this.
                    if ((this.right - this.left) > 180)
                    {
                        var savedvalue = this.left;
                        this.left = this.right;
                        this.right = savedvalue;
                    }
                }
            }
        }
    },
    getBox: function (points)
    {
        var left,
                right,
                top,
                bottom,
                len,
                p1,
                p2,
                point,
                i;

        len = points.length;
        for (i = 0; i < len; i++)
        {
            point = points[i];
            p1 = point.lon;
            p2 = point.lat;
            //if (point.length >= 2) {
            if (left == null)
            {
                left = p1;
            }
            else
            {
                if (p1 < left)
                {
                    left = p1;
                }
            }
            if (right == null)
            {
                right = p1;
            }
            else
            {
                if (p1 > right)
                {
                    right = p1;
                }
            }
            if (top == null)
            {
                top = p2;
            }
            else
            {
                if (p2 > top)
                {
                    top = p2;
                }
            }
            if (bottom == null)
            {
                bottom = p2;
            }
            else
            {
                if (p2 < bottom)
                {
                    bottom = p2;
                }
            }
            // if the difference between right and left is greater
            // than 180 there is a good chance that the user intends
            // to cross the 180th meridian.  reverse left and right in
            // that case.  There is no way to prove
            if ((right - left) > 180)
            {
                var savedvalue = left;
                left = right;
                right = savedvalue;
            }
            // }
        }
        return [{
                lat: bottom,
                lon: left
            }, {
                lat: top,
                lon: left
            }, {
                lat: top,
                lon: right
            }, {
                lat: bottom,
                lon: right
            }];
    },
    /**
     * Calculates a 4 coordinate bounding box from any polygon.  This function takes into account if the the polygon crosses
     * the IDL and may return a bounding box where the left value is greater than the right value.
     *
     * <BR><BR>Example:
     * <P><BLOCKQUOTE><PRE>
     * var points = [{lat:50,lon:45},{lat:50,lon:45},{lat:50,lon:45}];
     * var box = emp.geoLibrary.getBoxIDL(points);
     * var boxString = "left: "+box[0].lon+","+box[0].lat+
     *                 "bottom: "+box[1].lon+","+box[1].lat;
     *                 "right: "+box[2].lon+","+box[2].lat;
     *                 "top: "+box[3].lon+","+box[3].lat;
     *
     * alert( boxString );
     *
     * </PRE></BLOCKQUOTE></P>
     * @param {Array} points required - An array of point with latitude and longitude
     * values in degrees decimal format objects
     * @return A new array of 4 objects each with a lat and lon property in the order of left,bottom,right,top
     * @type Array
     */
    getBoxIDL: function (points)
    {
        var left,
                right,
                top,
                bottom,
                len,
                p1,
                p2,
                point,
                i,
                temp;


        len = points.length;
        for (i = 0; i < len; i++)
        {
            point = points[i];
            p1 = point.lon + 180;
            p2 = point.lat + 90;
            if (left == null)
            {
                left = p1;
            }
            else
            {
                if (p1 < left)
                {
                    left = p1;
                }
            }
            if (right == null)
            {
                right = p1;
            }
            else
            {
                if (p1 > right)
                {
                    right = p1;
                }
            }
            if (top == null)
            {
                top = p2;
            }
            else
            {
                if (p2 > top)
                {
                    top = p2;
                }
            }
            if (bottom == null)
            {
                bottom = p2;
            }
            else
            {
                if (p2 < bottom)
                {
                    bottom = p2;
                }
            }

        }
        if ((right - left) > 180)
        {
            temp = left;
            left = right;
            right = temp;
        }

        if ((top - bottom) > 90)
        {
            temp = top;
            top = bottom;
            bottom = temp;
        }
        return [{
                lat: bottom - 90,
                lon: left - 180
            }, {
                lat: top - 90,
                lon: left - 180
            }, {
                lat: top - 90,
                lon: right - 180
            }, {
                lat: bottom - 90,
                lon: right - 180
            }];
    },
    /**
     * @name latLongToUtm
     *
     * @desc Converts a lat long coordinate into a utm coordinate
     *
     * NOTE: Code derived from http://forum.worldwindcentral.com/showthread.php?t=9863
     *
     * @param numLat - IN - Latitude of the coordinate we want to convert
     * @param numLong - IN - Longitude of the coordinate we want to convert
     * @return A utm coordinate in this format: "zone,easting,northing"
     */
    latLongToUtm: function (numLat, numLong)
    {
        //try {
        var numUTMEasting = 0;
        var numUTMNorthing = 0;
        var strZone = "";

        var numA = 6378137; //WGS84
        var numEccSquared = .00669438; //WGS84
        var numK0 = .9996;

        var numLongOrigin;
        var numEcPrimeSquared;
        var numN;
        var numT;
        var numC;
        var numAA;
        var numM;

        // Make sure the longitude is between -180.00 .. 179.9
        //changed a cast to int to Math.floor
        var numLongTemp = (numLong + 180) - (Math.floor((numLong + 180) / 360)) * 360 - 180; // -180.00 .. 179.9

        var numLatRad = numLat * (Math.PI / 180);
        var numLongRad = numLongTemp * (Math.PI / 180);
        var numLongOriginRad;
        var intZoneNumber;
        //changed (int) to Math.floor
        intZoneNumber = (Math.floor((numLongTemp + 180) / 6)) + 1;

        if (numLat >= 56.0 && numLat < 64.0 && numLongTemp >= 3.0 && numLongTemp < 12.0)
        {
            intZoneNumber = 32;
        }

        // Special zones for Svalbard
        if (numLat >= 772.0 && numLat < 84.0)
        {
            if (numLongTemp >= 0.0 && numLongTemp < 9.0)
            {
                intZoneNumber = 31;
            }
            else if (numLongTemp >= 9.0 && numLongTemp < 21.0)
            {
                intZoneNumber = 33;
            }
            else if (numLongTemp >= 21.0 && numLongTemp < 33.0)
            {
                intZoneNumber = 35;
            }
            else if (numLongTemp >= 33.0 && numLongTemp < 42.0)
            {
                intZoneNumber = 37;
            }
        }

        numLongOrigin = (intZoneNumber - 1) * 6 - 180 + 3; //+3 puts origin in middle of zone
        numLongOriginRad = numLongOrigin * (Math.PI / 180);

        // Compute the UTM Zone from the latitude and longitude
        strZone = intZoneNumber.toString() + this.utmLetterDesignator(numLat);

        var eccPrimeSquared = (numEccSquared) / (1 - numEccSquared);

        numN = numA / Math.sqrt(1 - numEccSquared * Math.sin(numLatRad) * Math.sin(numLatRad));
        numT = Math.tan(numLatRad) * Math.tan(numLatRad);
        numC = eccPrimeSquared * Math.cos(numLatRad) * Math.cos(numLatRad);
        numAA = Math.cos(numLatRad) * (numLongRad - numLongOriginRad);

        numM = numA * (
                (1 - numEccSquared / 4 - 3 * numEccSquared * numEccSquared / 64 - 5 * numEccSquared * numEccSquared * numEccSquared / 256) *
                numLatRad -
                (3 * numEccSquared / 8 + 3 * numEccSquared * numEccSquared / 32 + 45 * numEccSquared * numEccSquared * numEccSquared / 1024) *
                Math.sin(2 * numLatRad) +
                (15 * numEccSquared * numEccSquared / 256 + 45 * numEccSquared * numEccSquared * numEccSquared / 1024) *
                Math.sin(4 * numLatRad) - (35 * numEccSquared * numEccSquared * numEccSquared / 3072) * Math.sin(6 * numLatRad));

        numUTMEasting = Number((numK0 * numN * (numAA + (1 - numT + numC) * numAA * numAA * numAA / 6 +
                (5 - 18 * numT + numT * numT + 72 * numC - 58 * eccPrimeSquared) * numAA * numAA * numAA * numAA * numAA / 120) + 500000.0));

        numUTMNorthing = Number(numK0 * (numM + numN * Math.tan(numLatRad) * (numAA * numAA / 2 + (5 - numT + 9 * numC + 4 * numC * numC) *
                numAA * numAA * numAA * numAA / 24 + (61 - 58 * numT + numT * numT + 600 * numC - 330 * eccPrimeSquared) *
                numAA * numAA * numAA * numAA * numAA * numAA / 720)));

        if (numLat < 0)
        {
            numUTMNorthing += 10000000.0; //10000000 meter offset for southern hemisphere
        }

        //var utmValue = strZone + "," + numUTMEasting.toString() + "," + numUTMNorthing.toString();
        var utmValue = strZone + "," + Math.round(numUTMEasting).toString() + "," + Math.round(numUTMNorthing).toString();
        return utmValue;
        // } // End try
        // catch (e) {

        // }

        //  return "";
    },
    /**
     * @name utmLetterDesignator
     *
     * @desc Gets the utm letter that corresponds with a passed in latitude value
     *
     * NOTE: Code derived from http://forum.worldwindcentral.com/showthread.php?t=9863
     *
     * @param numLat - IN - Latitude that need to figure out what utm letter to return
     * @return Utm letter that corresponds with a passed in latitude value
     */
    utmLetterDesignator: function (numLat)
    {
        var strLetterDesignator = "Z";

        // try {
        if ((84 >= numLat) && (numLat >= 72))
        {
            strLetterDesignator = "X";
        }
        else if ((72 > numLat) && (numLat >= 64))
        {
            strLetterDesignator = "W";
        }
        else if ((64 > numLat) && (numLat >= 56))
        {
            strLetterDesignator = "V";
        }
        else if ((56 > numLat) && (numLat >= 48))
        {
            strLetterDesignator = "U";
        }
        else if ((48 > numLat) && (numLat >= 40))
        {
            strLetterDesignator = "T";
        }
        else if ((40 > numLat) && (numLat >= 32))
        {
            strLetterDesignator = "S";
        }
        else if ((32 > numLat) && (numLat >= 24))
        {
            strLetterDesignator = "R";
        }
        else if ((24 > numLat) && (numLat >= 16))
        {
            strLetterDesignator = "Q";
        }
        else if ((16 > numLat) && (numLat >= 8))
        {
            strLetterDesignator = "P";
        }
        else if ((8 > numLat) && (numLat >= 0))
        {
            strLetterDesignator = "N";
        }
        else if ((0 > numLat) && (numLat >= -8))
        {
            strLetterDesignator = "M";
        }
        else if ((-8 > numLat) && (numLat >= -16))
        {
            strLetterDesignator = "L";
        }
        else if ((-16 > numLat) && (numLat >= -24))
        {
            strLetterDesignator = "K";
        }
        else if ((-24 > numLat) && (numLat >= -32))
        {
            strLetterDesignator = "J";
        }
        else if ((-32 > numLat) && (numLat >= -40))
        {
            strLetterDesignator = "H";
        }
        else if ((-40 > numLat) && (numLat >= -48))
        {
            strLetterDesignator = "G";
        }
        else if ((-48 > numLat) && (numLat >= -56))
        {
            strLetterDesignator = "F";
        }
        else if ((-56 > numLat) && (numLat >= -64))
        {
            strLetterDesignator = "E";
        }
        else if ((-64 > numLat) && (numLat >= -72))
        {
            strLetterDesignator = "D";
        }
        else if ((-72 > numLat) && (numLat >= -89))
        {
            strLetterDesignator = "C";
        }
        else
        {
            strLetterDesignator = "Z"; // Latitude is outside the UTM limits
        }
        //  } // End try
        // catch (e) {
        //     trace(e.getStackTrace());
        // }

        return strLetterDesignator;
    },
    /**
     * @name utmToLatLong
     *
     * @desc Converts a utm coordinate into a lat long coordinate
     *
     * NOTE: code derived from http://stackoverflow.com/questions/343865/how-to-convert-from-utm-to-latlng-in-python-or-javascript
     *
     * @param numZone - IN - Utm zone
     * @param numEasting - IN - Easting value of the utm coordinate
     * @param numNorthing - IN - Northing value of the utm coordinate
     * @param blNorthernHemisphere - IN - True if we are in the northern hemisphere, false otherwise
     * @return A lat long coordinate in this format: "latitude,longitude"
     */
    utmToLatLong: function (numZone, numEasting, numNorthing, blNorthernHemisphere)
    {
        //try {
        if (blNorthernHemisphere === undefined || blNorthernHemisphere === null)
        {
            blNorthernHemisphere = true;
        }
        if (!blNorthernHemisphere)
        {
            numNorthing = 10000000 - numNorthing;
        }

        var numA = 6378137;
        var numE = .081819191
        var numE1sq = .006739497;
        var numK0 = .9996;

        var numArc = numNorthing / numK0;
        var numMu = numArc / (numA * (1 - Math.pow(numE, 2) / 4.0 - 3 * Math.pow(numE, 4) / 64.0 - 5 * Math.pow(numE, 6) / 256.0));

        var numEi = (1 - Math.pow((1 - numE * numE), (1 / 2.0))) / (1 + Math.pow((1 - numE * numE), (1 / 2.0)));

        var numCa = 3 * numEi / 2 - 27 * Math.pow(numEi, 3) / 32;
        var numCb = 21 * Math.pow(numEi, 2) / 16 - 55 * Math.pow(numEi, 4) / 32;
        var numCc = 151 * Math.pow(numEi, 3) / 96;
        var numCd = 1097 * Math.pow(numEi, 4) / 512;
        var numPhi1 = numMu + numCa * Math.sin(2 * numMu) + numCb * Math.sin(4 * numMu) + numCc * Math.sin(6 * numMu) + numCd * Math.sin(8 * numMu);

        var numN0 = numA / Math.pow((1 - Math.pow((numE * Math.sin(numPhi1)), 2)), (1 / 2.0));

        var numR0 = numA * (1 - numE * numE) / Math.pow((1 - Math.pow((numE * Math.sin(numPhi1)), 2)), (3 / 2.0));
        var numFact1 = numN0 * Math.tan(numPhi1) / numR0;

        var num_a1 = 500000 - numEasting;
        var numDd0 = num_a1 / (numN0 * numK0);
        var numFact2 = numDd0 * numDd0 / 2;

        var numT0 = Math.pow(Math.tan(numPhi1), 2);
        var numQ0 = numE1sq * Math.pow(Math.cos(numPhi1), 2);
        var numFact3 = (5 + 3 * numT0 + 10 * numQ0 - 4 * numQ0 * numQ0 - 9 * numE1sq) * Math.pow(numDd0, 4) / 24;
        var numFact4 = (61 + 90 * numT0 + 298 * numQ0 + 45 * numT0 * numT0 - 252 * numE1sq - 3 * numQ0 * numQ0) * Math.pow(numDd0, 6) / 720;

        var numLof1 = num_a1 / (numN0 * numK0);
        var numLof2 = (1 + 2 * numT0 + numQ0) * Math.pow(numDd0, 3) / 6.0;
        var numLof3 = (5 - 2 * numQ0 + 28 * numT0 - 3 * Math.pow(numQ0, 2) + 8 * numE1sq + 24 * Math.pow(numT0, 2)) * Math.pow(numDd0, 5) / 120;
        var num_a2 = (numLof1 - numLof2 + numLof3) / Math.cos(numPhi1);
        var num_a3 = num_a2 * 180 / Math.PI;

        var numLatitude = 180 * (numPhi1 - numFact1 * (numFact2 + numFact3 + numFact4)) / Math.PI;

        if (!blNorthernHemisphere)
        {
            numLatitude = -numLatitude;
        }

        var numLongitude = ((numZone > 0) && (6 * numZone - 183) || 3) - num_a3;

        return numLatitude.toString() + "," + numLongitude.toString();
        // } // End try
        //  catch (e) {
        //trace(e.getStackTrace());
        //  }

        //  return "";
    } // End utmToLatLong


}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2011            */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var p1 = new LatLon(51.5136, -0.0983);                                                      */
/*    var p2 = new LatLon(51.4778, -0.0015);                                                      */
/*    var dist = p1.distanceTo(p2);          // in km                                             */
/*    var brng = p1.bearingTo(p2);           // in degrees clockwise from north                   */
/*    ... etc                                                                                     */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Note that minimal error checking is performed in this example code!                           */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Creates a point on the earth's surface at the supplied latitude / longitude
 *
 * @constructor
 * @param {Number} lat: latitude in numeric degrees
 * @param {Number} lon: longitude in numeric degrees
 * @param {Number} [rad=6371]: radius of earth if different value is required from standard 6,371km
 */

function LatLon(lat, lon, rad)
{
    if (typeof (rad) == 'undefined')

        rad = 6371; // earth's mean radius in km
    // only accept numbers or valid numeric strings
    this._lat = typeof (lat) == 'number' ? lat : typeof (lat) == 'string' && lat.trim() != '' ? +lat : NaN;
    this._lon = typeof (lon) == 'number' ? lon : typeof (lon) == 'string' && lon.trim() != '' ? +lon : NaN;
    this._radius = typeof (rad) == 'number' ? rad : typeof (rad) == 'string' && trim(lon) != '' ? +rad : NaN;
}


/**
 * Returns the distance from this point to the supplied point, in km
 * (using Haversine formula)
 *
 * from: Haversine formula - R. W. Sinnott, "Virtues of the Haversine",
 *       Sky and Telescope, vol 68, no 2, 1984
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @param   {Number} [precision=4]: no of significant digits to use for returned value
 * @returns {Number} Distance in km between this point and destination point
 */
LatLon.prototype.distanceTo = function (point, precision)
{
    // default 4 sig figs reflects typical 0.3% accuracy of spherical model
    if (typeof precision == 'undefined')

        precision = 4;

    var R = this._radius;
    var lat1 = this._lat.toRad(),
            lon1 = this._lon.toRad();
    var lat2 = point._lat.toRad(),
            lon2 = point._lon.toRad();
    if (lat1 === lat2 && lon1 === lon2)
    {
        return 0;
    }
    var dLat = lat2 - lat1;
    var dLon = lon2 - lon1;

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    //return d.toPrecisionFixed(precision);
    return d.toPrecisionFixed(precision)*1 ;// meters
}


/**
 * Returns the (initial) bearing from this point to the supplied point, in degrees
 *   see http://williams.best.vwh.net/avform.htm#Crs
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Initial bearing in degrees from North
 */
LatLon.prototype.bearingTo = function (point)
{
    var lat1 = this._lat.toRad(),
            lat2 = point._lat.toRad();
    var dLon = (point._lon - this._lon).toRad();

    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    var brng = Math.atan2(y, x);

    return (brng.toDeg() + 360) % 360;
}


/**
 * Returns final bearing arriving at supplied destination point from this point; the final bearing
 * will differ from the initial bearing by varying degrees according to distance and latitude
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Final bearing in degrees from North
 */
LatLon.prototype.finalBearingTo = function (point)
{
    // get initial bearing from supplied point back to this point...
    var lat1 = point._lat.toRad(),
            lat2 = this._lat.toRad();
    var dLon = (this._lon - point._lon).toRad();

    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    var brng = Math.atan2(y, x);

    // ... & reverse it by adding 180°
    return (brng.toDeg() + 180) % 360;
}


/**
 * Returns the midpoint between this point and the supplied point.
 *   see http://mathforum.org/library/drmath/view/51822.html for derivation
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {LatLon} Midpoint between this point and the supplied point
 */
LatLon.prototype.midpointTo = function (point)
{
    lat1 = this._lat.toRad(), lon1 = this._lon.toRad();
    lat2 = point._lat.toRad();
    var dLon = (point._lon - this._lon).toRad();

    var Bx = Math.cos(lat2) * Math.cos(dLon);
    var By = Math.cos(lat2) * Math.sin(dLon);

    lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
            Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
    lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);
    lon3 = (lon3 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(lat3.toDeg(), lon3.toDeg());
}


/**
 * Returns the destination point from this point having travelled the given distance (in km) on the
 * given initial bearing (bearing may vary before destination is reached)
 *
 *   see http://williams.best.vwh.net/avform.htm#LL
 *
 * @param   {Number} brng: Initial bearing in degrees
 * @param   {Number} dist: Distance in km
 * @returns {LatLon} Destination point
 */
LatLon.prototype.destinationPoint = function (brng, dist)
{
    dist = typeof (dist) == 'number' ? dist : typeof (dist) == 'string' && dist.trim() != '' ? +dist : NaN;
    dist = dist / this._radius; // convert dist to angular distance in radians
    brng = brng.toRad(); //
    var lat1 = this._lat.toRad(),
            lon1 = this._lon.toRad();

    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
            Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));
    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) * Math.cos(lat1),
            Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2));
    lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(lat2.toDeg(), lon2.toDeg());
}


/**
 * Returns the point of intersection of two paths defined by point and bearing
 *
 *   see http://williams.best.vwh.net/avform.htm#Intersection
 *
 * @param   {LatLon} p1: First point
 * @param   {Number} brng1: Initial bearing from first point
 * @param   {LatLon} p2: Second point
 * @param   {Number} brng2: Initial bearing from second point
 * @returns {LatLon} Destination point (null if no unique intersection defined)
 */
LatLon.intersection = function (p1, brng1, p2, brng2)
{
    brng1 = typeof brng1 == 'number' ? brng1 : typeof brng1 == 'string' && trim(brng1) != '' ? +brng1 : NaN;
    brng2 = typeof brng2 == 'number' ? brng2 : typeof brng2 == 'string' && trim(brng2) != '' ? +brng2 : NaN;
    lat1 = p1._lat.toRad(), lon1 = p1._lon.toRad();
    lat2 = p2._lat.toRad(), lon2 = p2._lon.toRad();
    brng13 = brng1.toRad(), brng23 = brng2.toRad();
    dLat = lat2 - lat1, dLon = lon2 - lon1;

    dist12 = 2 * Math.asin(Math.sqrt(Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)));
    if (dist12 == 0)

        return null;

    // initial/final bearings between points
    brngA = Math.acos((Math.sin(lat2) - Math.sin(lat1) * Math.cos(dist12)) /
            (Math.sin(dist12) * Math.cos(lat1)));
    if (isNaN(brngA))

        brngA = 0; // protect against rounding
    brngB = Math.acos((Math.sin(lat1) - Math.sin(lat2) * Math.cos(dist12)) /
            (Math.sin(dist12) * Math.cos(lat2)));

    if (Math.sin(lon2 - lon1) > 0)
    {
        brng12 = brngA;
        brng21 = 2 * Math.PI - brngB;
    }
    else
    {
        brng12 = 2 * Math.PI - brngA;
        brng21 = brngB;
    }

    alpha1 = (brng13 - brng12 + Math.PI) % (2 * Math.PI) - Math.PI; // angle 2-1-3
    alpha2 = (brng21 - brng23 + Math.PI) % (2 * Math.PI) - Math.PI; // angle 1-2-3

    if (Math.sin(alpha1) == 0 && Math.sin(alpha2) == 0)

        return null; // infinite intersections
    if (Math.sin(alpha1) * Math.sin(alpha2) < 0)

        return null; // ambiguous intersection

    //alpha1 = Math.abs(alpha1);
    //alpha2 = Math.abs(alpha2);
    // ... Ed Williams takes abs of alpha1/alpha2, but seems to break calculation?

    alpha3 = Math.acos(-Math.cos(alpha1) * Math.cos(alpha2) +
            Math.sin(alpha1) * Math.sin(alpha2) * Math.cos(dist12));
    dist13 = Math.atan2(Math.sin(dist12) * Math.sin(alpha1) * Math.sin(alpha2),
            Math.cos(alpha2) + Math.cos(alpha1) * Math.cos(alpha3))
    lat3 = Math.asin(Math.sin(lat1) * Math.cos(dist13) +
            Math.cos(lat1) * Math.sin(dist13) * Math.cos(brng13));
    dLon13 = Math.atan2(Math.sin(brng13) * Math.sin(dist13) * Math.cos(lat1),
            Math.cos(dist13) - Math.sin(lat1) * Math.sin(lat3));
    lon3 = lon1 + dLon13;
    lon3 = (lon3 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(lat3.toDeg(), lon3.toDeg());
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Returns the distance from this point to the supplied point, in km, travelling along a rhumb line
 *
 *   see http://williams.best.vwh.net/avform.htm#Rhumb
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Distance in km between this point and destination point
 */
LatLon.prototype.rhumbDistanceTo = function (point)
{
    var R = this._radius;
    var lat1 = this._lat.toRad(),
            lat2 = point._lat.toRad();
    var dLat = (point._lat - this._lat).toRad();
    var dLon = Math.abs(point._lon - this._lon).toRad();

    var dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
    // var q = (!isNaN(dLat / dPhi)) ? dLat / dPhi : Math.cos(lat1); // E-W line gives dPhi=0
    var q = (!isNaN(dLat / dPhi) && (dPhi !== 0)) ? dLat / dPhi : Math.cos(lat1); // E-W line gives dPhi=0 // ish fix
    // if dLon over 180° take shorter rhumb across 180° meridian:
    if (dLon > Math.PI)

        dLon = 2 * Math.PI - dLon;
    var dist = Math.sqrt(dLat * dLat + q * q * dLon * dLon) * R;

    return dist.toPrecisionFixed(4); // 4 sig figs reflects typical 0.3% accuracy of spherical model
}

/**
 * Returns the bearing from this point to the supplied point along a rhumb line, in degrees
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Bearing in degrees from North
 */
LatLon.prototype.rhumbBearingTo = function (point)
{
    var lat1 = this._lat.toRad(),
            lat2 = point._lat.toRad();
    var dLon = (point._lon - this._lon).toRad();

    var dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
    if (Math.abs(dLon) > Math.PI)

        dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);
    var brng = Math.atan2(dLon, dPhi);

    return (brng.toDeg() + 360) % 360;
}

/**
 * Returns the destination point from this point having travelled the given distance (in km) on the
 * given bearing along a rhumb line
 *
 * @param   {Number} brng: Bearing in degrees from North
 * @param   {Number} dist: Distance in km
 * @returns {LatLon} Destination point
 */
LatLon.prototype.rhumbDestinationPoint = function (brng, dist)
{
    var R = this._radius;
    var d = parseFloat(dist) / R; // d = angular distance covered on earth's surface
    var lat1 = this._lat.toRad(),
            lon1 = this._lon.toRad();
    brng = brng.toRad();

    var lat2 = lat1 + d * Math.cos(brng);
    var dLat = lat2 - lat1;
    var dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
    var q = (!isNaN(dLat / dPhi)) ? dLat / dPhi : Math.cos(lat1); // E-W line gives dPhi=0
    var dLon = d * Math.sin(brng) / q;
    // check for some daft bugger going past the pole
    if (Math.abs(lat2) > Math.PI / 2)

        lat2 = lat2 > 0 ? Math.PI - lat2 : -(Math.PI - lat2);
    lon2 = (lon1 + dLon + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

    return new LatLon(lat2.toDeg(), lon2.toDeg());
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Returns the latitude of this point; signed numeric degrees if no format, otherwise format & dp
 * as per Geo.toLat()
 *
 * @param   {String} [format]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to display
 * @returns {Number|String} Numeric degrees if no format specified, otherwise deg/min/sec
 *
 * @requires Geo
 */
LatLon.prototype.lat = function (format, dp)
{
    if (typeof format == 'undefined')

        return this._lat;

    return Geo.toLat(this._lat, format, dp);
}

/**
 * Returns the longitude of this point; signed numeric degrees if no format, otherwise format & dp
 * as per Geo.toLon()
 *
 * @param   {String} [format]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to display
 * @returns {Number|String} Numeric degrees if no format specified, otherwise deg/min/sec
 *
 * @requires Geo
 */
LatLon.prototype.lon = function (format, dp)
{
    if (typeof format == 'undefined')

        return this._lon;

    return Geo.toLon(this._lon, format, dp);
}

/**
 * Returns a string representation of this point; format and dp as per lat()/lon()
 *
 * @param   {String} [format]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to display
 * @returns {String} Comma-separated latitude/longitude
 *
 * @requires Geo
 */
LatLon.prototype.toString = function (format, dp)
{
    if (typeof format == 'undefined')

        format = 'dms';

    if (isNaN(this._lat) || isNaN(this._lon))

        return '-,-';

    return Geo.toLat(this._lat, format, dp) + ', ' + Geo.toLon(this._lon, format, dp);
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

// ---- extend Number object with methods for converting degrees/radians

/** Converts numeric degrees to radians */
if (typeof (Number.prototype.toRad) === "undefined")
{
    Number.prototype.toRad = function ()
    {
        return this * Math.PI / 180;
    }
}

/** Converts radians to numeric (signed) degrees */
if (typeof (Number.prototype.toDeg) === "undefined")
{
    Number.prototype.toDeg = function ()
    {
        return this * 180 / Math.PI;
    }
}

/** Converts radians to numeric (signed) degrees */
if (typeof (Number.prototype.toMilsFromDeg) === "undefined")
{
    Number.prototype.toMilsFromDeg = function ()
    {
        return this * 17.7777777778;
    }
}

/** Converts radians to numeric (signed) degrees */
if (typeof (Number.prototype.toMilsFromRad) === "undefined")
{
    Number.prototype.toMilsFromRad = function ()
    {
        return this.toDeg() * 17.7777777778;
    }
}

/** Converts radians to numeric (signed) degrees */
if (typeof (Number.prototype.toDegFromMils) === "undefined")
{
    Number.prototype.toDegFromMils = function ()
    {
        return this / 17.7777777778;
    }
}

/**
 * Formats the significant digits of a number, using only fixed-point notation (no exponential)
 *
 * @param   {Number} precision: Number of significant digits to appear in the returned string
 * @returns {String} A string representation of number which contains precision significant digits
 */
if (typeof (Number.prototype.toPrecisionFixed) === "undefined")
{
    Number.prototype.toPrecisionFixed = function (precision)
    {
        if (isNaN(this))

            return 'NaN';
        var numb = this < 0 ? -this : this; // can't take log of -ve number...
        var sign = this < 0 ? '-' : '';

        if (numb == 0)
        { // can't take log of zero, just format with precision zeros
            var n = '0.';
            while (precision--)

                n += '0';
            return n
        }

        var scale = Math.ceil(Math.log(numb) * Math.LOG10E); // no of digits before decimal
        var n = String(Math.round(numb * Math.pow(10, precision - scale)));
        if (scale > 0)
        { // add trailing zeros & insert decimal as required
            l = scale - n.length;
            while (l-- > 0)

                n = n + '0';
            if (scale < n.length)

                n = n.slice(0, scale) + '.' + n.slice(scale);
        }
        else
        { // prefix decimal and leading zeros if required
            while (scale++ < 0)

                n = '0' + n;
            n = '0.' + n;
        }
        return sign + n;
    }
}

/** Trims whitespace from string (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof (String.prototype.trim) === "undefined")
{
    String.prototype.trim = function ()
    {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
