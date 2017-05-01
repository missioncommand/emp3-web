
var emp = window.emp || {};
emp.mapGridLines = emp.mapGridLines || {};

emp.mapGridLines.privateClass = function() {
    var publicInterface = {
        initialize: function() {
            var oOptions;
            var now = new Date();
            
            oOptions = {
                lastUpdated: now.getTime(),
                featureList: [],
                strokeStyleHash: new emp.utilities.Hash(),
                labelStyleMap: new emp.utilities.Hash()
            };
            
            emp.classLibrary.Util.setOptions(this, oOptions);
        },
        getLastUpdated: function() {
            return this.options.lastUpdated;
        },
        getGridFeatures: function() {
            var iIndex;
            var returnList = [];
            
            for (iIndex = 0; iIndex < this.option.featureList.length; iIndex++) {
                returnList.push(this.option.featureList[iIndex]);
            }
            
            return returnList;
        }
    };
    return publicInterface;
};

emp.mapGridLines.AbstractGridLineGenerator = emp.classLibrary.Class.extend(emp.mapGridLines.privateClass());
