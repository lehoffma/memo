import {ClubRole} from "../../model/club-role";

export function getIcon(role: ClubRole): string {
	switch (role) {
		case ClubRole.Admin:
			return "grade";
		case ClubRole.Kassenwart:
			return "attach_money";
		case ClubRole.Mitglied:
			return "account_box";
		case ClubRole.Organisator:
			return "assignment";
		case ClubRole.Vorstand:
			return "gavel";
		case ClubRole.Gast:
			return "do_not_disturb";
	}
}
