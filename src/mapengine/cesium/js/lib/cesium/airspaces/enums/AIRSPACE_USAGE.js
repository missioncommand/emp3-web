///////////////////////////////////////////////////////////////////////////////
// AIRSPACE_USAGE.js
//
// Copyright (c) 2012-2013 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////
var AIRSPACE_USAGE =   {

        //values : ['ADIZ', 'ALTRV', 'IFFOFF', 'LZ', 'AAR', 'EC', 'FACA', 'PIRAZ', 'DZ', 'MG', 'CFL', 'TRSA', 'WFZ', 'ROA', 'NFA', 'ARWY', 'TCA', 'FRAD', 'FIR', 'HIDACZ', 'COZ', 'APPCOR', 'NOFLY', 'RFA', 'MOA', 'EG', 'RFL', 'LFEZ', 'TMRR', 'CADA', 'CDR', 'JOA', 'BDZ', 'MFEZ', 'LOMEZ', 'CONTZN', 'PROHIB', 'ACP', 'CLSE', 'CLSD', 'HG', 'CLSC', 'FLOT', 'CLSB', 'CLSG', 'TSA', 'CLSF', 'ADAA', 'CLSA', 'NONE', 'ACA', 'SSMS', 'ABC', 'ADVRTE', 'FFA', 'ALERTA', 'FEBA', 'MISARC', 'AIRRTE', 'ISR', 'ISP', 'AEW', 'BNDRY', 'FOL', 'AIRCOR', 'CAS', 'RCA', 'RA', 'WARN', 'IFFON', 'SCZ', 'CAP', 'UAV', 'NAVRTE', 'ADZ', 'FARP', 'JEZ', 'CTA', 'ASCA', 'CCZONE', 'MRR', 'PZ', 'MMEZ', 'HIMEZ', 'RECCE', 'TL', 'BZ', 'TR', 'RTF', 'FIRUB', 'SAFE', 'SEMA', 'DBSL', 'LMEZ', 'TC', 'SAFES', 'SAAFR', 'SC', 'KILLB', 'SARDOT', 'CBA', 'SL', 'DA', 'SOF', 'TRNG', 'ACSS', 'BULL', 'AOA', 'ATSRTE', 'CP', 'FSCL', 'SHORAD', 'CL'],

        ADIZ: {
            StrValue: '0',
            Name: 'ADIZ',
            Value: 0,
            isDefault: 0,
            Type: 'ADAREA',
            Dsc: 'Airspace within which ready identification, location, and control of airborne vehicles are required',
            Abbr: 'ADIZ',
            Sdsc: 'AD ID Zone'
        },

        ALTRV: {
            StrValue: '401',
            Name: 'ALTRV',
            Value: 401,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'Block of altitude reserved for aircraft to transit or loiter',
            Abbr: 'ALTRV',
            Sdsc: 'Alt Reservations'
        },

        IFFOFF: {
            StrValue: '410',
            Name: 'IFFOFF',
            Value: 410,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'Line demarking where friendly aircraft stop emitting an IFF signal',
            Abbr: 'IFFOFF',
            Sdsc: 'IFF Off Line'
        },

        LZ: {
            StrValue: '607',
            Name: 'LZ',
            Value: 607,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions which is set aside specifically for airlift landings',
            Abbr: 'LZ',
            Sdsc: 'Landing Zone'
        },

        AAR: {
            StrValue: '600',
            Name: 'AAR',
            Value: 600,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions set aside for aerial refueling operations, excluding SOF AAR missions.',
            Abbr: 'AAR',
            Sdsc: 'AAR Area'
        },

        EC: {
            StrValue: '606',
            Name: 'EC',
            Value: 606,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions established specifically for airborne platforms engaging in electronic combat',
            Abbr: 'EC',
            Sdsc: 'EC'
        },

        FACA: {
            StrValue: '703',
            Name: 'FACA',
            Value: 703,
            isDefault: 0,
            Type: 'SUA',
            Dsc: 'An area surrounding a force within which air coordination measures are required to prevent mutual interference between all friendly surface and air units and their weapon systems',
            Abbr: 'FACA',
            Sdsc: 'Force Air Coord'
        },

        PIRAZ: {
            StrValue: '113',
            Name: 'PIRAZ',
            Value: 113,
            isDefault: 0,
            Type: 'ADOA',
            Dsc: 'An area within which navy ships separate friendly from hostile aircraft',
            Abbr: 'PIRAZ',
            Sdsc: 'PIRAZ'
        },

        DZ: {
            StrValue: '605',
            Name: 'DZ',
            Value: 605,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions which is set aside specifically for airlift drops. This zone can include single or multiple drop sites',
            Abbr: 'DZ',
            Sdsc: 'Drop Zone'
        },

        MG: {
            StrValue: '506',
            Name: 'MG',
            Value: 506,
            isDefault: 0,
            Type: 'REFPT',
            Dsc: 'A point to which aircraft fly for air traffic purposes prior to commencing an outbound transit after takeoff or prior to landing',
            Abbr: 'MG',
            Sdsc: 'Marshalling Gate'
        },

        CFL: {
            StrValue: '403',
            Name: 'CFL',
            Value: 403,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'A line beyond which conventional or improved conventional indirect fire means, such as mortars, field artillery, and naval surface fire may fire without additional coordination',
            Abbr: 'CFL',
            Sdsc: 'Coord Fire Line'
        },

        TRSA: {
            StrValue: '221',
            Name: 'TRSA',
            Value: 221,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'Airspace surrounding designated airports wherein ATC provides radar vectoring, sequencing, and separation on a full-time basis for all IFR and participating VFR aircraft',
            Abbr: 'TRSA',
            Sdsc: 'Term Radar Svc'
        },

        WFZ: {
            StrValue: '11',
            Name: 'WFZ',
            Value: 11,
            isDefault: 0,
            Type: 'ADAREA',
            Dsc: 'An air defense zone (ADZ) established around key assets or facilities that merit special protection by ground based air defense assets, other than airbases, where weapons may be fired at any target not positively identified as friendly',
            Abbr: 'WFZ',
            Sdsc: 'Wpns Free Zone'
        },

        ROA: {
            StrValue: '610',
            Name: 'ROA',
            Value: 610,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace designated by the airspace control authority, in response to specific operational situations/requirements within which the operation of one or more airspace users is restricted',
            Abbr: 'ROA',
            Sdsc: 'ROA'
        },

        NFA: {
            StrValue: '709',
            Name: 'NFA',
            Value: 709,
            isDefault: 1,
            Type: 'SUA',
            Dsc: 'An area in which fires or the effects of fires are not allowed without prior clearance from the established headquarters, except when the commanders force must defend against an engaging enemy force within the no fire area',
            Abbr: 'NFA',
            Sdsc: 'No Fire Area'
        },

        ARWY: {
            StrValue: '201',
            Name: 'ARWY',
            Value: 201,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'A control area or portion thereof established in the form of a corridor equipped with radio navigational aids',
            Abbr: 'ARWY',
            Sdsc: 'Airway'
        },

        TCA: {
            StrValue: '220',
            Name: 'TCA',
            Value: 220,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'A control area normally established at the confluence of air traffic services routes in the vicinity of one or more major aerodromes',
            Abbr: 'TCA',
            Sdsc: 'Terminal Control'
        },

        FRAD: {
            StrValue: '108',
            Name: 'FRAD',
            Value: 108,
            isDefault: 0,
            Type: 'ADOA',
            Dsc: 'Planned magnetic bearings along which aircraft depart and return to ships',
            Abbr: 'FRAD',
            Sdsc: 'Falcon Radials'
        },

        FIR: {
            StrValue: '215',
            Name: 'FIR',
            Value: 215,
            isDefault: 0,
            Type: 'ATC',
            Dsc: 'Airspace of defined dimensions within which flight information service and alerting service is provided on aircraft operating within its boundaries',
            Abbr: 'FIR',
            Sdsc: 'Flight Info Area'
        },

        HIDACZ: {
            StrValue: '3',
            Name: 'HIDACZ',
            Value: 3,
            isDefault: 1,
            Type: 'ADAREA',
            Dsc: 'Airspace of defined dimensions in which there is a concentrated employment of numerous and varied weapons/airspace users',
            Abbr: 'HIDACZ',
            Sdsc: 'HIDACZ'
        },

        COZ: {
            StrValue: '106',
            Name: 'COZ',
            Value: 106,
            isDefault: 0,
            Type: 'ADOA',
            Dsc: 'Airspace beyond the missile engagement zone into which fighters may pursue targets to complete interception',
            Abbr: 'COZ',
            Sdsc: 'Crossover Zone'
        },

        APPCOR: {
            StrValue: '103',
            Name: 'APPCOR',
            Value: 103,
            isDefault: 1,
            Type: 'ADOA',
            Dsc: 'Airspace established for the safe passage of land based aircraft joining or departing a maritime force',
            Abbr: 'APPCOR',
            Sdsc: 'Approach Corr'
        },

        NOFLY: {
            StrValue: '708',
            Name: 'NOFLY',
            Value: 708,
            isDefault: 1,
            Type: 'SUA',
            Dsc: 'Airspace of specific dimensions set aside for a specific purpose in which no aircraft operations are permitted, except as authorized by the appropriate commander and controlling agency',
            Abbr: 'NOFLY',
            Sdsc: 'No Fly Area'
        },

        RFA: {
            StrValue: '412',
            Name: 'RFA',
            Value: 412,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'An area into which specific restrictions are imposed and into which fires that exceed those restrictions are prohibited without prior coordination',
            Abbr: 'RFA',
            Sdsc: 'RFA'
        },

        MOA: {
            StrValue: '707',
            Name: 'MOA',
            Value: 707,
            isDefault: 1,
            Type: 'SUA',
            Dsc: 'Airspace established outside class A airspace area to separate or segregate certain non-hazardous military activities from IFR traffic and to identify for VFR traffic where these activities are conducted.',
            Abbr: 'MOA',
            Sdsc: 'Mil Ops Area'
        },

        EG: {
            StrValue: '503',
            Name: 'EG',
            Value: 503,
            isDefault: 0,
            Type: 'REFPT',
            Dsc: 'The point to which an aircraft will be directed to commence the transit inbound/outbound from an airfield or force at sea',
            Abbr: 'EG',
            Sdsc: 'Entry/Exit Gate'
        },

        RFL: {
            StrValue: '413',
            Name: 'RFL',
            Value: 413,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'A line established between converging forces that prohibits fires or the effects of fires across the line without prior coordination',
            Abbr: 'RFL',
            Sdsc: 'RFL'
        },

        LFEZ: {
            StrValue: '7',
            Name: 'LFEZ',
            Value: 7,
            isDefault: 0,
            Type: 'ADAREA',
            Dsc: 'Airspace of defined dimensions within which the responsibility for engagement of air threats normally rests with a fighter aircraft',
            Abbr: 'LFEZ',
            Sdsc: 'LFEZ'
        },

        TMRR: {
            StrValue: '307',
            Name: 'TMRR',
            Value: 307,
            isDefault: 1,
            Type: 'CORRTE',
            Dsc: 'A temporary route of defined dimensions recommended for use by high speed fixed-wing aircraft to route them between transit routes or the rear of the forward area and their operations areas.',
            Abbr: 'TMRR',
            Sdsc: 'TMRR'
        },

        CADA: {
            StrValue: '104',
            Name: 'CADA',
            Value: 104,
            isDefault: 1,
            Type: 'ADOA',
            Dsc: 'A mutually defined block of airspace between land-based air commander and a naval commander when their forces are operating in close proximity to one another',
            Abbr: 'CADA',
            Sdsc: 'Coord AD Area'
        },

        CDR: {
            StrValue: '204',
            Name: 'CDR',
            Value: 204,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'A non-permanent air traffic service route or portion thereof which can be planned and used only under certain conditions',
            Abbr: 'CDR',
            Sdsc: 'Cond Route'
        },

        JOA: {
            StrValue: '6',
            Name: 'JOA',
            Value: 6,
            isDefault: 0,
            Type: 'ADAREA',
            Dsc: 'Area of land, sea, and airspace, defined by a geographic combatant commander or subordinate unified commander, in which a joint force commander (normally a joint task force commander) conducts military operations to accomplish a specific mission',
            Abbr: 'JOA',
            Sdsc: 'Joint Ops Area'
        },

        BDZ: {
            StrValue: '1',
            Name: 'BDZ',
            Value: 1,
            isDefault: 1,
            Type: 'ADAREA',
            Dsc: 'A zone established around airbases to enhance the effectiveness of local ground based air defense systems',
            Abbr: 'BDZ',
            Sdsc: 'Base Def Zone'
        },

        MFEZ: {
            StrValue: '110',
            Name: 'MFEZ',
            Value: 110,
            isDefault: 0,
            Type: 'ADOA',
            Dsc: 'The airspace beyond the crossover zone out to limits defined by the officer in tactical command, in which fighters have freedom of action to identify and engage air targets',
            Abbr: 'MFEZ',
            Sdsc: 'MFEZ'
        },

        LOMEZ: {
            StrValue: '9',
            Name: 'LOMEZ',
            Value: 9,
            isDefault: 0,
            Type: 'ADAREA',
            Dsc: 'Airspace within which the responsibility for engagement normally rests with low-to-medium surface-to-air missiles',
            Abbr: 'LOMEZ',
            Sdsc: 'LOMEZ'
        },

        CONTZN: {
            StrValue: '212',
            Name: 'CONTZN',
            Value: 212,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'A controlled airspace extending upwards from the surface of the earth to a specified upper limit',
            Abbr: 'CONTZN',
            Sdsc: 'Control Zone'
        },

        PROHIB: {
            StrValue: '217',
            Name: 'PROHIB',
            Value: 217,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'An airspace of defined dimensions, above the land areas or territorial waters of a state within which the flight of aircraft is prohibited',
            Abbr: 'PROHIB',
            Sdsc: 'Prohibited Area'
        },

        ACP: {
            StrValue: '500',
            Name: 'ACP',
            Value: 500,
            isDefault: 0,
            Type: 'REFPT',
            Dsc: 'A point defined by latitude and longitude used for navigation, command and control, and communication. A series or matrices of points may be used to designate a route structure such as spider routes (search and rescue routes) or minimum risk routes.',
            Abbr: 'ACP',
            Sdsc: 'Air Ctrl Point'
        },

        CLSE: {
            StrValue: '209',
            Name: 'CLSE',
            Value: 209,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'Generally, if the airspace is not class A, B, C, or D and it is controlled airspace, it is class E airspace. Also includes federal airways',
            Abbr: 'CLSE',
            Sdsc: 'Class-E Airspace'
        },

        CLSD: {
            StrValue: '208',
            Name: 'CLSD',
            Value: 208,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'Generally, airspace from the surface to 2,500 feet above the airport elevation (charted in MSL) surrounding those airports that have an operational control tower. The configuration of each class D airspace area is individually tailored and when instrument procedures are published. Formerly called ATA',
            Abbr: 'CLSD',
            Sdsc: 'Class-D Airspace'
        },

        HG: {
            StrValue: '504',
            Name: 'HG',
            Value: 504,
            isDefault: 0,
            Type: 'REFPT',
            Dsc: 'A point at which the control of the aircraft, if radar hand over is used, changes from one controller to another',
            Abbr: 'HG',
            Sdsc: 'Hand Over Gate'
        },

        CLSC: {
            StrValue: '207',
            Name: 'CLSC',
            Value: 207,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'Generally, airspace from the surface to 4,000 feet above the airport elevation (charted in MSL) surrounding those airports that have an operational control tower, are serviced by radar approach control, and that have a certain number of IFR operations or passenger enplanements. Formerly called ASRA',
            Abbr: 'CLSC',
            Sdsc: 'Class-C Airspace'
        },

        FLOT: {
            StrValue: '408',
            Name: 'FLOT',
            Value: 408,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'Line which indicates the most forward positions of friendly forces in any kind of military operation at a specific time. The FLOT normally identifies the forward location covering screening forces',
            Abbr: 'FLOT',
            Sdsc: 'FLOT'
        },

        CLSB: {
            StrValue: '206',
            Name: 'CLSB',
            Value: 206,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'Generally, airspace from the surface to 10,000 feet AMSL surrounding the nations busiest airports in terms of airport operations or passenger enplanements. Formerly called TCA',
            Abbr: 'CLSB',
            Sdsc: 'Class-B Airspace'
        },

        CLSG: {
            StrValue: '211',
            Name: 'CLSG',
            Value: 211,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'An airspace in which instrument flight rule and visual flight rule flights are permitted, all flights receive flight information service if requested',
            Abbr: 'CLSG',
            Sdsc: 'Class-G Airspace'
        },

        TSA: {
            StrValue: '222',
            Name: 'TSA',
            Value: 222,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'An airspace of defined dimensions within which activities require the reservation of airspace for the exclusive use of specific users during a determined period of time',
            Abbr: 'TSA',
            Sdsc: 'TSA'
        },

        CLSF: {
            StrValue: '210',
            Name: 'CLSF',
            Value: 210,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'An airspace in which instrument flight rule and visual flight rule flights are permitted, all participating instrument flight rule flights receive an air traffic advisory service and all flights receive flight information service if requested',
            Abbr: 'CLSF',
            Sdsc: 'Class-F Airspace'
        },

        ADAA: {
            StrValue: '100',
            Name: 'ADAA',
            Value: 100,
            isDefault: 0,
            Type: 'ADOA',
            Dsc: 'An air defense operations area and the airspace above it where air defense procedures are specified',
            Abbr: 'ADAA',
            Sdsc: 'AD Action Area'
        },

        CLSA: {
            StrValue: '205',
            Name: 'CLSA',
            Value: 205,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'Generally, airspace from 18,000 feet AMSL up to and including FL600, including airspace overlying the waters within 12 nautical miles of the contiguous states and Alaska. Formerly called PCA',
            Abbr: 'CLSA',
            Sdsc: 'Class-A Airspace'
        },

        NONE: {
            StrValue: '800',
            Name: 'None',
            Value: 800,
            isDefault: 1,
            Type: 'OTHER',
            Dsc: 'None',
            Abbr: 'None',
            Sdsc: 'None'
        },

        ACA: {
            StrValue: '400',
            Name: 'ACA',
            Value: 400,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'A three-dimensional block of airspace used as a restricted fire support coordination measure',
            Abbr: 'ACA',
            Sdsc: 'ACA'
        },

        SSMS: {
            StrValue: '710',
            Name: 'SSMS',
            Value: 710,
            isDefault: 1,
            Type: 'SUA',
            Dsc: 'Airspace of defined dimensions designed specifically for army tactical missile system (ATACMS) and tomahawk land attack missile (TLAM) launch and impact points.',
            Abbr: 'SSMS',
            Sdsc: 'SSM System'
        },

        ABC: {
            StrValue: '601',
            Name: 'ABC',
            Value: 601,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions established specifically for airborne platforms conducting battlefield command and control.',
            Abbr: 'ABC',
            Sdsc: 'Airborne C2 Area'
        },

        ADVRTE: {
            StrValue: '200',
            Name: 'ADVRTE',
            Value: 200,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'A designated route along which air traffic advisory service is available',
            Abbr: 'ADVRTE',
            Sdsc: 'Advisory Route'
        },

        FFA: {
            StrValue: '407',
            Name: 'FFA',
            Value: 407,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'An area into which any weapon system may fire without additional coordination with the establishing headquarters. Normally, it is established on identifiable terrain by division or higher headquarters',
            Abbr: 'FFA',
            Sdsc: 'Free Fire Area'
        },

        ALERTA: {
            StrValue: '701',
            Name: 'ALERTA',
            Value: 701,
            isDefault: 1,
            Type: 'SUA',
            Dsc: 'Airspace which may contain a high volume of pilot training activities or an unusual type of aerial activity, neither of which is hazardous to aircraft',
            Abbr: 'ALERTA',
            Sdsc: 'Alert Area'
        },

        FEBA: {
            StrValue: '406',
            Name: 'FEBA',
            Value: 406,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'The foremost limits of a series of areas in which ground combat units are deployed, excluding the areas in which the covering or screening forces are operating, designated to coordinate fire support, the positioning of forces, or the maneuver of units',
            Abbr: 'FEBA',
            Sdsc: 'FEBA'
        },

        MISARC: {
            StrValue: '111',
            Name: 'MISARC',
            Value: 111,
            isDefault: 1,
            Type: 'ADOA',
            Dsc: 'An area of 10-degrees or as large as ordered by the officer in tactical command, centered on the bearing of the target with a range that extends to the maximum range of the surface-to-air missile',
            Abbr: 'MISARC',
            Sdsc: 'Missile Arc'
        },

        AIRRTE: {
            StrValue: '301',
            Name: 'AIRRTE',
            Value: 301,
            isDefault: 1,
            Type: 'CORRTE',
            Dsc: 'Established to route non-operational and operational support traffic through air defenses in the rear area.',
            Abbr: 'AIRRTE',
            Sdsc: 'Air Route'
        },

        ISR: {
            StrValue: '109',
            Name: 'ISR',
            Value: 109,
            isDefault: 0,
            Type: 'ADOA',
            Dsc: 'Minimum range to which an aircraft may close to a maritime force without having been positively identified as friendly',
            Abbr: 'ISR',
            Sdsc: 'ID Safety Range'
        },

        ISP: {
            StrValue: '505',
            Name: 'ISP',
            Value: 505,
            isDefault: 0,
            Type: 'REFPT',
            Dsc: 'A point at which aircraft, on joining a maritime force, will attempt to establish two-way communications with the surface force and commence identification procedures.',
            Abbr: 'ISP',
            Sdsc: 'ID Safety Point'
        },

        AEW: {
            StrValue: '602',
            Name: 'AEW',
            Value: 602,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions established specifically for airborne platforms conducting airborne early warning. Generally, it is designed for aircraft such as AWACS, E2C.',
            Abbr: 'AEW',
            Sdsc: 'Abn Early Warn'
        },

        BNDRY: {
            StrValue: '402',
            Name: 'BNDRY',
            Value: 402,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'A line by which areas of responsibility (AOR) between adjacent units and/or formations are defined',
            Abbr: 'BNDRY',
            Sdsc: 'boundary'
        },

        FOL: {
            StrValue: '705',
            Name: 'FOL',
            Value: 705,
            isDefault: 1,
            Type: 'SUA',
            Dsc: 'An advance position, usually of a temporary nature, from which air or ground units operate.',
            Abbr: 'FOL',
            Sdsc: 'Fwd Ops Location'
        },

        AIRCOR: {
            StrValue: '300',
            Name: 'AIRCOR',
            Value: 300,
            isDefault: 1,
            Type: 'CORRTE',
            Dsc: 'A restricted air route to travel, specified for use by friendly aircraft to prevent fratricide',
            Abbr: 'AIRCOR',
            Sdsc: 'Air Corridor'
        },

        CAS: {
            StrValue: '604',
            Name: 'CAS',
            Value: 604,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace designed for holding orbit and used by rotary and fixed-winged aircraft which are in close proximity to friendly forces',
            Abbr: 'CAS',
            Sdsc: 'CAS'
        },

        RCA: {
            StrValue: '219',
            Name: 'RCA',
            Value: 219,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'A portion of defined dimensions within which general air traffic (GAT) is permitted off-route without requiring GAT controllers to initiate coordination with operational air traffic (OAT) controllers',
            Abbr: 'RCA',
            Sdsc: 'Reduced Coord'
        },

        RA: {
            StrValue: '218',
            Name: 'RA',
            Value: 218,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'An airspace of defined dimensions, above the land areas or territorial waters of a state, within which the flight of aircraft is restricted in accordance with certain specified conditions',
            Abbr: 'RA',
            Sdsc: 'Restricted Area'
        },

        WARN: {
            StrValue: '223',
            Name: 'WARN',
            Value: 223,
            isDefault: 0,
            Type: 'ATC',
            Dsc: 'Airspace of defined dimensions extending from 3 nm outward from the coast of the U.S., that contains activity that may be hazardous to nonparticipating aircraft',
            Abbr: 'WARN',
            Sdsc: 'Warning Area'
        },

        IFFON: {
            StrValue: '411',
            Name: 'IFFON',
            Value: 411,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'Line demarking where friendly aircraft start emitting an IFF signal',
            Abbr: 'IFFON',
            Sdsc: 'IFF On Line'
        },

        SCZ: {
            StrValue: '116',
            Name: 'SCZ',
            Value: 116,
            isDefault: 1,
            Type: 'ADOA',
            Dsc: 'An area activated around a ship operating aircraft, which is not to be entered by friendly aircraft without permission, in order to prevent friendly interference',
            Abbr: 'SCZ',
            Sdsc: 'Ship Ctrl Zone'
        },

        CAP: {
            StrValue: '603',
            Name: 'CAP',
            Value: 603,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'An anti-air warfare activity conducted in support of operations',
            Abbr: 'CAP',
            Sdsc: 'CAP'
        },

        UAV: {
            StrValue: '614',
            Name: 'UAV',
            Value: 614,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions created specifically for UAS operations. Generally, this airspace will consist of the area in which UAV missions conduct their missions, not enroute airspace',
            Abbr: 'UAV',
            Sdsc: 'UAV'
        },

        NAVRTE: {
            StrValue: '216',
            Name: 'NAVRTE',
            Value: 216,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'An air traffic services route established for the use of aircraft capable of employing area navigation',
            Abbr: 'NAVRTE',
            Sdsc: 'Area Nav Route'
        },

        ADZ: {
            StrValue: '101',
            Name: 'ADZ',
            Value: 101,
            isDefault: 0,
            Type: 'ADOA',
            Dsc: 'Area encompassing the amphibious objective area and adjoining airspace as required for the accompanying naval force',
            Abbr: 'ADZ',
            Sdsc: 'Amphib Def Zone'
        },

        FARP: {
            StrValue: '704',
            Name: 'FARP',
            Value: 704,
            isDefault: 1,
            Type: 'SUA',
            Dsc: 'A point designated by a deployed aviation commander that permits combat aircraft to rapidly refuel and rearm simultaneously',
            Abbr: 'FARP',
            Sdsc: 'FARP'
        },

        JEZ: {
            StrValue: '5',
            Name: 'JEZ',
            Value: 5,
            isDefault: 0,
            Type: 'ADAREA',
            Dsc: 'Airspace in which friendly surface-to-air missiles and fighters are simultaneously employed and operated',
            Abbr: 'JEZ',
            Sdsc: 'Joint Engag Zone'
        },

        CTA: {
            StrValue: '213',
            Name: 'CTA',
            Value: 213,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'A controlled airspace extending upwards from a specified limit above the earth',
            Abbr: 'CTA',
            Sdsc: 'Control Area'
        },

        ASCA: {
            StrValue: '702',
            Name: 'ASCA',
            Value: 702,
            isDefault: 0,
            Type: 'SUA',
            Dsc: 'Airspace which is laterally defined by boundaries of the area of operations.',
            Abbr: 'ASCA',
            Sdsc: 'Air Ctrl Area'
        },

        CCZONE: {
            StrValue: '105',
            Name: 'CCZONE',
            Value: 105,
            isDefault: 1,
            Type: 'ADOA',
            Dsc: 'Area around ship operating fixed/rotary wing aircraft',
            Abbr: 'CCZONE',
            Sdsc: 'CCZONE'
        },

        MRR: {
            StrValue: '302',
            Name: 'MRR',
            Value: 302,
            isDefault: 1,
            Type: 'CORRTE',
            Dsc: 'A temporary corridor recommended for use by high-speed, fixed wing aircraft that present the minimum known hazard to low-flying aircraft transiting the combat zone',
            Abbr: 'MRR',
            Sdsc: 'Min Risk Route'
        },

        PZ: {
            StrValue: '608',
            Name: 'PZ',
            Value: 608,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Aerial retrieval area',
            Abbr: 'PZ',
            Sdsc: 'Pickup zone'
        },

        MMEZ: {
            StrValue: '112',
            Name: 'MMEZ',
            Value: 112,
            isDefault: 1,
            Type: 'ADOA',
            Dsc: 'A designated airspace in which, under weapons control status weapons free, ships are automatically cleared to fire at any target which penetrates the zone, unless known to be friendly, adhering to airspace control procedures or unless otherwise directed by the anti-air warfare commander',
            Abbr: 'MMEZ',
            Sdsc: 'MMEZ'
        },

        HIMEZ: {
            StrValue: '4',
            Name: 'HIMEZ',
            Value: 4,
            isDefault: 0,
            Type: 'ADAREA',
            Dsc: 'Airspace within which the responsibility for engagement normally rests with high-altitude air defense surface-to-air missiles',
            Abbr: 'HIMEZ',
            Sdsc: 'HIMEZ'
        },

        RECCE: {
            StrValue: '609',
            Name: 'RECCE',
            Value: 609,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions established specifically for airborne platforms conducting reconnaissance',
            Abbr: 'RECCE',
            Sdsc: 'Recon Area'
        },

        TL: {
            StrValue: '415',
            Name: 'TL',
            Value: 415,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'That vertical displacement above low level air defense systems, expressed both as a height and altitude, at which aircraft can cross that area in order to improve the effectiveness of the air defense systems by providing an extra friendly discriminator',
            Abbr: 'TL',
            Sdsc: 'Traverse Level'
        },

        BZ: {
            StrValue: '2',
            Name: 'BZ',
            Value: 2,
            isDefault: 0,
            Type: 'ADAREA',
            Dsc: 'Airspace designed specifically to provide a buffer between various airspace control measures',
            Abbr: 'BZ',
            Sdsc: 'Buffer Zone'
        },

        TR: {
            StrValue: '308',
            Name: 'TR',
            Value: 308,
            isDefault: 1,
            Type: 'CORRTE',
            Dsc: 'A temporary corridor of defined dimensions established in the forward area to minimize the risk to friendly aircraft from friendly air defenses or surface forces.',
            Abbr: 'TR',
            Sdsc: 'Transit Route'
        },

        RTF: {
            StrValue: '114',
            Name: 'RTF',
            Value: 114,
            isDefault: 1,
            Type: 'ADOA',
            Dsc: 'Planned route profiles for use by friendly aircraft returning to an aircraft-capable ship',
            Abbr: 'RTF',
            Sdsc: 'Return to Force'
        },

        FIRUB: {
            StrValue: '107',
            Name: 'FIRUB',
            Value: 107,
            isDefault: 0,
            Type: 'ADOA',
            Dsc: 'The airspace over a naval force at sea within the fire of ships anti-aircraft weapons can endanger aircraft, and within which special procedures are established for identification and operation of friendly aircraft',
            Abbr: 'FIRUB',
            Sdsc: 'Fire Umbrella'
        },

        SAFE: {
            StrValue: '414',
            Name: 'SAFE',
            Value: 414,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'A designated area in hostile territory that offers the evader or escapee a reasonable chance of avoiding capture and of surviving until he can be evacuated',
            Abbr: 'SAFE',
            Sdsc: 'SAFE'
        },

        SEMA: {
            StrValue: '611',
            Name: 'SEMA',
            Value: 611,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions established specifically for airborne platforms conducting special electronic missions',
            Abbr: 'SEMA',
            Sdsc: 'SEMA'
        },

        DBSL: {
            StrValue: '405',
            Name: 'DBSL',
            Value: 405,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'The forward boundary of the ground component commanders (GCC) area of operation. The DBSL defines the geographic areas of responsibility of the GCC and air component commander',
            Abbr: 'DBSL',
            Sdsc: 'DBSL'
        },

        LMEZ: {
            StrValue: '8',
            Name: 'LMEZ',
            Value: 8,
            isDefault: 0,
            Type: 'ADAREA',
            Dsc: 'Airspace of defined dimensions within which the responsibility for engagement of air threats normally rests with the surface based air defense system',
            Abbr: 'LMEZ',
            Sdsc: 'LMEZ'
        },

        TC: {
            StrValue: '306',
            Name: 'TC',
            Value: 306,
            isDefault: 1,
            Type: 'CORRTE',
            Dsc: 'Bi-directional corridor in the rear area. Air traffic services not normally provided',
            Abbr: 'TC',
            Sdsc: 'Transit Corridor'
        },

        SAFES: {
            StrValue: '115',
            Name: 'SAFES',
            Value: 115,
            isDefault: 1,
            Type: 'ADOA',
            Dsc: 'Established to route friendly aircraft to maritime forces with minimum risk',
            Abbr: 'SAFES',
            Sdsc: 'Safety Sector'
        },

        SAAFR: {
            StrValue: '303',
            Name: 'SAAFR',
            Value: 303,
            isDefault: 1,
            Type: 'CORRTE',
            Dsc: 'Route established below the coordination altitude to facilitate movement of army aviation assets in the forward area in direct support of ground operations',
            Abbr: 'SAAFR',
            Sdsc: 'SAAFR'
        },

        SC: {
            StrValue: '304',
            Name: 'SC',
            Value: 304,
            isDefault: 1,
            Type: 'CORRTE',
            Dsc: 'An area established to accommodate the special routing requirements of specific missions',
            Abbr: 'SC',
            Sdsc: 'Special Corridor'
        },

        KILLB: {
            StrValue: '706',
            Name: 'KILLB',
            Value: 706,
            isDefault: 1,
            Type: 'SUA',
            Dsc: 'A volume of airspace (sanitized airspace), which is prohibited to friendly aircraft and in which any aircraft is automatically declared hostile and subject to engagement',
            Abbr: 'KILLB',
            Sdsc: 'Killbox'
        },

        SARDOT: {
            StrValue: '507',
            Name: 'SARDOT',
            Value: 507,
            isDefault: 0,
            Type: 'REFPT',
            Dsc: 'A reference point used during SAR operations',
            Abbr: 'SARDOT',
            Sdsc: 'SAR Point'
        },

        CBA: {
            StrValue: '203',
            Name: 'CBA',
            Value: 203,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'A temporary segregated area established over international boundaries for specific operational requirements.',
            Abbr: 'CBA',
            Sdsc: 'X-Border Area'
        },

        SL: {
            StrValue: '305',
            Name: 'SL',
            Value: 305,
            isDefault: 1,
            Type: 'CORRTE',
            Dsc: 'A bi-directional lane connecting an airbase, landing site and/or base defense zone to adjacent routes/corridors. Safe lanes may also be used to connect adjacent activated routes/corridors',
            Abbr: 'SL',
            Sdsc: 'Safe Line'
        },

        DA: {
            StrValue: '214',
            Name: 'DA',
            Value: 214,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'An airspace of defined dimensions within which activities dangerous to the flight of aircraft may exist at specified times',
            Abbr: 'DA',
            Sdsc: 'Danger Area'
        },

        SOF: {
            StrValue: '612',
            Name: 'SOF',
            Value: 612,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions created specifically for special operations forces missions by SOF airspace planners.',
            Abbr: 'SOF',
            Sdsc: 'Spec Ops Forces'
        },

        TRNG: {
            StrValue: '613',
            Name: 'TRNG',
            Value: 613,
            isDefault: 1,
            Type: 'ROZ',
            Dsc: 'Airspace of defined dimensions created during contingency for the purpose of training',
            Abbr: 'TRNG',
            Sdsc: 'Training Area'
        },

        ACSS: {
            StrValue: '700',
            Name: 'ACSS',
            Value: 700,
            isDefault: 0,
            Type: 'SUA',
            Dsc: 'Airspace which is laterally defined by boundaries of the area of operations.',
            Abbr: 'ACSS',
            Sdsc: 'ACSS'
        },

        BULL: {
            StrValue: '501',
            Name: 'BULL',
            Value: 501,
            isDefault: 0,
            Type: 'REFPT',
            Dsc: 'A reference point from which bearing and distance are given',
            Abbr: 'BULL',
            Sdsc: 'Bulls-Eye'
        },

        AOA: {
            StrValue: '102',
            Name: 'AOA',
            Value: 102,
            isDefault: 0,
            Type: 'ADOA',
            Dsc: 'Geographic area delineated for the purpose of command and control within which is located the objective(s) to be secured by the amphibious task force',
            Abbr: 'AOA',
            Sdsc: 'Amphib Obj Area'
        },

        ATSRTE: {
            StrValue: '202',
            Name: 'ATSRTE',
            Value: 202,
            isDefault: 1,
            Type: 'ATC',
            Dsc: 'A specified route designed for channeling the flow of traffic as necessary for the provision of air traffic services (ATS)',
            Abbr: 'ATSRTE',
            Sdsc: 'ATS Route'
        },

        CP: {
            StrValue: '502',
            Name: 'CP',
            Value: 502,
            isDefault: 0,
            Type: 'REFPT',
            Dsc: 'A point which is used for control purposes in aerial air refueling and close air support missions',
            Abbr: 'CP',
            Sdsc: 'Contact Point'
        },

        FSCL: {
            StrValue: '409',
            Name: 'FSCL',
            Value: 409,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'Boundary used to coordinate fires of air, ground, or sea weapon systems against surface targets',
            Abbr: 'FSCL',
            Sdsc: 'FSCL'
        },

        SHORAD: {
            StrValue: '10',
            Name: 'SHORAD',
            Value: 10,
            isDefault: 0,
            Type: 'ADAREA',
            Dsc: 'Airspace within which the responsibility for engagement of air-threats normally rests with short-range air defense weapons.',
            Abbr: 'SHORAD',
            Sdsc: 'SHORAD'
        },

        CL: {
            StrValue: '404',
            Name: 'CL',
            Value: 404,
            isDefault: 0,
            Type: 'PROC',
            Dsc: 'A procedural method to separate fixed and rotary wing aircraft by determining an altitude below which fixed wing aircraft normally will not fly',
            Abbr: 'CL',
            Sdsc: 'Coord Level'
        }
    };
