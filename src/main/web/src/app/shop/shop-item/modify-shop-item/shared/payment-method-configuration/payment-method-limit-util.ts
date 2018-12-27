export function numberLimitToString(limit: number): string {
	return (limit <= 0) ? "Kein Limit" : ("" + limit)
}


export function stringToNumberLimit(limit: string): number {
	return (limit === "Kein Limit" ? -1 : +limit);
}
