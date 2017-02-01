/*
 * 
 * This file must be loaded directly by the client.
 */
var emp = window.emp || {};
emp.util = emp.util || {};

if (emp.util.config === undefined) {
    /**
     * @memberOf emp.util
     * @static
     * @class This class contains the EMP configuration.
     * @description The configuration object is currently parsed is of type
     * @link emp.util.configType.
     */
    emp.util.config = (function(){
        var empV3Config;
        var getBooleanValue = function(Value, bDefault) {
            var bRet = bDefault;
            var sNotDefaultStringValue = (bDefault === true)? 'false': 'true';

            if (typeof (bDefault) !== 'boolean') {
                throw 'Invalid boolean default value.';
            }

            if (Value === !bDefault) {
                bRet = !bDefault;
            } else if ((typeof (Value) === 'string') && (Value === sNotDefaultStringValue)) {
                bRet = !bDefault;
            }

            return bRet;
        };

        var publicInterface = {
            setConfigObject: function(oConfig) {
                var sTemp;
                var iIndex;
                
                empV3Config = {};
                if (!emp.hasOwnProperty('appSetup')) {
                    emp.appSetup = empV3Config;
                } else {
                    empV3Config = emp.appSetup;
                    
                }
                
                if (oConfig.hasOwnProperty('environment')) {
                    empV3Config['environment'] = oConfig['environment'];
                } else {
                    empV3Config['environment'] = 'browser';
                }

                if (oConfig.hasOwnProperty('debug')) {
                    empV3Config['debug'] = oConfig['debug'];
                } else {
                    empV3Config['debug'] = false;
                }

                if (oConfig.hasOwnProperty('startMapEngineId')) {
                    empV3Config['startMapEngineId'] = oConfig['startMapEngineId'];
                }
/*
                if (oConfig.hasOwnProperty('coreBasePath')) {
                    empV3Config['coreBasePath'] = oConfig['coreBasePath'];
                } else {
                    if (oConfig.hasOwnProperty('scriptPath')) {
                        iIndex = oConfig['scriptPath'].lastIndexOf('/');
                        
                        if (iIndex === -1) {
                            empV3Config['coreBasePath'] = '';
                        } else {
                            sTemp = oConfig['scriptPath'].substr(0, iIndex);
                            iIndex = sTemp.lastIndexOf('/');
                            if (iIndex === -1) {
                                empV3Config['coreBasePath'] = '';
                            } else {
                                empV3Config['coreBasePath'] = sTemp.substr(0, iIndex + 1);
                            }
                        }
                    } else {
                        empV3Config['coreBasePath'] = '/';
                    }
                }
*/
                empV3Config['coreBasePath'] = '/';

                if (oConfig.hasOwnProperty('minScriptPath')) {
                    empV3Config['minScriptPath'] = oConfig['minScriptPath'];
                } else {
                    if (oConfig.hasOwnProperty('distPath')) {
                        empV3Config['minScriptPath'] = oConfig['distPath'];
                    } else {
                        empV3Config['minScriptPath'] = empV3Config['coreBasePath'] + "cpce-map/js";
                    }
                }

                //if (oConfig.hasOwnProperty('urlProxy')) {
                //    empV3Config['urlProxy'] = oConfig['urlProxy'];
                //} else {
                    empV3Config['urlProxy'] =  empV3Config['coreBasePath'] + "cpce-map/urlproxy.jsp";
                //}

                empV3Config['useProxy'] = getBooleanValue(oConfig['useProxy'], true);

                if (oConfig.hasOwnProperty('engineBasePath')) {
                    empV3Config['engineBasePath'] = oConfig['engineBasePath'];
                } else {
                    empV3Config['engineBasePath'] =  "/";
                }
/*
                if (oConfig.hasOwnProperty('mapEngines')) {
                    empV3Config['mapEngines'] = oConfig['mapEngines'];
                } else {
                    throw 'No map engines are defined in the configuration.';
                }
*/
                if (oConfig.hasOwnProperty('wmsServerUrls')) {
                    empV3Config['wmsServerUrls'] = oConfig['wmsServerUrls'];
                } else {
                    empV3Config['wmsServerUrls'] =  [];
                }

                if (oConfig.hasOwnProperty('contextMenus')) {
                    if (typeof (oConfig['contextMenus']) === 'boolean') {
                        empV3Config['contextMenus'] = oConfig['contextMenus'];
                    } else {
                        empV3Config['contextMenus'] =  true;
                    }
                } else {
                    empV3Config['contextMenus'] =  true;
                }

                if (oConfig.hasOwnProperty('autoSelect')) {
                    if (typeof (oConfig['autoSelect']) === 'boolean') {
                        empV3Config['autoSelect'] = oConfig['autoSelect'];
                    } else {
                        empV3Config['autoSelect'] =  true;
                    }
                } else {
                    empV3Config['autoSelect'] =  true;
                }
           },
            /**
             * @description This function return the emp config object.
             * @returns {Object} This function return the emp config object.
             */
            getConfigObject: function() {
                if (empV3Config === undefined) {
                    if (!emp.hasOwnProperty('appSetup')) {
                        throw 'No configuration has been set.';
                    }
                    this.setConfigObject(emp.appSetup);
                }
                return empV3Config;
            },
            /**
             * @description This function retrieves the value of the specified parameter.
             * @param {String} sParameter This parameter must contain the name of the parameter whos value is being requested.
             * @returns {undefined | Object | boolean | Number | String | Array} The value of the parameter or undefined if it is not found.
             */
            getConfigParameter: function(sParameter) {
                var oConfigObject = this.getConfigObject();

                if (oConfigObject.hasOwnProperty(sParameter)) {
                    return oConfigObject[sParameter];
                }

                return undefined;
            },
            /**
             * @description This function retrieves the value of the environment parameter.
             * @returns {String} This function returns the value of the parameter.
             */
            getEnvironment: function() {
                return this.getConfigParameter('environment');
            },
            /**
             * @description This function retrieves the value of the debug parameter.
             * @returns {Boolean} This function returns the value of the parameter.
             */
            getDebugSetting: function() {
                return this.getConfigParameter('debug');
            },
            /**
             * @description This function retrieves the path of the location of the emp3-map directory.
             * @returns {String} This function returns the value of the parameter.
             */
            getCoreBasePath: function() {
                return this.getConfigParameter('coreBasePath');
            },
            /**
             * @description This function retrieves the path to the core's javascript directory.
             * @returns {String} This function returns the value of the parameter.
             */
            getCoreScriptPath: function() {
                return this.getCoreBasePath() + "cpce-map/js";
            },
            /**
             * @description This function retrieves the path to the core's css directory.
             * @returns {String} This function returns the value of the parameter.
             */
            getCoreCSSPath: function() {
                return this.getCoreBasePath() + "cpce-map/css";
            },
            /**
             * @description This function retrieves the value of the minScriptPath parameter.
             * @returns {String} This function returns the value of the parameter.
             */
            getCoreMinScriptPath: function() {
                return this.getConfigParameter('minScriptPath');
            },
            /**
             * @description This function retrieves the value of the urlProxy parameter.
             * @returns {String} This function returns the value of the parameter.
             */
            getProxyUrl: function() {
                return this.getConfigParameter('urlProxy');
            },
            /**
             * @description This function retrieves the value of the useProxy parameter.
             * @returns {Boolean} This function returns the value of the parameter.
             */
            getUseProxySetting: function() {
                return this.getConfigParameter('useProxy');
            },
            /**
             * @description This function retrieves the value of the engineBasePath parameter.
             * @returns {String|undefined} This function returns the value of the parameter or undefined if it is not found.
             */
            getEngineBasePath: function() {
                return this.getConfigParameter('engineBasePath');
            },
            /**
             * @description This function retrieves the value of the startMapEngineId parameter.
             * @returns {String|undefined} This function returns the value of the parameter or undefined if it is not found.
             */
            getStartMapEngineId: function() {
                return this.getConfigParameter('startMapEngineId');
            },
            /**
             * @description This function retrieves the value of the wmsServerUrls parameter.
             * @returns {String|undefined} This function returns the value of the parameter or undefined if it is not found.
             */
            getWMSServerUrls: function() {
                return this.getConfigParameter('wmsServerUrls');
            },
            /**
             * @description This function retrieves the value of the mapEngines parameter.
             * @returns {String|undefined} This function returns the value of the parameter or undefined if it is not found.
             */
            getMapEngines: function() {
                return this.getConfigParameter('mapEngines');
            },

            /**
             * @description Retrieves whether autoSelect is turned on for this map.
             * @return {boolean} 
             */
            getAutoSelect: function() {
                return this.getConfigParameter('autoSelect');
            },
            /**
             * @description This function returns the map engine definition indexed by iIndex.
             * 
             * @param {int} iIndex The index of the map engine requested.
             * @returns {object} The map engine object or undefined if it is not found.
             */
            getMapEngineAtIndex: function(iIndex) {
                var oMapEngines = this.getMapEngines();
                
                if ((iIndex >= 0) && (iIndex < oMapEngines.length)) {
                    return oMapEngines[iIndex];
                }
                
                return undefined;
            },
            /**
             * @description This function returns the map engine definition with the indicated id.
             * 
             * @param {int|String} id The id of the map engine definition requested.
             * @returns {object} The map engine object or undefined if it is not found.
             */
            getMapEngineByIdx: function(id) {
                var iIndex;
                var oMapEngines = this.getMapEngines();
                
                for (iIndex = 0; iIndex < oMapEngines.length; iIndex++) {
                    if (oMapEngines[iIndex].hasOwnProperty('id') && (oMapEngines[iIndex] === id)) {
                        return oMapEngines[iIndex];
                    }
                }
                
                return undefined;
            }
        };

        return publicInterface;
    }());
}

