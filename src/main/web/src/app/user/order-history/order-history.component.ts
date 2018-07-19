import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {OrderService} from "../../shared/services/api/order.service";
import {Order} from "../../shared/model/order";
import {SortingOption, SortingOptionHelper} from "../../shared/model/sorting-option";
import {Observable} from "rxjs";
import {filter, first, map} from "rxjs/operators";
import {Direction, Sort} from "../../shared/model/api/sort";
import {PagedDataSource} from "../../shared/utility/material-table/paged-data-source";
import {Filter} from "../../shared/model/api/filter";
import {NavigationService} from "../../shared/services/navigation.service";
import {MatPaginator} from "@angular/material";
import {ScrollingService} from "../../shared/services/scrolling.service";
import {Router} from "@angular/router";
import {userPermissions} from "../../shared/model/user";
import {Permission} from "../../shared/model/permission";

@Component({
	selector: "memo-order-history",
	templateUrl: "./order-history.component.html",
	styleUrls: ["./order-history.component.scss"]
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
	sortedBy$: Observable<Sort> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => paramMap.has("sortBy") && paramMap.has("direction")
				? Sort.by(paramMap.get("direction"), paramMap.getAll("sortBy").join("|"))
				: Sort.none())
		);

	sortingOptions: SortingOption<Order>[] = [
		SortingOptionHelper.build(
			"Datum (neu -> alt)",
			Sort.by(Direction.DESCENDING, "timeStamp")
		),
		SortingOptionHelper.build(
			"Datum (alt -> neu)",
			Sort.by(Direction.ASCENDING, "timeStamp")
		),
	];
	canEdit$ = this.loginService.currentUser$.pipe(
		filter(user => user !== null),
		map(user => userPermissions(user).funds >= Permission.write),
	);


	//todo schönere "keine bestellungen" message
	//todo timeline slider

	@ViewChild(MatPaginator) paginator: MatPaginator;
	filter$: Observable<Filter> = this.loginService.accountObservable
		.pipe(
			map(userId => Filter.by({
				"userId": "" + userId
			}))
		);
	public dataSource: PagedDataSource<Order> = new PagedDataSource<Order>(this.orderService);
	orders$: Observable<Order[]> = this.dataSource.connect();

	constructor(private loginService: LogInService,
				private navigationService: NavigationService,
				private scrollService: ScrollingService,
				private router: Router,
				private orderService: OrderService) {
		this.dataSource.isExpandable = false;
		this.dataSource.filter$ = this.filter$;
		this.dataSource.sort$ = this.sortedBy$;

		this.sortedBy$.pipe(first()).subscribe((sortedBy: Sort) => {
			if (sortedBy.sortBys.length === 0) {
				this.router.navigate([], {queryParams: this.sortingOptions[0].queryParameters, skipLocationChange: true})
			}
		})
	}

	ngOnInit() {
		this.dataSource.paginator = this.paginator;
	}

	ngOnDestroy(): void {
		this.dataSource.disconnect(null);
	}

	scrollToTop() {
		this.scrollService.scrollToTop();
	}
}
