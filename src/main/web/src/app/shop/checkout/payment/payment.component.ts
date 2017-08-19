import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {PaymentMethod} from "./payment-method";

declare var IBAN;
declare var paypal;

@Component({
	selector: "memo-payment",
	templateUrl: "./payment.component.html",
	styleUrls: ["./payment.component.scss"]
})
export class PaymentComponent implements OnInit {
	selectedMethod: PaymentMethod;
	paymentMethodEnum = PaymentMethod;
	dataModel = {
		firstName: "",
		surname: "",
		IBAN: "",
		BIC: ""
	};

	@Output() done: EventEmitter<{
		method: PaymentMethod,
		data: any
	}> = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
		//todo https://developer.paypal.com/demo/checkout/#/pattern/client
		paypal.Button.render({
			env: "sandbox", // 'production' Or 'sandbox',

			// PayPal Client IDs - replace with your own
			// Create a PayPal app: https://developer.paypal.com/developer/applications/create
			client: {
				sandbox: "AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R",
				production: "<insert production client id>"	//todo generate client ID
			},

			commit: true, // Show a 'Pay Now' button

			style: {
				label: "pay", // checkout | credit | pay
				size: "medium",    // small | medium | responsive
				shape: "rect", //pill | rect
				color: "blue"      // gold | blue | silver
			},


			payment: function (data, actions) {
				// Set up the payment here

				// Make a call to the REST api to create the payment
				return actions.payment.create({
					payment: {
						transactions: [
							{
								amount: {total: "0.01", currency: "EUR"}	//todo total
							}
						]
					}
				});
			},

			// onAuthorize() is called when the buyer approves the payment
			onAuthorize: function (data, actions) {

				// Make a call to the REST api to execute the payment
				return actions.payment.execute().then(function () {
					window.alert("Payment Complete!");
				});
			},

		}, "#paypal-button");
	}

	/**
	 *
	 * @param {PaymentMethod} method
	 */
	updateSelectedMethod(method: PaymentMethod) {
		this.selectedMethod = method;
	}

	/**
	 *
	 */
	emitDoneEvent() {
		this.done.emit({
			method: this.selectedMethod,
			data: this.dataModel
		})
	}

	isValidIBAN(iban: string) {
		return IBAN.isValid(iban);
	}
}
