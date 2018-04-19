import {ClubRole, rolePermissions} from "./club-role";
import {Permission, UserPermissions, visitorPermissions} from "./permission";
import {BaseObject} from "./util/base-object";
import {Gender} from "./gender";
import {Event} from "../../shop/shared/model/event";


export class User extends BaseObject<User> {
	/**
	 *
	 * @param id Die ID des Users (nur zwischen Usern einzigartig)
	 * @param firstName Vorname des Users, z.B. "Le"
	 * @param surname Nachname des Users, z.B. "Hoffmann"
	 * @param gender Das Geschlecht des Users, z.B. Gender.MALE
	 * @param birthday Geburtstag des Users, z.B. "20.04.1889"
	 * @param telephone Handy oder Festnetznummer mit oder ohne Trennzeichen zwischen Vorwahl und Rest, z.B. "0151/18656036"
	 * @param mobile
	 * @param clubRole Die Rolle des Users innerhalb des Vereins, z.B. Vorstand
	 * @param joinDate das Eintrittsdatum des Users
	 * @param addresses Die ID der Adresse des Nutzers
	 * @param authoredItems
	 * @param reportResponsibilities
	 * @param bankAccounts
	 * @param permissions Auf was der User zugreifen darf (kosten, schreibrechte für events etc)
	 * @param miles Die vom User bisher gefahreren Meilen
	 * @param email die Email des Users, z.B. "gzae@gmx.net"
	 * @param password /
	 * @param isWoelfeClubMember ob der User Woelfemitglied ist
	 * @param hasSeasonTicket ob der User eine Dauerkarte besitzt
	 * @param isStudent ob der User ein Student is (Studenten bekommen einen Discount)
	 * @param hasDebitAuth ob der User Lastschrift Verfahren als Bezahlmethode ausgewählt hat
	 * @param images
	 */
	constructor(public readonly id: number,
				public readonly firstName: string,
				public readonly surname: string,
				public readonly gender: Gender,
				public readonly birthday: Date,
				public readonly telephone: string,
				public readonly mobile: string,
				public readonly clubRole: ClubRole,
				public readonly joinDate: Date,
				public readonly addresses: number[],
				public readonly authoredItems: Event[],
				public readonly reportResponsibilities: number[],
				public readonly bankAccounts: number[],
				public readonly permissions: UserPermissions,
				public readonly miles: number,
				public readonly email: string,
				public readonly password: string,
				public readonly isWoelfeClubMember: boolean,
				public readonly hasSeasonTicket: boolean,
				public readonly isStudent: boolean,
				public readonly hasDebitAuth: boolean,
				public readonly images: string[]) {
		super(id);
	}


	get userPermissions() {
		//closure to avoid recalculating the value all the time
		let _userPermissions: UserPermissions;
		return () => {
			if (!_userPermissions) {
				let userPermissions = this.permissions;
				let clubRolePermissions = rolePermissions[this.clubRole];
				//combine both permission states
				_userPermissions = Object.keys(visitorPermissions).reduce((permissions, key) => {
					permissions[key] = Math.max(permissions[key],
						userPermissions[key] || Permission.none,
						clubRolePermissions[key] || Permission.none
					);
					return permissions;
				}, {...visitorPermissions});
			}
			return _userPermissions;
		}
	}

	static create() {
		return new User(-1, "", "", Gender.OTHER, null, "", "",
			null, new Date(), [], [], [], [],
			null, 0, "", "", false, false, false, false, ["resources/images/Logo.png"]);
	}

	static isUser(user: any): user is User {
		return user && (<User>user).email !== undefined;
	}
}
