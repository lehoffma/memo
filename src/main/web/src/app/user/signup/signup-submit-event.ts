import {SignUpSection} from "./signup-section";
import {PaymentInfo} from "./payment-methods-form/debit-input-form/payment-info";

export interface SignUpSubmitEvent {
	section: SignUpSection,
	email?: string,
	passwordHash?: string,
	firstName?: string,
	surname?: string,
	birthday?: Date,
	telephone?: string,
	mobile?: string,
	isStudent?: boolean,
	imagePath?: string,
	profilePicture?: FormData,
	paymentInfo?: PaymentInfo
}
