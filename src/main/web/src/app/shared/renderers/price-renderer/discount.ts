export enum ConditionType {
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

export function getDiscountedPrice(basePrice: number, discounts: Discount[]): number {
	const discountedValue = discounts
	//non-percentage discounts first, then sort by id
		.sort((a, b) => {
			if (a.isPercentage === b.isPercentage) {
				return b.id - a.id;
			}

			if (a.isPercentage && !b.isPercentage) {
				return -1;
			}
			if (!a.isPercentage && b.isPercentage) {
				return 1;
			}
			return 0;
		})
		.reduce((price, discount) => {
			if (discount.isPercentage) {
				return price - price * discount.amount;
			}
			return price - discount.amount;
		}, basePrice);

	return Math.max(discountedValue, 0);
}

export function getDiscountAmount(price: number, discounts: Discount[]): number{
	return Math.abs(getDiscountedPrice(price, discounts) - price)
}
