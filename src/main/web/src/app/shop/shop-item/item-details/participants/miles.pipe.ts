import {Pipe, PipeTransform} from "@angular/core";
import {MilesListEntry, MilesService} from "../../../../shared/services/api/miles.service";
import {User} from "../../../../shared/model/user";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Pipe({
	name: "miles"
})
export class MilesPipe implements PipeTransform {

	constructor(private milesService: MilesService) {
	}


	transform(user: User): Observable<number> {
		return this.milesService.get(user.id).pipe(
			map((it: MilesListEntry) => it.miles)
		)
	}

}
