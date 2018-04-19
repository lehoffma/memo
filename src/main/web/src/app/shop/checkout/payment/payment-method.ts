export enum PaymentMethod {
	CASH = <any> "Bar",
	// PAYPAL = <any> "Paypal",
	TRANSFER = <any> "Überweisung",
	DEBIT = <any> "Lastschrift"
}

const paymentMethodMap = {
	0: PaymentMethod.CASH,
	1: PaymentMethod.DEBIT,
	2: PaymentMethod.TRANSFER,
	// 3: PaymentMethod.PAYPAL
};

export function toPaymentMethod(index: number) {
	return paymentMethodMap[index];
}

export function paymentMethodList() {
	return Object.keys(paymentMethodMap).map(key => paymentMethodMap[key]);
}
