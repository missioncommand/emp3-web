///////////////////////////////////////////////////////////////////////////////
// AIRSPACE_TYPE.js
//
// Copyright (c) 2012-2013 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////

var ENUM_BASE = Class({
    constructor: function (args)
    {
        lang.mixin(this, args);
    },
//        values : ['REFPT', 'ATC', 'OTHER', 'ADOA', 'ADAREA', 'CORRTE', 'SUA', 'ROZ', 'PROC'],
//
    TESTING: {
        StrValue: '5',
        Name: 'REFPT',
        Value: 5,
        Dsc: 'Reference Point',
        Abbr: 'REFPT',
        Sdsc: 'REFPT'
    }
});

//    return new Enum();
//    return  new Enum();