/**
 * @memberOf emp.util
 * @type emp.util.configType
 * @property {String} environment This property identifies the environment EMP is operating in.
 * @property {Boolean} debug If true EMP will operate in debug mode. It operates in release mode otherwise.
 * @property {String} coreBasePath This property indicates the path where the emp3-map directory is located at.
 * @property {String} scriptPath This property is depricated. However if coreBasePath is not found scriptPath is used. If present it indicates the location of the emp3-map javascript directory.
 * @property {String} minScriptPath This property indicates the path where the emp3-map minified files are located. It currently defaults to <coreBasePath>/js.
 * @property {String} distPath This property is depricated. However if minScriptPath is not found this value is used.
 * @property {String} urlProxy This property indicates the URL to the emp urlProxy.jsp file. The default path is <coreBasePath>/emp3-map/urlProxy.jsp.
 * @property {boolean} useProxy If set to true EMP will use the proxy to access all resources. If set to false the proxy is not used.
 * @property {int=} startMapEngineId This optional property indicates which map engine definition will be used to create the map instance. The map instance will be created with the map engine definition with an id equal to the value of this property.
 * @property {String} engineBasePath The path where all the map engines are located. The deafult value is '/'.
 * @property {Array<emp.util.mapEngineDefinition>} mapEngines This property must contain an array of at least one map engine definition. @see {@link emp.util.mapEngineDefinition}
 * @property {Array<emp.util.wmsServiceDefinition>=} wmsServerUrls This optional property is an array of zero or more wms service definitions.  @see {@link emp.util.wmsServiceDefinition}
 */

