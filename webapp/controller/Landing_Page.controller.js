sap.ui.define([
	"com/mavenPatients_Appointment_Management/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("com.mavenPatients_Appointment_Management.controller.Landing_Page", {

		onInit: function() {
			var oModelSess = new sap.ui.model.json.JSONModel();
			this.getOwnerComponent().setModel(oModelSess, "accountSession");
			// console.log(this.getOwnerComponent().getModel("accountSession").getData());

			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "LandingData");

			this.getView().getModel("LandingData").setData({
				introduction: {
					title: "Introduction",
					content: "\tThe need for healthcare services is growing with the increase in population and the number of patients who seek health care at hospitals, medical facilities, holistic groups, and physicians practice has improved significantly.\n\n\tThese bring a new set of challenges for the staff of the facility and administrators.Online scheduling software, a recent technological advancement, has made the booking process in hospitals easier for both patients and administrative staffs."
				},
				hero1: {
					title: "What are the advantages of Online Scheduling System?",
					content: "\tThe online scheduling systems are also known in many names such as online booking application, online scheduler, online scheduling software, and more. It is one of the most commonly used web-based applications and enables individuals to securely and conveniently book their reservations and requests online via a laptop, tablet, smartphone, computer, and other web-connected devices.\n\n\tAnyone can access the online appointment management system via the URL provided by the healthcare or medical facility or through a“ Book Now” button in the website.Once the time and date are selected, the system confirms the bookings automatically and also records it within the system instantly without any intervention from the staff.\n\n\tThe online appointment management system also comes with features like automated text and email message reminders, which is sent to the booked patients or individuals on the date booked before their scheduled time of booking.The flexibility of the online appointment management system in healthcare includes\n- Booking inoculations and vaccine in hospitals.\n- Scheduling a patient’ s treatment, services, and appointments."
				},
				hero2: {
					title: "Watch the benefits of getting your appointments handled"
				}
			});

			// console.log(this.getView().getModel("LandingData").getData());
		},

		handleGetStarted: function() {
			this.getOwnerComponent().getRouter().navTo("nSignIn");

		}
	});
});