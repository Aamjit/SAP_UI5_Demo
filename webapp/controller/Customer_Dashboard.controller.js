sap.ui.define([
	"com/mavenPatients_Appointment_Management/controller/BaseController",
	"sap/ui/core/Fragment",
	'sap/ui/unified/library',
	'sap/m/library',
	"com/mavenPatients_Appointment_Management/utility/Common",
	"sap/m/MessageBox"
], function(BaseController, Fragment, unifiedLibrary, mLibrary, Common, MessageBox) {
	"use strict";

	var CusData, listItems = [],
		DocList = [];

	// var StandardCalendarLegendItem = unifiedLibrary.StandardCalendarLegendItem,
	// 	PlanningCalendarBuiltInView = mLibrary.PlanningCalendarBuiltInView;

	return BaseController.extend("com.mavenPatients_Appointment_Management.controller.Customer_Dashboard", {

		onInit: function() {

			CusData = this.getOwnerComponent().getModel("accountSession").getData();
			console.log(CusData);
			var timestamp = CusData.d.DateOfBirth.split(/[(:)]/);
			var date = new Date(+timestamp[1]);
			CusData.d.DateOfBirth = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;

			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "CusData");

			if (CusData.d.Type === 'C') {
				CusData.d.Type = 'Patient';
			}

			this.byId("blockLayout").getModel("CusData").setData(CusData.d);

			// console.log(this.byId("blockLayout").getModel("CusData").getData());
			// console.log(this.getView().getModel("CusData").getData());

			// CusData = this.getOwnerComponent().getModel("accountSession").getData();
			// console.log(CusData);
			
			this.fetchAppointmentDashboard();

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				startDate: new Date(),
				people: [{
					name: `${CusData.d.FirstName} ${CusData.d.MiddleName} ${CusData.d.LastName}`,
					role: "Track your appointment",
					specialDates: [{
						start: new Date()
							// type: "NonWorking"
					}],
					appointments: [],
					headers: []
				}]
			});
			this.getView().setModel(oModel);

			// var oStateModel = new sap.ui.model.json.JSONModel();
			// oStateModel.setData({
			// 	legendShown: false
			// });
			// this.getView().setModel(oStateModel, "stateModel");

			// console.log(CusData.d.Id);

			this.getView().setModel(new sap.ui.model.json.JSONModel(), "selectStateList");
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "selectDistrictList");
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "selectHospitalList");
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "selectDepartmentList");
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "selectDoctorList");
		},

		fetchAppointmentDashboard: function() {
			var cusDash_URI = `/sap/opu/odata/sap/ZMM0687_PAM_SRV/getAppointmentsDetail?ivId='${CusData.d.Id}'&$format=json`;
			// that.getView().getModel().setData(null);
			this.getOwnerComponent().getModel("sessionAppointment").setData(null);
			
			var that = this;

			$.ajax({
				url: Common.fnGetURL(cusDash_URI),
				method: "GET",
				contentType: "application/json",
				dataType: "json",
				success: function(oData) {
					var resData = oData.d.results;
					var PlanningCalendar = that.getView().getModel().getData();
					PlanningCalendar.people[0].appointments = [];
					PlanningCalendar.people[0].headers = [];
					// that.getView().getModel().setData(PlanningCalendar);
					console.log(resData);

					var appointment, header, uDate, uSTime, uETime, date, parsedSDate, parsedEDate;

					for (var i = 0; i < resData.length; i++) {
						uDate = resData[i].AppDate.split((/[(:)]/));
						uSTime = resData[i].FromTime.split((/[T:H:M:S]/));
						uETime = resData[i].ToTime.split((/[T:H:M:S]/));
						date = new Date(+uDate[1]);
						parsedSDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), +uSTime[1], +uSTime[2], +uSTime[3]);
						parsedEDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), +uETime[1], +uETime[2], +uETime[3]);
						console.log("Title: " + resData[i].AppointmentTitle + "StartDate: " + parsedSDate);

						// .split((/[T:H:M:S]/));
						appointment = {
							start: parsedSDate,
							end: parsedEDate,
							appDetails: resData[i],
							title: resData[i].AppointmentTitle,
							description: resData[i].Note,
							type: "Type04",
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
					console.log(that.getView().getModel().getData());
				},
				error: function(error) {}
			});
		},

		onBeforeRendering: function() {

			var oDashBoard = new sap.ui.model.json.JSONModel();
			oDashBoard.setData({
				startDate: new Date()
			});

			// Get country list
			var country_URI = "/sap/opu/odata/sap/ZMM0687_PAM_SRV/countrylistSet?$format=json";
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "selectCountryList");
			var that = this;

			$.ajax({
				url: Common.fnGetURL(country_URI),
				method: "GET",
				success: function(oData) {
					that.getView().getModel("selectCountryList").setData(oData.d.results);
				},
				error: function(error) {}
			});
		},

		onAfterRendering: function() {

		},

		handleCountryChange: function() {
			listItems = [];
			let oAppoinment = this.getView().getModel("Appointment").getData();
			let getState_URI = `/sap/opu/odata/sap/ZMM0687_PAM_SRV/csdSet?$filter=CountryCode eq '${oAppoinment.Country}'&$format=json`;
			let that = this;
			let duplicate;

			$.ajax({
				url: Common.fnGetURL(getState_URI),
				method: "GET",
				success: function(oData) {
					if (oData.d.results.length === 0) {
						that.getView().getModel("Appointment").setProperty("/State", "");
						that.getView().getModel("selectStateList").setData(null);
						that.getView().getModel("selectDistrictList").setData(null);
					} else {
						let results = [];
						oData.d.results.forEach((item) => {
							if (item.CountryCode === that.getView().byId('select_country').getSelectedKey()) {
								duplicate = false;
								if (listItems.length === 0) {
									listItems.push(item);
									results.push({
										"StateCode": item.StateCode,
										"StateName": item.StateName
									});
								} else {
									listItems.forEach((itemList) => {
										if (itemList.StateCode === item.StateCode) {
											duplicate = true;
										}
									})
									if (duplicate === false) {
										// listItems.push(item);
										results.push({
											"StateCode": item.StateCode,
											"StateName": item.StateName
										});
									}
									listItems.push(item);
								}
							}
						});
						that.getView().getModel("selectStateList").setData(results);
					}
				},
				error: function(error) {}
			})
		},

		handleStateChange: function() {
			this.getView().getModel("selectDistrictList").setData(null);
			this.getView().getModel("selectHospitalList").setData(null);
			let results = [];
			let listItemsDistrict = [];

			// console.log(this.getView().byId('select_country').getSelectedKey());
			// console.log(this.getView().byId('select_state').getSelectedKey());

			listItems.forEach((item) => {
				if (item.CountryCode === this.getView().byId('select_country').getSelectedKey() && item.StateCode === this.getView().byId(
						'select_state').getSelectedKey()) {
					listItemsDistrict.push(item);
					results.push({
						"DistrictCode": item.DistrictCode,
						"DistrictName": item.DistrictName
					})
				}
			});
			this.getView().getModel("selectDistrictList").setData(results);
			// console.log(listItems);

		},

		handleDistrictChange: function() {
			// this.getView().setModel(new sap.ui.model.json.JSONModel(), "selectHospitalList");
			let results = [];

			let countryCode = this.getView().byId('select_country').getSelectedKey();
			let stateCode = this.getView().byId('select_state').getSelectedKey();
			let districtCode = this.getView().byId('select_district').getSelectedKey();

			// console.log(countryCode, stateCode, districtCode);
			var hospital_URI =
				`/sap/opu/odata/sap/ZMM0687_PAM_SRV/hospitalSet?$filter=CountryCode eq '${countryCode}' and StateCode eq '${stateCode}' and DistrictCode eq '${districtCode}'&$format=json`;
			// this.getView().setModel(new sap.ui.model.json.JSONModel());
			var that = this;

			$.ajax({
				url: Common.fnGetURL(hospital_URI),
				method: "GET",
				success: function(oData) {

					if (oData.d.results.length === 0) {
						that.getView().getModel("Appointment").setProperty("/DepartmentId", "");
					} else {}
					// that.getView().getModel().setData(oData.d);
					// console.log(oData.d);
					that.getView().getModel("selectHospitalList").setData(oData.d.results);
				},
				error: function(error) {}
			});
		},

		handleHospitalChange: function() {

			// let results = [];
			let listItems = [];

			let hospitalCode = this.getView().byId('select_hospital').getSelectedKey();
			// console.log(hospitalCode);
			var doctor_URI = `/sap/opu/odata/sap/ZMM0687_PAM_SRV/doctorSet?$filter=HospitalId eq '${hospitalCode}'&$format=json`;
			let that = this;
			let duplicate;
			$.ajax({
				url: Common.fnGetURL(doctor_URI),
				method: "GET",
				success: function(oData) {
					// that.getView().getModel().setData(oData.d);
					// console.log(oData.d);
					if (oData.d.results.length === 0) {
						that.getView().getModel("Appointment").setProperty("/HospitalId", "");
						// that.getView().getModel("selectStateList").setData(null);
						// that.getView().getModel("selectDistrictList").setData(null);
					} else {
						DocList = oData.d.results;
						let results = [];
						oData.d.results.forEach((item) => {
							if (item.HospitalId === that.getView().byId('select_hospital').getSelectedKey()) {
								duplicate = false;
								if (listItems.length === 0) {
									listItems.push(item);
									results.push({
										"DeptCode": item.DepartmentId,
										"DeptName": item.DepartmentName
									});
								} else {
									listItems.forEach((itemList) => {
										if (itemList.StateCode === item.StateCode) {
											duplicate = true;
										}
									});
									if (duplicate === false) {
										// listItems.push(item);
										results.push({
											"DeptCode": item.DepartmentId,
											"DeptName": item.DepartmentName
										});
									}
									listItems.push(item);
								}
							}
						});
						// that.getView().getModel("selectStateList").setData(results);
						that.getView().getModel("selectDepartmentList").setData(results);
					};
				},
				error: function(error) {}
			});
		},

		handleDepartmentChange: function() {
			let Doc = [];
			let deptSelected = this.getView().byId('select_department').getSelectedKey();
			DocList.forEach((item) => {
				if (item.DepartmentId === this.getView().byId('select_department').getSelectedKey()) {
					Doc.push({
						"DoctorID": item.DoctorId,
						"DoctorName": `Dr. ${item.FirstName} ${item.MiddleName} ${item.LastName}`
					});
				}
			});

			this.getView().getModel('selectDoctorList').setData(Doc);
		},

		handleAppointmentSelect: function(oEvent) {

			var oAppointment = oEvent.getParameter("appointment"),
				sDate,
				sStartTime,
				sEndTIme;

			console.log(oEvent.getParameter("appointment"));

			// sDate =
			// 	`${oAppointment.getStartDate().getDate()}/${oAppointment.getStartDate().getMonth()}/${oAppointment.getStartDate().getFullYear()}`;

			// console.log(oEvent.getParameter("appointment"));

			if (oAppointment) {
				var oSessioAppointment = this.getOwnerComponent().getModel("sessionAppointment").getData();

				// \nDoctor Namw: ${oAppointment.getDoctor()}
				// \nSpeciality: ${oAppointment.getDepartment()}
				// \nHospital Name: ${oAppointment.getHospital()}
				MessageBox.show(
					`Appointment Title\n${oAppointment.getTitle()}
					\nDescription\n${oAppointment.getDescription()}
					\nStart Date & Time: ${oAppointment.getStartDate().toLocaleDateString()} ${oAppointment.getStartDate().toLocaleTimeString()}
					\nEnd Date & Time: ${oAppointment.getEndDate().toLocaleDateString()} ${oAppointment.getEndDate().toLocaleTimeString()}`
					// \nDoctor Name: ${oAppointment.}
				);
			}
		},

		handleCreateAppointment: function() {

			var FormData = this.getView().getModel("Appointment").getData();
			// console.log(FormData);
			var SessionData = this.getOwnerComponent().getModel("accountSession").getData();
			// console.log(SessionData);
			var create_URI = "/sap/opu/odata/sap/ZMM0687_PAM_SRV/appointmentCreateSet";
			console.log(FormData.AppDate);
			var DateTimestamp = new Date(FormData.AppDate).getTime() + 100000000;
			console.log(DateTimestamp);
			console.log(new Date(DateTimestamp));
			var convertedDate = "/Date(" + DateTimestamp + ")/";

			const convertTime12to24 = (time12h) => {
				const [time, modifier] = time12h.split(' ');
				let [hours, minutes, seconds] = time.split(':');
				if (hours === '12') {
					hours = '00';
				}
				if (modifier === 'PM') {
					hours = parseInt(hours, 10) + 12;
				}
				// PT06H00M00S
				return `PT${hours}H${minutes}M${seconds}S`;
			}

			let FromTime = convertTime12to24(FormData.FromTime);
			let ToTime = convertTime12to24(FormData.ToTime);

			// console.log(FromTime, ToTime);
			// console.log(FromTime, ToTime);

			var oReqData = {
				CustomerId: SessionData.d.Id,
				DoctorId: FormData.DoctorId,
				HospitalId: FormData.HospitalId,
				DepartmentId: FormData.Department,
				AppointmentTitle: FormData.AppTitle,
				Country: FormData.Country,
				State: FormData.State,
				District: FormData.District,
				AppDate: convertedDate,
				FromTime: FromTime,
				ToTime: ToTime,
				Note: FormData.Note
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
					MessageBox.success("Appointment created successfully.");
					that.fetchAppointmentDashboard();
					// that.getOwnerComponent().getRouter().navTo("nCDashboard");
				},
				error: function(error) {
					console.log(error);
					// var errorMsg = "Failed to create Account!";
					// this.showDialogMsg(errorMsg, "Failed", ValueState.Error);
				}
			});
			this.pDialog.then(function(oDialog) {
				oDialog.close();
			});
		},

		handleViewChange: function() {
			this.changeStandardItemsPerView();
		},

		handleIconPress: function() {

			var oAppointment = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oAppointment, "Appointment");

			// Open Dialog
			if (!this.pDialog) {
				this.pDialog = this.loadFragment({
					name: "com.mavenPatients_Appointment_Management.fragments.AppointmentCreate"
				});
			}
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});

		},

		onCloseDialog: function() {
			// console.log(this.getView().getModel("Appointment").getData());
			this.byId("createAppDialogBox").close();
			this.getView().getModel("Appointment").setData({});
		},

		openDatePicker: function(oEvent) {
			this.getView().byId("HiddenDP").openBy(oEvent.getSource().getDomRef());
		},

		changeDateHandler: function(oEvent) {
			// console.log("Date selected: " + oEvent.getParameter("value"));
			var tempFormData = this.getView().getModel("Appointment").getData();
			tempFormData["AppDate"] = oEvent.getParameter("value");
			// console.log(tempFormData);
			this.getView().getModel("Appointment").setData(tempFormData);

		},

		openFTimePicker: function(oEvent) {
			this.getView().byId("HiddenTPFrom").openBy(oEvent.getSource().getDomRef());
		},

		openTTimePicker: function(oEvent) {
			this.getView().byId("HiddenTPTo").openBy(oEvent.getSource().getDomRef());
		},

		changeFTimeHandler: function(oEvent) {
			// console.log("Time selected: " + oEvent.getParameter("value"));
			var tempFormData = this.getView().getModel("Appointment").getData();
			tempFormData["FromTime"] = oEvent.getParameter("value");
			console.log(tempFormData);
			this.getView().getModel("Appointment").setData(tempFormData);
		},

		changeTTimeHandler: function(oEvent) {
			// console.log("Time selected: " + oEvent.getParameter("value"));
			var tempFormData = this.getView().getModel("Appointment").getData();
			tempFormData["ToTime"] = oEvent.getParameter("value");
			console.log(tempFormData);
			this.getView().getModel("Appointment").setData(tempFormData);
			// console.log(this.getView().getModel("Appointment").getData());

		},

		handleEscape: function() {
			this.pDialog.then(function(oDialog) {
				oDialog.close();
			});
		}

	});

});