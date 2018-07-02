export enum OrderStatus {
	RESERVED = "Reserved",
	ORDERED = "Ordered",
	PAID = "Paid",
	SENT = "Sent",
	COMPLETED = "Completed",
	CANCELLED = "Cancelled",
	REFUSED = "Refused",
	UNDER_APPROVAL = "UnderApproval"
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

export function statusToInt(status: OrderStatus): number {

	switch (status) {
		case OrderStatus.RESERVED:
			return 0;
		case OrderStatus.ORDERED:
			return 1;
		case OrderStatus.PAID:
			return 2;
		case OrderStatus.SENT:
			return 3;
		case OrderStatus.COMPLETED:
			return 4;
		case OrderStatus.CANCELLED:
			return 5;
		case OrderStatus.REFUSED:
			return 6;
		case OrderStatus.UNDER_APPROVAL:
			return 7;
	}

}

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
