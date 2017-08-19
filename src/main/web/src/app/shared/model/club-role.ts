import {UserPermissions} from "./permission";

export enum ClubRole{
	Admin = <any> "Admin",
	Kassenwart = <any> "Kassenwart",
	Organizer = <any> "Organizer", //todo umbenennen?
	Schriftfuehrer = <any> "Schriftführer",
	Vorstand = <any> "Vorstand",
	Mitglied = <any> "Mitglied",
	None = <any> "None"
}

//todo clubrole with 0-5 values

function clubRoles() {
	return [ClubRole.None, ClubRole.Mitglied, ClubRole.Vorstand, ClubRole.Schriftfuehrer,
		ClubRole.Kassenwart, ClubRole.Organizer, ClubRole.Admin];
}


export const rolePermissions: { [role: string]: UserPermissions } = {
	"None": {
		funds: 0,
		party: 1,
		user: 0,
		merch: 0,
		tour: 1,
		stock: 0,
		settings: 0
	},
	"Mitglied": {
		funds: 0,
		party: 1,
		user: 0,
		merch: 1,
		tour: 1,
		stock: 0,
		settings: 0
	},
	"Vorstand": {
		funds: 1,
		party: 2,
		user: 3,
		merch: 2,
		tour: 1,
		stock: 3,
		settings: 1
	},
	"Schriftfuehrer": {
		funds: 1,
		party: 2,
		user: 3,
		merch: 2,
		tour: 1,
		stock: 3,
		settings: 1
	},
	"Kassenwart": {
		funds: 4,
		party: 2,
		user: 3,
		merch: 2,
		tour: 1,
		stock: 3,
		settings: 1
	},
	"Organizer": {
		funds: 3,
		party: 4,
		user: 3,
		merch: 4,
		tour: 4,
		stock: 4,
		settings: 1
	},
	"Admin": {
		funds: 5,
		party: 5,
		user: 5,
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
