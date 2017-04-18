import {ClubRole} from "./club-role";
import {UserPermissions, visitorPermissions} from "./permission";
import {ImmutableObject} from "./immutable-object";


export class User extends ImmutableObject<User> {
	/**
	 *
	 * @param id Die ID des Users (nur zwischen Usern einzigartig)
	 * @param firstName Vorname des Users, z.B. "Le"
	 * @param surname Nachname des Users, z.B. "Hoffmann"
	 * @param birthDate Geburtstag des Users, z.B. "20.04.1889"
	 * @param telephone Handy oder Festnetznummer mit oder ohne Trennzeichen zwischen Vorwahl und Rest, z.B. "0151/18656036"
	 * @param clubRole Die Rolle des Users innerhalb des Vereins, z.B. Vorstand
	 * @param permissions Auf was der User zugreifen darf (kosten, schreibrechte für events etc)
	 * @param miles Die vom User bisher gefahreren Meilen
	 * @param email die Email des Users, z.B. "gzae@gmx.net"
	 * @param passwordHash /
	 * @param isStudent ob der User ein Student is (Studenten bekommen einen Discount)
	 * @param hasDebitAuth ob der User Lastschrift Verfahren als Bezahlmethode ausgewählt hat
	 * @param imagePath der Pfad des Profilbild
	 */
	constructor(public readonly id: number,
				public readonly firstName: string,
				public readonly surname: string,
				public readonly birthDate: Date,
				public readonly telephone: string,
				public readonly clubRole: ClubRole,
				public readonly permissions: UserPermissions,
				public readonly miles: number,
				public readonly email: string,
				public readonly passwordHash: string,
				public readonly isStudent: boolean,
				public readonly hasDebitAuth: boolean,
				public readonly imagePath: string) {
		super(id);
	}

	static create() {
		return new User(-1, "", "", null, "", ClubRole.None, visitorPermissions, 0, "", "", false, false, "");
	}
}
