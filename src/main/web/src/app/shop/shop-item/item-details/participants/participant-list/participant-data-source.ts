import {Page} from "../../../../../shared/model/api/page";
import {PagedDataSource} from "../../../../../shared/utility/material-table/paged-data-source";
import {PageRequest} from "../../../../../shared/model/api/page-request";
import {Sort} from "../../../../../shared/model/api/sort";
import {Observable} from "rxjs";
import {Filter} from "../../../../../shared/model/api/filter";
import {ParticipantUser} from "../../../../shared/model/participant";
import {OrderedItem} from "../../../../../shared/model/ordered-item";
import {OrderedItemService} from "../../../../../shared/services/api/ordered-item.service";
import {UserService} from "../../../../../shared/services/api/user.service";

export class ParticipantDataSource extends PagedDataSource<ParticipantUser, OrderedItem> {

	constructor(dataService: OrderedItemService,
				protected userService: UserService) {
		super(dataService);
	}

	protected getPagedData([pageEvent, sortEvent, filter, dataService, reload]:
							   [PageRequest, Sort, Filter, OrderedItemService, any]): Observable<Page<ParticipantUser>> {
		return (<OrderedItemService>dataService).getParticipantUsers(filter, pageEvent, sortEvent);
	}
}

