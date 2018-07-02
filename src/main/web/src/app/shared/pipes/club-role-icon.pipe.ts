import {Pipe, PipeTransform} from "@angular/core";
import {getIcon} from "../utility/icons/clubrole-icon";
import {ClubRole} from "../model/club-role";

@Pipe({
	name: "clubRoleIcon"
})
export class ClubRoleIconPipe implements PipeTransform {

	transform(value: ClubRole, args?: any): any {
		return getIcon(value)
	}

}
