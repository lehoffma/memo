import {Injectable} from "@angular/core";
import {AddOrModifyRequest, ServletService} from "../../../../../../shared/services/api/servlet.service";
import {HttpClient} from "@angular/common/http";
import {Filter} from "../../../../../../shared/model/api/filter";
import {PageRequest} from "../../../../../../shared/model/api/page-request";
import {Sort} from "../../../../../../shared/model/api/sort";
import {combineLatest, Observable, of} from "rxjs";
import {Page} from "../../../../../../shared/model/api/page";
import {PagedDataSource} from "../../../../../../shared/utility/material-table/paged-data-source";
import {UserService} from "../../../../../../shared/services/api/user.service";
import {WaitingListUser} from "../../../../../shared/model/waiting-list";
import {WaitingListService} from "../../../../../../shared/services/api/waiting-list.service";
import {map, mergeMap} from "rxjs/operators";

@Injectable({
	providedIn: "root"
})
export class WaitingListUserService extends ServletService<WaitingListUser> {

	constructor(
		protected http: HttpClient,
		private userService: UserService,
		private waitingListService: WaitingListService
	) {
		super(http, "/api/waiting-list");
	}


	get(filter: Filter, pageRequest: PageRequest, sort: Sort): Observable<Page<WaitingListUser>> {
		return this.waitingListService.get(
			Filter.combine(filter),
			pageRequest,
			sort,
		).pipe(
			mergeMap(waitingList => {
					if (waitingList.content.length === 0) {
						return of(waitingList as any);
					}


					return combineLatest(
						...waitingList.content
							.map(it => this.userService.getById(it.user).pipe(
								map(user => ({
									...it,
									user
								} as WaitingListUser))
							))
					)
						.pipe(
							map((content: WaitingListUser[]) => {
								return this.addPrevAndNext(
									{
										...waitingList,
										content
									} as any,
									filter,
									pageRequest,
									sort
								)
							})
						)
				}
			)
		)
	}

	addOrModify(requestMethod: AddOrModifyRequest, entry: WaitingListUser, options?: any): Observable<WaitingListUser> {
		return undefined;
	}
}

export class WaitingListDataSource extends PagedDataSource<WaitingListUser> {

	constructor(dataService: WaitingListUserService,
				protected userService: UserService) {
		super(dataService);
	}
}

