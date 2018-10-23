export enum OrderStatus {
	RESERVED = "Reserved",
	ORDERED = "Ordered",
	PAID = "Paid",
	SENT = "Sent",
	COMPLETED = "Completed",
	CANCELLED = "Cancelled",
	REFUSED = "Refused",
	UNDER_APPROVAL = "UnderApproval",
	PAYMENT_REQUESTED = "PaymentRequested",
	PARTICIPATED = "Participated"
}

export const OrderStatusList: OrderStatus[] = [
	OrderStatus.RESERVED,
	OrderStatus.ORDERED,
	OrderStatus.PAYMENT_REQUESTED,
	OrderStatus.PAID,
	OrderStatus.SENT,
	OrderStatus.COMPLETED,
	OrderStatus.PARTICIPATED,
	OrderStatus.CANCELLED,
	OrderStatus.REFUSED,
	OrderStatus.UNDER_APPROVAL,
];

export type OrderStatusMap = {
	[P in OrderStatus]: { value: number; label: string; };
}

export const orderStatusMap: OrderStatusMap = {
	[OrderStatus.RESERVED]: {
		value: 0,
		label: "Reserviert"
	},
	[OrderStatus.ORDERED]: {
		value: 1,
		label: "Bestellt"
	},
	[OrderStatus.PAID]: {
		value: 2,
		label: "Bezahlt"
	},
	[OrderStatus.SENT]: {
		value: 3,
		label: "Verschickt"
	},
	[OrderStatus.COMPLETED]: {
		value: 4,
		label: "Abgeschlossen"
	},
	[OrderStatus.CANCELLED]: {
		value: 5,
		label: "Abgebrochen"
	},
	[OrderStatus.REFUSED]: {
		value: 6,
		label: "Abgelehnt"
	},
	[OrderStatus.UNDER_APPROVAL]: {
		value: 7,
		label: "Unter Begutachtung"
	},
	[OrderStatus.PAYMENT_REQUESTED]: {
		value: 8,
		label: "Bezahlung angefordert"
	},
	[OrderStatus.PARTICIPATED]: {
		value: 9,
		label: "Teilgenommen"
	}
};

export function statusToInt(status: OrderStatus): number {
	return orderStatusMap[status].value;
}

export function orderStatusToString(status: OrderStatus): string {
	return orderStatusMap[status].label;
}


export const OrderStatusStringList: string[] = OrderStatusList
	.map(status => orderStatusToString(status));
export const OrderStatusIntList: number[] = OrderStatusList
	.map(status => statusToInt(status));

export const OrderStatusPairList: { status: OrderStatus, text: string }[] = OrderStatusList
	.map(status => ({
		status,
		text: orderStatusToString(status)
	}));
