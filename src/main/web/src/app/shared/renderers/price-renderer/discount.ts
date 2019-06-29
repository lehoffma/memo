export interface Discount {
	id: number;
	amount: number;
	isPercentage: boolean;
	outdated: boolean;
	linkUrl?: string;
	linkText?: string;
	reason: string;
	limitPerUserAndItem: number;

	users: number[];
	minAge: number;
	maxAge: number;
	minMembershipDurationInDays: number;
	maxMembershipDurationInDays: number;
	clubRoles: string[];
	woelfeClubMembership: boolean;
	seasonTicket: boolean;
	isStudent: boolean;

	items: number[];
	discountStart: string;
	discountEnd: string;

	minPrice: number;
	maxPrice: number;
	itemTypes: number[];
	minMiles: number;
	maxMiles: number;
}

