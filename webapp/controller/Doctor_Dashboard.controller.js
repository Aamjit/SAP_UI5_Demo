sap.ui.define([
	"com/mavenPatients_Appointment_Management/controller/BaseController",
	"com/mavenPatients_Appointment_Management/utility/Common",
	"sap/m/MessageBox"
], function(BaseController, Common, MessageBox) {
	"use strict";

	var DocData, selectedAppID, AccountID;

	return BaseController.extend("com.mavenPatients_Appointment_Management.controller.Doctor_Dashboard", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.mavenPatients_Appointment_Management.view.Doctor_Dashboard
		 */
		onInit: function() {

			// Get session data
			DocData = this.getOwnerComponent().getModel("accountSession").getData();
			// console.log(CusData);
			console.log(DocData);
			AccountID = DocData.d.Id;
			var timestamp = DocData.d.DateOfBirth.split(/[(:)]/);
			var date = new Date(+timestamp[1]);
			DocData.d.DateOfBirth = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;

			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "DocData");

			if (DocData.d.Type === 'D') {
				DocData.d.Type = 'Doctor';
			}

			this.getView().getModel("DocData").setData(DocData.d);

			var oAppointment = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oAppointment, "Appointment");

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				startDate: new Date(),
				people: [{
					name: `${DocData.d.FirstName} ${DocData.d.MiddleName} ${DocData.d.LastName}`,
					role: "Upcoming Appointments",
					specialDates: [{
						start: new Date()
					}],
					appointments: [],
					headers: []
				}]
			});
			this.getView().setModel(oModel);

			// Get appointment details
			// TODO 
			this.getDocAppointmentDetails();

		},

		getDocAppointmentDetails: function() {
			var cusDash_URI = `/sap/opu/odata/sap/ZMM0687_PAM_SRV/getAppointmentsDetail?ivId='${DocData.d.Id}'&$format=json`;

			var that = this;

			$.ajax({
				url: Common.fnGetURL(cusDash_URI),
				method: "GET",
				contentType: "application/json",
				dataType: "json",
				success: function(oData) {
					var resData = oData.d.results;
					var PlanningCalendar = that.getView().getModel().getData();
					console.log(DocData);

					var appointment, header, uDate, uSTime, uETime, date, parsedSDate, parsedEDate;

					for (var i = 0; i < resData.length; i++) {
						uDate = resData[i].AppDate.split((/[(:)]/));
						uSTime = resData[i].FromTime.split((/[T:H:M:S]/));
						uETime = resData[i].ToTime.split((/[T:H:M:S]/));
						date = new Date(+uDate[1]);
						parsedSDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), +uSTime[1], +uSTime[2], +uSTime[3]);
						parsedEDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), +uETime[1], +uETime[2], +uETime[3]);
						// console.log(parsedSDate, parsedEDate);

						// .split((/[T:H:M:S]/));
						appointment = {
							start: parsedSDate,
							end: parsedEDate,
							appDetails: resData[i],
							title: resData[i].Note,
							type: "Type02",
							tentative: true
						};

						header = {
							start: parsedSDate,
							end: parsedEDate,
							title: resData[i].Note,
							type: "Type02"
						}

						PlanningCalendar.people[0].appointments.push(appointment);
						PlanningCalendar.people[0].headers.push(header);
					}
					// console.log(prevData);
					that.getView().getModel().setData(PlanningCalendar);
					that.getOwnerComponent().getModel("sessionAppointment").setData(resData);
					// console.log(that.getView().getModel().getData());
				},
				error: function(error) {}
			});
		},

		handleViewAppointment: function() {

			this.getView().setModel(new sap.ui.model.json.JSONModel(), "appointmentListView");

			this.refreshAppointmentView();

			if (!this.pDialog) {
				this.pDialog = this.loadFragment({
					name: "com.mavenPatients_Appointment_Management.fragments.AppointmentView"
				});
			}
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		refreshAppointmentView: function() {
			let appointList = this.getView().getModel("sessionAppointment").getData();

			this.getView().getModel('appointmentListView').setData(null);

			let appointmentPendingList = [];

			console.log(appointList);
			appointList.forEach((item) => {
				if (AccountID === item.DoctorId) {

					if (item.AppointmentState === 'C') {
						item.AppointmentState = 'Submitted';
					} else if (item.AppointmentState === 'A') {
						item.AppointmentState = 'Approved';
					} else if (item.AppointmentState === 'R') {
						item.AppointmentState = 'Rejected';
					} else if (item.AppointmentState === 'M') {
						item.AppointmentState = 'Rejected';
					} else if (item.AppointmentState === 'D') {
						item.AppointmentState = 'Completed';
					}
					item.AppDate = this.parseDate(item.AppDate);
					item.FromTime = this.parseTime(item.FromTime);
					item.ToTime = this.parseTime(item.ToTime);

					appointmentPendingList.push(item);
				}
			})

			this.getView().getModel('appointmentListView').setData(appointmentPendingList);
			// this.getView().byId('appointmentListView').getBinding("items").refresh(true);
			// console.log(this.getView().byId('appointmentListView'));
		},

		onListItemPress: function(oEvent) {
			// console.log(oEvent.getSource());
			selectedAppID = null;
			let pEvent = oEvent.getSource();

			// console.log(pEvent.getBindingContext("appointmentListView"));
			let oBindData = pEvent.getBindingContext("appointmentListView");

			// console.log(oBindData.getProperty("AppointmentId"));
			selectedAppID = oBindData.getProperty("AppointmentId");

			if (!this.qDialog) {
				this.qDialog = this.loadFragment({
					name: "com.mavenPatients_Appointment_Management.fragments.ConfirmAppointment"
				});
			}
			this.qDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		handleBtnAcceptPress: function(oEvent) {

			// console.log(selectedAppID);

			this.handleUpdateAppAPI(selectedAppID, 'A', 'Approved');

			if (this.qDialog) {
				this.qDialog.then(function(oDialog) {
					oDialog.close();
				});
			}
			this.getDocAppointmentDetails();
			this.refreshAppointmentView();
		},

		handleBtnRejectPress: function() {

			this.handleUpdateAppAPI(selectedAppID, 'R', 'Rejected');

			if (this.qDialog) {
				this.qDialog.then(function(oDialog) {
					oDialog.close();
				});
			}
			this.getDocAppointmentDetails();
			this.refreshAppointmentView();
		},

		handleUpdateAppAPI: function(AppID, AppState, Message) {
			let updateApp_URI =
				`/sap/opu/odata/sap/ZMM0687_PAM_SRV/updateAppointmentState?ivAppId='${AppID}'&ivAppState='${AppState}'&$format=json`;

			$.ajax({
				url: Common.fnGetURL(updateApp_URI),
				method: "POST",
				contentType: "application/json",
				success: function(oData) {
					MessageBox.success(Message);
					// console.log(oData);
				},
				error: function(error) {

				}
			});
		},

		parseDate: function(iDate) {
			if (/[a-zA-Z]/.test(iDate)) {
				var timestamp = iDate.split(/[(:)]/);
				var date = new Date(+timestamp[1]);
				return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
			} else {
				let uDate = iDate.split(/[/]/);
				return `${uDate[0]}/${uDate[1]}/${uDate[2]}`;
			}
		},

		parseTime: function(iTime) {
			// console.log(iTime);
			if (iTime.length === 11) {
				let uSTime = iTime.split((/[T:H:M:S]/));
				return `${uSTime[1]}:${uSTime[2]}:${uSTime[3]}`;
			} else {
				let uSTime = iTime.split(/:/);
				return `${uSTime[0]}:${uSTime[1]}:${uSTime[2]}`;
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.mavenPatients_Appointment_Management.view.Doctor_Dashboard
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.mavenPatients_Appointment_Management.view.Doctor_Dashboard
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.mavenPatients_Appointment_Management.view.Doctor_Dashboard
		 */
		//	onExit: function() {
		//
		//	}

	});

});