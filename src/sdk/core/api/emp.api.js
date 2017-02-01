/*global emp */
/**
 * Controller for register APIs
 * @memberof emp
 * @private
 * @namespace
 */
emp.api = {
	sources: [],
	checkApiSource: function( source ){
		var isApiSource = false,
		i,
		len = emp.api.sources.length;

		for(i=0; i<len; i++){
			if(source === emp.api.sources[i] ){
				isApiSource = true;
				break;
			}
		}
		return isApiSource;
	}
};
