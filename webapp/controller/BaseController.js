sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox"
], function(Controller, History, BusyIndicator, MessageBox) {
	"use strict";

	return Controller.extend("com.mavenPatients_Appointment_Management.controller.BaseController", {

		onInit: function() {
			// onBeforeRendering: function() {
			// var oAccountSession = {
			// 	AccountId: "",
			// 	PhoneNo: "",
			// 	Email: "",
			// 	FirstName: "",
			// 	MiddleName: "",
			// 	LastName: "",
			// 	DateOfBirth: "",
			// 	Gender: "",
			// 	Address: "",
			// 	Country: "",
			// 	State: "",
			// 	District: "",
			// 	Password: ""
			// };
			// var oModelSess = new sap.ui.model.json.JSONModel();
			// this.getOwnerComponent().setModel(oModelSess, "accountSession");
			// console.log(this.getOwnerComponent().getModel("accountSession").getData());
			// this.getOwnerComponent().getModel("accountSession").setData(oAccountSession);
			// var oModelSess = this.getView().getModel("accountSession");
			// oModelSess.setData(oAccountSession);
		},

		clearCreateAccForm: function() {

			var oEmptyModel = {
				PhoneNo: "",
				Email: "",
				FirstName: "",
				MiddleName: "",
				LastName: "",
				DateOfBirth: "",
				Gender: "",
				Address: "",
				Country: "",
				State: "",
				District: "",
				Password: "",
				ConfirmPassword: ""
			};
			var oModelAcc = this.getView().getModel("createAccount");
			oModelAcc.setData(oEmptyModel);

		},

		handleBackPress: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("nLanding");
			}
			this.clearCreateAccForm();
		},

		handleLogOut: function() {
			BusyIndicator.show(0);

			setTimeout(() => {
				this.getOwnerComponent().getModel("accountSession").setData(null);
				this.getOwnerComponent().getRouter().navTo("nLanding");
				BusyIndicator.hide();
				MessageBox.success("Logged out successfully.");
			}, 3000)
		}

	});
});