/**
 * @memberOf emp.util
 * @type emp.util.mapEngineDefinition
 * @property {int} id This propert contains the unique identifier of the map engine definition.
 * @property {String} name This property contains the name of the map engine. It is used by the emp ui to list map engines.
 * @property {String} mapEngineId This property must match the type of engine the definition applies to. See emp.constant.mapEngineId in emp3-map/lib/emp.constant.js
 * @property {String} url This property must contain the relative location of the map engines manifest file. The manifest file will be loaded from <engineBasePath> + url. I.E emp3-leaflet/manifest.js
 * @property {object} properties This property contains the map engine specific configuration properties.
 * @property {String} data This property is a json string of the map engines properties. See each individual map engine for a definition of posible values.
 */

/**
 * @memberOf emp.util
 * @type emp.util.wmsServiceDefinition
 * @property {String} name The name that will be used by the ui to identify this WMS service.
 * @property {String} serverUrl The URL of the WMS service.
 * @property {String} type This value must be WMS-URL for map services and WMS-ELEV for elevation services.
 * @property {Boolean=} useProxy This property overrides the EMP config value for this WMS service. If set to true, all wms request are sent via the proxy. If set to false all request for this wms service is sent directly. If this property is not precent the main config value is used.
 * @property {String=} visibleLayers This optional property may contain a comma separated list of WMS layer that will be visible upon startup. If its empty no layers will be initialy visible and the user must selected the layer via the UI.
 * @property {String} active If true this definition will be processed. It will NOT be proceed otherwise.
 * @property {String=} defaultLayers This operational property if present, will override the visibleLayers property. The comma separated list of layers listed in this property will be the only ones made visible. EMP will prevent the user from turning on and off individual layers. The user will only have the option to make the service visible or not.
 * @property {emp.util.wmsParameters=} params This optional property can contain WMS parameters.
 */

/**
 * @memberOf emp.util
 * @type emp.util.wmsParameters
 * @property {Boolean=} transparent THis property is sent to the WMS service. The EMP default is true.
 * @property {String=} format The image format to be requested from wms service. The EMP default is image/png.
 * @property {String=} version The wms version parameter sent to the wms service. The EMP default is 1.3.0.
 */
