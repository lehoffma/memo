export enum OrderStatus {
	RESERVED = "Reserved",
	ORDERED = "Ordered",
	PAYMENT_REQUESTED = "PaymentRequested",
	PAID = "Paid",
	SENT = "Sent",
	COMPLETED = "Completed",
	PARTICIPATED = "Participated",
	CANCELLED = "Cancelled",
	REFUSED = "Refused",
	UNDER_APPROVAL = "UnderApproval",
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
	[P in OrderStatus]: { value: number; label: string; tooltip: string; };
}

//todo help texts (part of issue #199)
export const orderStatusMap: OrderStatusMap = {
	[OrderStatus.RESERVED]: {
		value: 0,
		label: "Reserviert",
		tooltip: "",
	},
	[OrderStatus.ORDERED]: {
		value: 1,
		label: "Bestellt",
		tooltip: "",
	},
	[OrderStatus.PAID]: {
		value: 2,
		label: "Bezahlt",
		tooltip: "",
	},
	[OrderStatus.SENT]: {
		value: 3,
		label: "Verschickt",
		tooltip: "",
	},
	[OrderStatus.COMPLETED]: {
		value: 4,
		label: "Abgeschlossen",
		tooltip: "",
	},
	[OrderStatus.CANCELLED]: {
		value: 5,
		label: "Storniert",
		tooltip: "Dieses Item wurde vom Nutzer storniert.",
	},
	[OrderStatus.REFUSED]: {
		value: 6,
		label: "Abgelehnt",
		tooltip: "",
	},
	[OrderStatus.UNDER_APPROVAL]: {
		value: 7,
		label: "Unter Begutachtung",
		tooltip: "",
	},
	[OrderStatus.PAYMENT_REQUESTED]: {
		value: 8,
		label: "Bezahlung angefordert",
		tooltip: "",
	},
	[OrderStatus.PARTICIPATED]: {
		value: 9,
		label: "Teilgenommen",
		tooltip: "",
	}
};

export function statusToInt(status: OrderStatus): number {
	return orderStatusMap[status].value;
}

export function orderStatusToString(status: OrderStatus): string {
	return orderStatusMap[status].label;
}

export function orderStatusTooltip(status: OrderStatus): string {
	return orderStatusMap[status].tooltip;
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
