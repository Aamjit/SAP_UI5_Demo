sap.ui.define([
	"com/mavenPatients_Appointment_Management/controller/AccountCreationHandle",
	"sap/m/Dialog",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/m/Button",
	"sap/m/Text",
	"com/mavenPatients_Appointment_Management/utility/Common",
	"sap/m/MessageBox"
], function(AccountController, Dialog, library, coreLibrary, Button, Text, Common, MessageBox) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = library.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	return AccountController.extend("com.mavenPatients_Appointment_Management.controller.Create_Account_Customer", {

		onInit: function() {
			this.createAccount = {
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
			// var oModel = new sap.ui.model.json.JSONModel();
			// this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "emp");
			var oModel = new sap.ui.model.json.JSONModel();
			// oModel.setData({"EmpId": EmpId });
			this.getView().setModel(oModel, "createAccount");
			this.byId("f_createAccount").getModel("createAccount").setData(this.createAccount);
		},

		handleChangePhone: function(oEvent) {
			var sNewValue = oEvent.getParameter("value");
		},

		handleCreateBtn: function(oCreateBtn) {

			// this.handlePopUp();                        

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
				PhoneNo: FormData.PhoneNo.toString(),
				Email: FormData.Email,
				FirstName: FormData.FirstName,
				MiddleName: FormData.MiddleName,
				LastName: FormData.LastName,
				DateOfBirth: convertedDate,
				Gender: this.byId("gender").getSelectedKey(),
				Address: FormData.Address,
				Country: FormData.Country,
				State: FormData.State,
				District: FormData.District,
				Password: FormData.Password
			};

			var that = this;
			
			console.log(oReqData);

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
					that.getOwnerComponent().getRouter().navTo("nCDashboard");
				},
				error: function(error) {
					console.log(error);
					// var errorMsg = "Failed to create Account!";
					// this.showDialogMsg(errorMsg, "Failed", ValueState.Error);
				}
			});
		},

		showDialogMsg: function(Msg, title, state) {
			if (!this.oMessageDialog) {
				this.oMessageDialog = new Dialog({
					type: DialogType.Message,
					title: title,
					state: state,
					content: new Text({
						text: Msg
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function() {
							this.oMessageDialog.close();
						}.bind(this)
					})
				});
			}

			this.oMessageDialog.open();
		}

	});

});