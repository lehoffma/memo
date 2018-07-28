export interface Discount {
	amount: number;
	reason: string;
	eligible: boolean;
	showLink: boolean;
	link?: {
		url: string;
		text: string;
	}
}
