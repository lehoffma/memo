export interface AccountingState {
	timestamp?: Date,

	currentBalance: number;
	lastMonthChange: number;

	tourTotal: number;
	tourChange: number;

	partyTotal: number;
	partyChange: number;

	merchTotal: number;
	merchChange: number

	itemTotals: ItemCostPreview[];

	monthlyChanges: {
		month: Date,
		totalBalance: number;
	}[];
}

export interface DatePreview {
	date: Date,
	totalBalance: number;
}

export interface ItemCostPreview {
	totalBalance: number;
	itemTitle: string;
	itemId: number;
}
