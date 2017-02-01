/*global emp */
/* eslint-disable no-unused-vars */
/**
 * @memberOf emp
 * @method
 * @description This function returns an object with all the namespaces and abstract functions required for an environment.  Environments define the pub/sub mechanism and user preference storage
 * When developing an environment, the first part of the js file for your environment should be a call to generate a template.
 * This template is for the public interface that your map environment will expose.
 * All of the internal functions and properties of your map engine should not be added to this template
 *
 * @return {environmentInterface}
 */
emp.createEnvironmentTemplate = function() {
  //noinspection JSValidateJSDoc
  /**
   * @ignore
   * @namespace environmentInterface
   * @description A public interface is returned as an environmentInterface instance when
   * emp.createEnvironmentTemplate() is invoked. This is designed to use functional inheritance.
   * Do not use the "new" keyword.
   */
  var environmentInterface = {
    /**
     * @memberOf environmentInterface
     * @abstract
     * @public
     * @returns {boolean} True if initialization completes, false if initialization fails
     * @param {object} args - Optional container for the initialization data
     * @desc This function is used to initialize the environment
     * @method
     */
    init: function(args) {
      // Create ane EMP Error to notify system that this capability has not been implemented
      emp.typeLibrary.Error({
        message: "The init method has not been implemented by this environment"
      });
      // Return false as the initialization failed
      return false;
    },
    /**
     * @memberOf environmentInterface.
     * @abstract
     * @public
     * @returns {boolean} Returns true if the cleanup succeeded, false if there was an issue
     * @desc This method is invoked when a new environment is set.  This is to be used to cleanup before it is replaced
     * @method
     */
    destroy: function() {
      // Create ane EMP Error to notify system that this capability has not been implemented
      emp.typeLibrary.Error({
        message: "The destroy method has not been implemented by this environment"
      });
      // Return false as the environment could not be destroyed
      return false;
    },
    /**
     * @ignore
     * @memberOf environmentInterface
     * @namespace
     * @description Namespace that contains all the implementation information for pub/sub.
     */
    pubSub: {
      /**
       * @memberOf environmentInterface.pubSub
       * @abstract
       * @public
       * @returns {boolean} True if the message is successfully published, false if it fails
       * @param {object} args - Container for the message info
       * @param {object} args.message - Object containing an object formatted for a specific message channel
       * @param {string} args.channel - Name for the channel being used to publish the message
       * @param {object} args.sender - Info about the sender of the message
       * @desc This function is used to dispatch message on the given channel
       * @method
       */
      publish: function(args) {
        // Create ane EMP Error to notify system that this capability has not been implemented
        emp.typeLibrary.Error({
          message: "pubSub.publish has not been implemented by this environment"
        });
        // Return false for failure to publish
        return false;
      },
      /**
       * @memberOf environmentInterface.pubSub
       * @abstract
       * @public
       * @returns {boolean} True if the message is successfully subscribed, false if it fails
       * @param {object} args - Container for the subscription info
       * @param {object} args.callback - Function to be invoked when a message is received on this channel
       * @param {string} args.channel - Name of the messaging channel being subscribed to
       * @desc This function is used to subscribe for incoming messages on a given channel
       * @method
       */
      subscribe: function(args) {
        // Create ane EMP Error to notify system that this capability has not been implemented
        emp.typeLibrary.Error({
          message: "pubSub.subscribe has not been implemented by this environment"
        });
        // Return false for failure to publish
        return false;
      },
      /**
       * @memberOf environmentInterface.pubSub
       * @abstract
       * @public
       * @returns {boolean} True if the message is successfully unsubscribed, false if it fails
       * @param {object} args - Container for the subscription info
       * @param {object} args.callback - Function to be invoked when a message is received on this channel
       * @param {string} args.channel - Name of the messaging channel being subscribed to
       * @desc This function is used to unsubscribe from incoming messages on a given channel
       * @method
       */
      unsubscribe: function(args) {
        // Create ane EMP Error to notify system that this capability has not been implemented
        emp.typeLibrary.Error({
          message: "pubSub.unsubscribe has not been implemented by this environment"
        });
        // Return false for failure to publish
        return false;
      }
    },
    /**
     * @ignore
     * @memberOf engineInterface
     * @namespace
     * @description Namespace that contains all the implementation information for saving and getting user preferences.
     */
    prefs: {
      /**
       * @memberOf environmentInterface.prefs
       * @abstract
       * @public
       * @returns {object | null} Returns the pref object if found, else returns null
       * @param {object} args - Container for the pref info
       * @param {string} args.key - Function to be invoked when a message is received on this channel
       * @desc This function is used subscribe for incoming messages on a given channel
       * @method
       */
      get: function(args) {
        // Create ane EMP Error to notify system that this capability has not been implemented
        emp.typeLibrary.Error({
          message: "prefs.get has not been implemented by this environment"
        });
        // Return null as the requested pref could not be returned
        return null;
      },
      /**
       * @memberOf environmentInterface.prefs
       * @abstract
       * @public
       * @returns {boolean} Returns true if the pref is saved, else returns false
       * @param {object} args - Container for the pref info
       * @param {string} args.key - Function to be invoked when a message is received on this channel
       * @desc This function is used subscribe for incoming messages on a given channel
       * @method
       */
      set: function(args) {
        // Create ane EMP Error to notify system that this capability has not been implemented
        emp.typeLibrary.Error({
          message: "prefs.set has not been implemented by this environment"
        });
        // Return null as the requested pref could not be returned
        return false;
      }
    },
    /**
     * @memberOf environmentInterface
     * @abstract
     * @public
     * @returns {GUID} Returns the ID of the environment instance.
     * @method
     */
    getInstanceId: function() {
      // Create ane EMP Error to notify system that this capability has not been implemented
      emp.typeLibrary.Error({
        message: "getInstanceId has not been implemented by this environment"
      });
      // Return null as the requested pref could not be returned
      return undefined;
    },
    /**
     * @memberOf environmentInterface
     * @type string
     * @description Name of the environment.
     */
    name: "Unnamed Environment",
    /**
     * @memberOf environmentInterface
     * @type string
     * @description Version of the environment.
     */
    version: "1.0.0",
    /**
     * @memberOf environmentInterface
     * @type object
     * @description Free form object to store properties that may need to be passed to the environment for it to function correctly.
     * 
     */
    properties: {},
    sender: {
      id: "not-set"
    },
    /**
     * @memberOf environmentInterface
     * @abstract
     * @public
     * @param {object} args - This object must contain the correct fields to execute the call.
     * @param {object} args.toolHandle - This object must contain the object which identifies
     * the tool to be launched. It should be obtained by calling getToolInfo.
     * @param {function} args.onSuccess - Function to be invoked when the tools is launched.
     * @param {function} args.onError - This function is called in the event of an error.
     * @desc This function is used to launch a tool.
     * @method
     */
    launchTool: function(args) {
      emp.typeLibrary.Error({
        message: "launchTool has not been implemented by this environment"
      });
      if (typeof args.onError === 'function') {
        args.onError({
          message: "launchTool is not implemented by this environment."
        });
      }
    },
    /**
     * @memberOf environmentInterface
     * @abstract
     * @public
     * @param {object} args - Container for the call info
     * @param {object} args.toolInfo - This object must contain the info which identifies
     * the tool to retrieve.
     * @param {string} args.toolInfo.toolName This field must contain the name
     * of the tool retrieved via the map config.
     * @param {function} args.onSuccess - Function to be invoked to return the info to the caller. The
     * argument is of type {@link emp.environment.toolInfoType}
     * @param {function} args.onError - This function is called in the event of an error.
     * @desc This function is used to retrieve the environment info of a tool
     * @method
     */
    getToolInfo: function(args) {
      emp.typeLibrary.Error({
        message: "getToolInfo has not been implemented by this environment"
      });
      if (typeof args.onError === 'function') {
        args.onError({
          message: "getToolInfo is not implemented by this environment."
        });
      }
    }
  };

  // returns a copy of the environmentInterface template object that will have
  // its methods and properties overridden by an environment definition
  return environmentInterface;
};
/* eslint-enable no-unused-args */