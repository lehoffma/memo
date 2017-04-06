export interface ShoppingCartItem {
	id: number,
	amount: number,
	options?: {
		size?: string,
		color?: string,
	}
}
