var emp3 = emp3 || {};
emp3.api = emp3.api || {};

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
emp3.api.createEnvironmentTemplate = function() {

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
     * @param {object} [args] - Optional container for the initialization data
     * @desc This function is used to initialize the environment
     * @method
     */
    init: function(args) { // eslint-disable-line no-unused-vars
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
     *
     * @param {object} args
     * @returns {boolean}
     */
    createInstance: function(args) { // eslint-disable-line no-unused-vars
      // Create ane EMP Error to notify system that this capability has not been implemented
      emp.typeLibrary.Error({
        message: "The createInstance method has not been implemented by this environment"
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
       * @returns {boolean} True is the message is successfully published, false if it fails
       * @param {object} args - Container for the message info
       * @param {object} args.message - Object containing an object formatted for a specific message channel
       * @param {string} args.channel - Name for the channel being used to publish the message
       * @param {object} args.sender - Info about the sender of the message
       * @desc This function is used to dispatch message on the given channel
       * @method
       */
      publish: function(args) { // eslint-disable-line no-unused-vars
        // Create ane EMP Error to notify system that this capability has not been implemented
        emp.typeLibrary.Error({
          message: "pubSub.publish has not been implemented by this environment"
        });
        // Return false for failure to publish
        return false;
      },
      /**
       * This function is used to dispatch message on the given channel synchronously. Not all calls may be supported
       * in a synchronous fashion.
       * @memberof environmentInterface.pubSub
       * @abstract
       * @public
       * @param args
       * @returns {boolean}
       */
      publishSync: function (args) {// eslint-disable-line no-unused-vars
        // Create ane EMP Error to notify system that this capability has not been implemented
        emp.typeLibrary.Error({
          message: "pubSub.publishSync has not been implemented by this environment"
        });
        // Return false for failure to publish
        return false;
      },
      /**
       * @memberOf environmentInterface.pubSub
       * @abstract
       * @public
       * @returns {boolean} True is the message is successfully subscribed, false if it fails
       * @param {object} args - Container for the subscription info
       * @param {object} args.callback - Function to be invoked when a message is received on this channel
       * @param {string} args.channel - Name of the messaging channel being subscribed to
       * @desc This function is used subscribe for incoming messages on a given channel
       * @method
       */
      subscribe: function(args) { // eslint-disable-line no-unused-vars
        // Create ane EMP Error to notify system that this capability has not been implemented
        emp.typeLibrary.Error({
          message: "pubSub.subscribe has not been implemented by this environment"
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
      get: function(args) { // eslint-disable-line no-unused-vars
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
      set: function(args) { // eslint-disable-line no-unused-vars
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
    }
  };

  // returns a copy of the environmentInterface template object that will have
  // its methods and properties overridden by an environment definition
  return environmentInterface;
};
