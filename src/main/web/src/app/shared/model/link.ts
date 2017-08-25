import {UserPermissions} from "./permission";

export class Link {
	constructor(public route: string,
				public icon: string,
				public name: string,
				public loginNeeded?: boolean,
				public minimumPermission?: UserPermissions,
				public drawLineAbove?: boolean,
				public children?: Link[]) {

	}
}
