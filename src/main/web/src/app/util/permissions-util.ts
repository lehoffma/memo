import {ClubRole, isAuthenticated} from "../shared/model/club-role";
import {Permission} from "../shared/model/permission";
import {Event} from "../shop/shared/model/event";
import {EventUtilityService} from "../shared/services/event-utility.service";
import {User} from "../shared/model/user";


export function canCheckIn(user: User, event: Event) {
	return isAuthenticated(user === null
		? ClubRole.Gast
		: user.clubRole, event.expectedCheckInRole);
}

export function canEdit(user: User, event: Event) {
	if (user !== null && event !== null) {
		const permissions = user.userPermissions;
		const permissionKey = EventUtilityService.handleShopItem(event,
			() => "merch", () => "tour", () => "party"
		);
		if (permissionKey) {
			return permissions[permissionKey] >= Permission.write
				|| isAuthenticated(user.clubRole, event.expectedWriteRole);
		}
	}
	return false;
}

export function canReadEntries(user: User, event: Event) {
	if (user !== null && event !== null) {
		let permissions = user.userPermissions;
		return permissions.funds >= Permission.read;
	}
	return false;
}

export function canDeleteEntries(user: User, event: Event) {
	if (user !== null && event !== null) {
		const permissions = user.userPermissions;
		const permissionKey = EventUtilityService.handleShopItem(event,
			() => "merch", () => "tour", () => "party"
		);
		if (permissionKey) {
			return permissions[permissionKey] >= Permission.delete
				|| isAuthenticated(user.clubRole, event.expectedWriteRole);
		}
	}
	return false;
}
