import {Page} from "../../../../../shared/model/api/page";
import {PagedDataSource} from "../../../../../shared/utility/material-table/paged-data-source";
import {PageRequest} from "../../../../../shared/model/api/page-request";
import {Sort} from "../../../../../shared/model/api/sort";
import {Observable} from "rxjs";
import {Filter} from "../../../../../shared/model/api/filter";
import {ParticipantUser} from "../../../../shared/model/participant";
import {OrderedItemService} from "../../../../../shared/services/api/ordered-item.service";
import {UserService} from "../../../../../shared/services/api/user.service";


import {Injectable} from "@angular/core";
import {AddOrModifyRequest, ServletService} from "../../../../../shared/services/api/servlet.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
	providedIn: "root"
})
export class ParticipantUserService extends ServletService<ParticipantUser> {

	constructor(
		protected http: HttpClient,
		private orderedItemService: OrderedItemService
	) {
		super(http, "/api/orderedItem");
	}


	get(filter: Filter, pageRequest: PageRequest, sort: Sort): Observable<Page<ParticipantUser>> {
		return this.orderedItemService.getParticipantUsers(filter, pageRequest, sort);
	}

	addOrModify(requestMethod: AddOrModifyRequest, entry: ParticipantUser, options?: any): Observable<ParticipantUser> {
		return undefined;
	}

	remove(id: number, ...args: any[]): Observable<Object>;
	remove(id: number, options?: any): Observable<Object>;
	remove(id: number, ...args: (any)[]): Observable<Object> {
		return undefined;
	}
}

export class ParticipantDataSource extends PagedDataSource<ParticipantUser> {

	constructor(dataService: ParticipantUserService,
				protected userService: UserService) {
		super(dataService);
	}
}

