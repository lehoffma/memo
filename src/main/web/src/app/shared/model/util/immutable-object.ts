import {ClubRole} from "../club-role";
import {jsonToPermissions, UserPermissions} from "../permission";
export abstract class ImmutableObject<T extends ImmutableObject<T>> {

	constructor(public readonly id: number) {

	}

	isString(value: any): value is string {
		return typeof value === "string" || value instanceof String
	}

	isNumber(value: any): value is number {
		return !isNaN(parseFloat(value)) && isFinite(value);
	}

	/**
	 * @param properties
	 * @returns {Address} this
	 */
	setProperties(properties: Partial<T>) {
		Object.keys(properties)
			.forEach(key => {
				let value: (string | number | Date | UserPermissions) = (<any>properties)[key];
				if (key === "date" && this.isString(value)) {
					value = Date.parse(value);
				} else if (this.isNumber(value)) {
					value = +value;
				} else if (key === "expectedRole") {
					value = ClubRole[(<any>properties)["expectedRole"]]
				} else if (key === "clubRole") {
					value = ClubRole[(<any>properties)["clubRole"]];
				} else if (key === "permissions") {
					value = jsonToPermissions((<any>properties)["permissions"]);
				}
				this[key] = value;
			});
		return this;
	}


	/**
	 * Geht alle Attribute des Objektes durch und gibt true zurück, wenn der Wert mindestens eines Attributes auf den
	 * Suchbegriff matcht. Der Default-Wert des Suchbegriffs ist dabei "", für welchen immer true
	 * zurückgegeben wird (der leere String ist Teilstring von jedem String).
	 * @param searchTerm
	 * @returns {string[]}
	 */
	matchesSearchTerm(searchTerm: string = ""): boolean {
		return Object.keys(this).some(key => ("" + this[key]).includes(searchTerm));
	}
}
