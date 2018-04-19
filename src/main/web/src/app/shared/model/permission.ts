export enum Permission {
	admin = 5,
	//	todo: umbenennen, da delete ein reserved keyword in javascript is/sein wird
	delete = 4,
	create = 3,
	write = 2,
	read = 1,
	none = 0
}

export interface UserPermissions {
	readonly funds: Permission,
	readonly party: Permission,
	readonly userManagement: Permission,
	readonly merch: Permission,
	readonly tour: Permission,
	readonly stock: Permission,
	readonly settings: Permission
}

export function jsonToPermissions(jsonPermissions): UserPermissions {
	return {
		funds: jsonPermissions["funds"],
		party: jsonPermissions["party"],
		userManagement: jsonPermissions["userManagement"],
		merch: jsonPermissions["merch"],
		tour: jsonPermissions["tour"],
		stock: jsonPermissions["stock"],
		settings: jsonPermissions["settings"]
	};
}


export const visitorPermissions: UserPermissions = {
	userManagement: Permission.none,
	tour: Permission.read,
	party: Permission.read,
	merch: Permission.read,
	funds: Permission.none,
	stock: Permission.none,
	settings: Permission.none
};

export const adminPermissions: UserPermissions = {
	userManagement: Permission.admin,
	tour: Permission.admin,
	party: Permission.admin,
	merch: Permission.admin,
	funds: Permission.admin,
	stock: Permission.admin,
	settings: Permission.admin
}
