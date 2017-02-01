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

        var publicInterface = {
            /**
             * @description This function sets the config object for the map instance.
             * It applies any global properties to the unique config object for this
             * instance.
             */
            setConfigObject: function() {
              empV3Config = {};
              
              if (!empV3Config.hasOwnProperty('urlProxy')) {
                empV3Config.urlProxy =  emp3.api.global.configuration.urlProxy;
              }
            },
            /**
             * @description This function return the emp config object.
             * @returns {Object} This function return the emp config object.
             */
            getConfigObject: function() {
              if (empV3Config === undefined) {
                this.setConfigObject();
              }
              // true is the default for autoSelect
              this.setAutoSelect(true);
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
                // When useProxy has been implemented in Features/Map Services classes
                // and all references to this function have been altered/deleted, this
                // function can be deleted. For now change this value to turn proxy on
                // and off for the instance.
                return false;
            },
            /**
             * @description Retrieves whether autoSelect is turned on for this map.
             * @return {boolean}
             */
            getAutoSelect: function() {
                return this.getConfigParameter('autoSelect');
            },
            /**
             * @description Sets the autoSelect for this map.
             */
            setAutoSelect: function(flag) {
              if (empV3Config.hasOwnProperty('autoSelect')) {
                if (typeof (empV3Config.autoSelect) === 'boolean') {
                    empV3Config.autoSelect = empV3Config.autoSelect;
                } else {
                    empV3Config.autoSelect =  flag;
                }
              } else {
                empV3Config.autoSelect =  flag;
              }
            },
            // The currentMapEngineId should remain on a global level once
            // separate config object are maintained for each instance.
            /**
             * @description Sets the current engine configuration and mapEngineId.
             */
            setCurrentEngineConfiguration: function (engineConfig) {
              empV3Config.previousMapEngineId = empV3Config.currentMapEngineId;
              empV3Config.currentMapEngineId = engineConfig.mapEngineId;
              empV3Config.currentEngineConfiguration = engineConfig;
            },
            /**
             * @description Gets the currentEngineConfiguration.
             * @return {string}
             */
            getCurrentEngineConfiguration: function () {
              return this.getConfigParameter('currentEngineConfiguration');
            },
            /**
             * @description Gets the currentMapEngineId.
             * @return {string}
             */
            getCurrentMapEngineId: function () {
              return this.getConfigParameter('currentMapEngineId');
            },
            /**
             * @description Gets the previousMapEngineId.
             * @return {string}
             */
            getPreviousMapEngineId: function () {
              return this.getConfigParameter('previousMapEngineId');
            }
        };

        return publicInterface;
    }());
}