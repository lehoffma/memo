import {UserPermissions} from "./permission";

export enum ClubRole {
	Admin = "Admin",
	Kassenwart = "Kassenwart",
	Organisator = "Organisator",
	Schriftfuehrer = "Schriftführer",
	Vorstand = "Vorstand",
	Mitglied = "Mitglied",
	Gast = "Gast"
}

/*

	@SerializedName("2")
	Vorstand,
	@SerializedName("3")
	Schriftführer,
	@SerializedName("4")
	Kassenwart,
	@SerializedName("5")
	Organisator,
	@SerializedName("6")
	Admin

 */

export function idToClubRoleEnum(clubRole: number): ClubRole {
	switch (clubRole) {
		case 0:
			return ClubRole.Gast;
		case 1:
			return ClubRole.Mitglied;
		case 2:
			return ClubRole.Vorstand;
		case 3:
			return ClubRole.Schriftfuehrer;
		case 4:
			return ClubRole.Kassenwart;
		case 5:
			return ClubRole.Organisator;
		case 6:
			return ClubRole.Admin;
	}
}

export function clubRoles() {
	return [ClubRole.Gast, ClubRole.Mitglied, ClubRole.Vorstand, ClubRole.Schriftfuehrer,
		ClubRole.Kassenwart, ClubRole.Organisator, ClubRole.Admin];
}


export const rolePermissions: { [role: string]: UserPermissions } = {
	[ClubRole.Gast]: {
		funds: 0,
		party: 1,
		userManagement: 0,
		merch: 0,
		tour: 1,
		stock: 0,
		settings: 0
	},
	[ClubRole.Mitglied]: {
		funds: 0,
		party: 1,
		userManagement: 0,
		merch: 1,
		tour: 1,
		stock: 0,
		settings: 0
	},
	[ClubRole.Vorstand]: {
		funds: 1,
		party: 2,
		userManagement: 3,
		merch: 2,
		tour: 1,
		stock: 3,
		settings: 1
	},
	[ClubRole.Schriftfuehrer]: {
		funds: 1,
		party: 2,
		userManagement: 3,
		merch: 2,
		tour: 1,
		stock: 3,
		settings: 1
	},
	[ClubRole.Kassenwart]: {
		funds: 4,
		party: 2,
		userManagement: 3,
		merch: 2,
		tour: 1,
		stock: 3,
		settings: 1
	},
	[ClubRole.Organisator]: {
		funds: 3,
		party: 4,
		userManagement: 3,
		merch: 4,
		tour: 4,
		stock: 4,
		settings: 1
	},
	[ClubRole.Admin]: {
		funds: 5,
		party: 5,
		userManagement: 5,
		merch: 5,
		tour: 5,
		stock: 5,
		settings: 5
	}
};

/**
 *
 * @param userRole Rolle des Users bzw die Rolle, welche überprüft werden soll
 * @param minimumRole die Rolle, die die gegebene Rolle mindestens erreichen soll
 * @returns {boolean}
 */
export function isAuthenticated(userRole: ClubRole, minimumRole: ClubRole) {
	const hierarchy = clubRoles();
	return hierarchy.indexOf(userRole) >= hierarchy.indexOf(minimumRole);
}
