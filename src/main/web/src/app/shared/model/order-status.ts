export enum OrderStatus {
	RESERVED,
	ORDERED,
	PAID,
	SENT,
	COMPLETED,
	CANCELLED,
	REFUSED,
	UNDER_APPROVAL
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
			return "Bestelltt"
	}
}
