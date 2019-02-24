import {UserPermissions} from "./permission";

export interface Link {
	route: string;
	icon: string;
	name: string;
	//todo synonyms?
	link?: string;
	loginNeeded?: boolean;
	minimumPermission?: UserPermissions;
	drawLineAbove?: boolean;
	children?: Link[];
}
