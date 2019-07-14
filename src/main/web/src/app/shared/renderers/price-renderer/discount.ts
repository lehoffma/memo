
export enum ConditionType{
	minMaxPrice,
	minMaxDate,
	minMaxNumber,
	userList,
	itemList,
	itemTypeList,
	clubRoleList,
	boolean,
}




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

	discountStart: string;
	discountEnd: string;

	items: number[];
	minPrice: number;
	maxPrice: number;
	itemTypes: number[];
	minMiles: number;
	maxMiles: number;
}

