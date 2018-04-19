export interface Discount {
	amount: number;
	reason: string;
	eligible: boolean;
	link?: {
		url: string;
		text: string;
	}
}
