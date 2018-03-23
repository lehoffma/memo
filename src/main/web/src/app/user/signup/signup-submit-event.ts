import {SignUpSection} from "./signup-section";
import {PaymentInfo} from "./payment-methods-form/debit-input-form/payment-info";
import {ImageToUpload} from "../../shared/multi-image-upload/multi-image-upload.component";
import {User} from "../../shared/model/user";

export interface SignUpSubmitEvent extends Partial<User>{
	section: SignUpSection,
	images?: any,
	paymentInfo?: PaymentInfo
}
