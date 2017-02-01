/*global emp, com */

emp.environment.starfish = (function() {
    var template = emp.createEnvironmentTemplate(),
        nerve;

    template.name = "Starfish";
    

    template.init = function(args) {
        nerve = new com.octabits.starfish.Nerve();
        template.sender.id = nerve.id;
        if (args) {
            if (args.hasOwnProperty("initcallback")) {
                args.initcallback();
            }
        }

    };

    template.pubSub.publish = function(args) {
        var success = false;

        nerve.publish({
            channel: args.channel,
            message: args.message
        });
        success = true;

        return success;
    };

    template.pubSub.subscribe = function(args) {
        var success = false;

        nerve.subscribe({
            channel: args.channel,
            callback: args.callback
        });
        success = true;

        return success;
    };

    template.pubSub.unsubscribe = function(args) {
        var success = false;

        nerve.unsubscribe({
            channel: args.channel,
            callback: args.callback
        });
        success = true;

        return success;
    };

     template.getInstanceId = function (){
        return nerve.id;
    };

    return template;
}());
