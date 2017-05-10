export enum ClubRole{
	Admin = <any> "Admin",
	Kasse = <any> "Kassenwart",
	Organizer = <any> "Organizer",
	Vorstand = <any> "Vorstandsmitglied",
	Mitglied = <any> "Mitglied",
	None = <any> "Kein Mitglied"
}

function clubRoles() {
	return [ClubRole.None, ClubRole.Mitglied, ClubRole.Vorstand, ClubRole.Organizer, ClubRole.Kasse, ClubRole.Admin];
}

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
