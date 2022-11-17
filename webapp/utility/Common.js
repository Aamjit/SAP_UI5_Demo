sap.ui.define([], function() {
	"use strict";
	
	var Common = function() {
		throw new Error();
	};

	Common.fnGetURL = function (sPath) {
		var sDestination = "";
		var sRetVal = "";

		if (window.location.href.indexOf("localhost") > -1) {
			sDestination = "/cr7";
		}

		sRetVal = sDestination + sPath;
		return sRetVal;
	};
	return Common;
}, true);