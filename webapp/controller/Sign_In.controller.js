sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/BusyIndicator",
	"com/mavenPatients_Appointment_Management/utility/Common",
	"com/mavenPatients_Appointment_Management/controller/BaseController",
	"sap/m/MessageBox"
], function(Controller, BusyIndicator, Common, BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("com.mavenPatients_Appointment_Management.controller.Sign_In", {

		onInit: function() {
			this.signIn = {
				Email: "",
				Password: ""
			};
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "signIn");
			this.byId("f_signIn").getModel("signIn").setData(this.signIn);

			this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "sessionAppointment");

			this.getView().setModel(new sap.ui.model.json.JSONModel(), "createAccount");
		},

		handleCreateAccount: function() {
			// this.getOwnerComponent().getRouter().navTo("nCreateCustomer");
			if (!this.pDialog) {
				this.pDialog = this.loadFragment({
					name: "com.mavenPatients_Appointment_Management.fragments.CreateAccount"
				});
			}
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});

		},

		onBeforeRendering: function() {
			// console.log(this.getOwnerComponent().getModel("accountSession"));
		},

		handleLogIn: function() {

			BusyIndicator.show(0);

			var oSignInData = this.getView().getModel("signIn").getData();

			var sign_URI =
				`/sap/opu/odata/sap/ZMM0687_PAM_SRV/getCreds?ivEmail='${oSignInData.Email}'&ivPassword='${oSignInData.Password}'&$format=json`;

			var resData;
			var that = this;

			$.ajax({
				url: Common.fnGetURL(sign_URI),
				method: "POST",
				contentType: "application/json",
				success: function(oData) {
					MessageBox.success("Sign in successfull.");
					console.log(oData);
					that.getOwnerComponent().getModel("accountSession").setData(oData);
					resData = oData;
					setTimeout(() => {
						BusyIndicator.hide();
						if (resData.d.Type === 'D') {
							that.getOwnerComponent().getRouter().navTo("nDDashboard");
						} else if(resData.d.Type === 'C') {
							that.getOwnerComponent().getRouter().navTo("nCDashboard");
						} else {
							MessageBox.Error("Invalid User.");
						}
					}, 3000);
				},
				error: function(error) {
					// var errorMsg = "Failed to create Account!";
					// this.showDialogMsg(errorMsg, "Failed", ValueState.Error);
					MessageBox.error("Invalid Login.");

					setTimeout(() => {
						BusyIndicator.hide();
						// that.getOwnerComponent().getRouter().navTo("nCDashboard");
					}, 3000);
				}
			});

			// this.getOwnerComponent().getRouter().navTo("nCDashboard");
		},

		handleCreateBtn: function(oCreateBtn) {

			var FormData = this.getView().getModel("createAccount").getData();
			// console.table(FormData);
			var msg;
			if (FormData.Password !== FormData.ConfirmPassword) {
				msg = "Password does not match!";
				this.showDialogMsg(msg, "Incorrect", ValueState.Error);
				return;
			} else if (FormData.Password.length === 0 || FormData.ConfirmPassword.length === 0) {
				msg = "Password cannot be empty!";
				this.showDialogMsg(msg, "Incorrect", ValueState.Error);
				return;
			}

			var create_URI = "/sap/opu/odata/sap/ZMM0687_PAM_SRV/customerDetailsSet";
			var DateTimestamp = new Date(FormData.DateOfBirth).getTime();
			var convertedDate = "/Date(" + DateTimestamp + ")/";
			var oReqData = {
				PhoneNo: "" + FormData.PhoneNo,
				Email: FormData.Email,
				FirstName: FormData.FirstName,
				MiddleName: FormData.MiddleName,
				LastName: FormData.LastName,
				DateOfBirth: convertedDate,
				Gender: this.byId("gender_c").getSelectedKey(),
				Address: FormData.Address,
				Country: FormData.Country,
				State: FormData.State,
				District: FormData.District,
				Password: FormData.Password
			};

			var that = this;

			$.ajax({
				url: Common.fnGetURL(create_URI),
				method: "POST",
				contentType: "application/json",
				data: JSON.stringify(oReqData),
				// processData: false,
				dataType: "json",
				success: function(oData) {
					// var successMsg = "Account created successfully!";
					// this.showDialogMsg(successMsg, "Success", ValueState.Success);
					MessageBox.success("Account created successfully.");
					that.getOwnerComponent().getModel("accountSession").setData(oData);
					// console.log(that.getOwnerComponent().getModel("accountSession").getData());
					that.getOwnerComponent().getRouter().navTo("nCDashboard");
				},
				error: function(error) {
					// var errorMsg = "Failed to create Account!";
					// this.showDialogMsg(errorMsg, "Failed", ValueState.Error);
				}
			});
		},

		handleLogInDoctor: function() {

			// BusyIndicator.show(0);

			// var oSignInData = this.getView().getModel("signIn").getData();

			// var sign_URI =
			// 	`/sap/opu/odata/sap/ZMM0687_PAM_SRV/getCreds?ivEmail='${oSignInData.Email}'&ivPassword='${oSignInData.Password}'&$format=json`;

			// var that = this;

			// $.ajax({
			// 	url: Common.fnGetURL(sign_URI),
			// 	method: "POST",
			// 	contentType: "application/json",
			// 	success: function(oData) {
			// 		MessageBox.success("Sign in successfull.");
			// 		// console.log(oData);
			// 		that.getOwnerComponent().getModel("accountSession").setData(oData);
			// 		resData = oData;
			// 		setTimeout(() => {
			// 			BusyIndicator.hide();
			// 			that.getOwnerComponent().getRouter().navTo("nCDashboard");
			// 		}, 3000);
			// 	},
			// 	error: function(error) {
			// 		// var errorMsg = "Failed to create Account!";
			// 		// this.showDialogMsg(errorMsg, "Failed", ValueState.Error);
			// 		MessageBox.error("Invalid Login.");

			// 		setTimeout(() => {
			// 			BusyIndicator.hide();
			// 			// that.getOwnerComponent().getRouter().navTo("nCDashboard");
			// 		}, 3000);
			// 	}
			// });

			this.getOwnerComponent().getRouter().navTo("nDDashboard");
		}

	});

});