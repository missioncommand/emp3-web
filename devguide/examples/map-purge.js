args = {
	onSuccess: function () {
		alert("Purge was successful");
	},
	onError: function () {
		alert("Purge failed");
	}
}
map1.purge(args);
