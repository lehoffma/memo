import {ClubRole, isAuthenticated} from "../shared/model/club-role";
import {Permission} from "../shared/model/permission";
import {Event} from "../shop/shared/model/event";
import {EventUtilityService} from "../shared/services/event-utility.service";
import {User, userPermissions} from "../shared/model/user";
import {isBefore} from "date-fns";


export function canCheckIn(user: User, event: Event) {
	return isAuthenticated(user === null
		? ClubRole.Gast
		: user.clubRole, event.expectedCheckInRole);
}

export function canEdit(user: User, event: Event) {
	if (user !== null && event !== null) {
		const permissions = userPermissions(user);
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

export function canConclude(user: User, event: Event) {
	if (user !== null && event !== null) {
		return !EventUtilityService.isMerchandise(event) && isBefore(event.date, new Date()) && event.author.includes(user.id);
	}
	return false;
}

export function canReadEntries(user: User, event: Event) {
	if (user !== null && event !== null) {
		let permissions = userPermissions(user);
		return permissions.funds >= Permission.read;
	}
	return false;
}

export function canDeleteEntries(user: User, event: Event) {
	if (user !== null && event !== null) {
		const permissions = userPermissions(user);
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
