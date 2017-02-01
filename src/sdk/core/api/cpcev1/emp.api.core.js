/*globals emp, OWF*/

emp.api.core = {};
emp.api.core.SOURCE = 'emp-core-api-core';
emp.api.sources.push(emp.api.core.SOURCE);
emp.api.core._widgetId = '';
emp.api.core._isOzoneInitialized = false;

emp.api.core._init = function () {

        var fixture = emp.api.core.fixture.channels;
        for (var i in fixture) {
            if (fixture[i].direction === "inbound" || fixture[i].direction === "bidirectional") {
                emp.environment.get().pubSub.subscribe({channel:i, callback: emp.api.core.handleMessage});
            }
        }
        var environment = emp.environment.get();
        if (environment === emp.environment.owf) {
            this._widgetId = OWF.getInstanceId();
            this._isOzoneInitialized = true;
        }

	emp.transactionQueue.listener.add({
		type: emp.intents.control.CLICK,
		callback: function (args) {
			emp.api.core.publish(args);
		}

	});

	emp.transactionQueue.listener.add({
		type: emp.intents.control.FEATURE_CLICK,
		callback: function (args) {
			emp.api.core.publish(args);
		}

	});

	emp.transactionQueue.listener.add({
		type: emp.intents.control.VIEW_CHANGE,
		callback: function (args) {
			emp.api.core.publish(args);
		}
	});

        emp.transactionQueue.listener.add({
		type: emp.intents.control.STATUS_CHANGE,
		callback: function (args) {
			emp.api.core.publish(args);
		}
	});

	emp.transactionQueue.listener.add({
		type: emp.intents.control.FEATURE_REMOVE,
		callback: function (args) {
			emp.api.core.updateHash(args);
		}
	});

	emp.transactionQueue.listener.add({
		type: emp.intents.control.OVERLAY_REMOVE,
		callback: function (args) {
			emp.api.core.updateHash(args);
		}
	});

        emp.transactionQueue.listener.add({
		type: emp.intents.control.DRAW_UPDATE,
		callback: function (args) {
			emp.api.core.publish(args);
		}
	});

        emp.transactionQueue.listener.add({
		type: emp.intents.control.EDIT_UPDATE,
		callback: function (args) {
			emp.api.core.publish(args);
		}
	});

        emp.transactionQueue.listener.add({
            type: emp.intents.control.TRANSACTION_COMPLETE,
            callback: function (args) {
                    emp.api.core.transactionQueue.transCompleteHandler(args);
                }
        });
};