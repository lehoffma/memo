import {PaymentInfo} from "./payment-methods-form/debit-input-form/payment-info";
import {User} from "../../shared/model/user";

export interface SignUpSubmitEvent extends Partial<User> {
	images?: any,
	paymentInfo?: PaymentInfo
}
