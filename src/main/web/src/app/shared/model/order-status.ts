

export enum OrderStatus{
	NONE,
	PROCESSING,
	DONE
}

export function orderStatusToString(status: OrderStatus):string{
	switch(status){
		case OrderStatus.NONE:
			return "Noch nicht bearbeitet.";
		case OrderStatus.DONE:
			return "Abgeschlossen.";
		case OrderStatus.PROCESSING:
			return "Wird bearbeitet."
	}
}
