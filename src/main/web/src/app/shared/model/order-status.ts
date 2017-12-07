export enum OrderStatus {
	RESERVED = <any>"0",
	ORDERED = <any>"1",
	PAID = <any>"2",
	SENT = <any>"3",
	COMPLETED = <any>"4",
	CANCELLED = <any>"5",
	REFUSED = <any>"6",
	UNDER_APPROVAL = <any>"7"
}

export const OrderStatusList: OrderStatus[] = [
	OrderStatus.RESERVED,
	OrderStatus.ORDERED,
	OrderStatus.PAID,
	OrderStatus.SENT,
	OrderStatus.COMPLETED,
	OrderStatus.CANCELLED,
	OrderStatus.REFUSED,
	OrderStatus.UNDER_APPROVAL
];

export const OrderStatusStringList: string[] = OrderStatusList
	.map(status => orderStatusToString(status));

export const OrderStatusPairList: { status: OrderStatus, text: string }[] = OrderStatusList
	.map(status => ({
		status,
		text: orderStatusToString(status)
	}));

export function orderStatusToString(status: OrderStatus): string {
	switch (status) {
		case OrderStatus.RESERVED:
			return "Reserviert";
		case OrderStatus.PAID:
			return "Bezahlt";
		case OrderStatus.SENT:
			return "Verschickt";
		case OrderStatus.CANCELLED:
			return "Abgebrochen";
		case OrderStatus.REFUSED:
			return "Abgelehnt";
		case OrderStatus.UNDER_APPROVAL:
			return "Unter Begutachtung";
		case OrderStatus.COMPLETED:
			return "Abgeschlossen";
		case OrderStatus.ORDERED:
			return "Bestellt"
	}
}
