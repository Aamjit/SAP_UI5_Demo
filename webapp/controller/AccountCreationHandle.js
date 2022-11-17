sap.ui.define([
	"com/mavenPatients_Appointment_Management/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast"
], function(BaseController, Fragment, MessageToast) {
	"use strict";

	var iTimeoutId;
	// 	"sap/ui/core/syncStyleClass",

	return BaseController.extend("com.mavenPatients_Appointment_Management.controller.AccountCreationHandle", {

		handlePopUp: function() {
			if (!this._pBusyDialog) {
				this._pBusyDialog = Fragment.load({
					id: this.getView().getId(),
					name: "om.mavenPatients_Appointment_Management.fragments.BusyDialog",
					controller: this
				}).then(function(oBusyDialog) {
					this.getView().addDependent(oBusyDialog);
					// syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog);
					return oBusyDialog;
				}.bind(this));
			}

			this._pBusyDialog.then(function(oBusyDialog) {
				oBusyDialog.open();
				this.simulateServerRequest();
			}.bind(this));

		},
		simulateServerRequest: function() {
			// simulate a longer running operation
			iTimeoutId = setTimeout(function() {
				this._pBusyDialog.then(function(oBusyDialog) {
					oBusyDialog.close();
				});
			}.bind(this), 3000);
		},

		onDialogClosed: function(oEvent) {
			clearTimeout(iTimeoutId);

			if (!oEvent.getParameter("cancelPressed")) {
				MessageToast.show("Account creation completed.");
			}
		}

	});

});