///////////////////////////////////////////////////////////////////////////////
// MapCntrlBase.js
//
// Copyright (c) 2014-2015 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////
              function MapCntrlBase ()
              {

        this.OPERATION_ADD =  0,
        this.OPERATION_DELETE = 1,
        this.OPERATION_UPDATE = 2,
        
        this.addToQueue =  function(priorty, itemList, method, context) {

            var i = null;
            var wrapper = null;

            try {

                for(i = 0; i < itemList.length; i++) {

                    wrapper = {};
                    wrapper.operation = this.OPERATION_ADD;
                    wrapper.obj = itemList[i];

                  ////  queueUtils.addElementToQueue(priorty, wrapper, method, context);
                }

            }
            catch(error) {
                console.info('MapCntrlBase._addToQueue: Error ' + error);
            }
        };

        draw = function(evt) {
          //Too be implemented by sub class 
        };
        
        openDetailPanel =  function(screenElement) {
            //Too be implemented by sub class
        };
        
        openPopupPanel =  function(screenElement, position) {
          //Too be implemented by sub class
        };
        
        openRightMouseMenu = function(screenElementList, position) {
          //Too be implemented by sub class
        };
        
        update = function(evt) {
            //Too be implemented by sub class 
        };
        
        //Responsicbility of derived classed to cancel subscriptions - 'because of use-strict'
        /*
        destroy: function() {
            
            try {
                
                this.cancelSubscriptions();
            }
            catch(error) {
                console.warn('MapCntrlBase.destroy: ' + error);
            }
        }
        */
    };
