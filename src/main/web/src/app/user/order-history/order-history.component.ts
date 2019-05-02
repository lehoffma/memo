import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {OrderService} from "../../shared/services/api/order.service";
import {Order} from "../../shared/model/order";
import {SortingOption, SortingOptionHelper} from "../../shared/model/sorting-option";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {filter, first, map} from "rxjs/operators";
import {Direction, Sort} from "../../shared/model/api/sort";
import {PagedDataSource} from "../../shared/utility/material-table/paged-data-source";
import {Filter} from "../../shared/model/api/filter";
import {NavigationService} from "../../shared/services/navigation.service";
import {MatPaginator} from "@angular/material";
import {ScrollingService} from "../../shared/services/scrolling.service";
import {ActivatedRoute, Router} from "@angular/router";
import {userPermissions} from "../../shared/model/user";
import {Permission} from "../../shared/model/permission";
import {getAllQueryValues} from "../../shared/model/util/url-util";
import {OrderStatus, orderStatusList, statusToInt} from "../../shared/model/order-status";
import {WindowService} from "../../shared/services/window.service";
import {QueryParameterService} from "../../shared/services/query-parameter.service";

export enum OrderHistoryTab {
	ALL = "all",
	OPEN = "open",
	CANCELLED = "cancelled"
}

@Component({
	selector: "memo-order-history",
	templateUrl: "./order-history.component.html",
	styleUrls: ["./order-history.component.scss"]
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
	sortedBy$: Observable<Sort> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => paramMap.has("sortBy") && paramMap.has("direction")
				? Sort.by(paramMap.get("direction"), getAllQueryValues(paramMap, "sortBy").join(","))
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

	canSeeDescription$ = this.loginService.currentUser$.pipe(
		filter(user => user !== null),
		map(user => userPermissions(user).funds >= Permission.read),
	);

	canEdit$ = this.loginService.currentUser$.pipe(
		filter(user => user !== null),
		map(user => userPermissions(user).funds >= Permission.write),
	);

	selectedTabIndex = 0;

	@ViewChild(MatPaginator) paginator: MatPaginator;
	filter$: Observable<Filter> = combineLatest(
		this.navigationService.queryParamMap$,
		this.loginService.accountObservable
	)
		.pipe(
			map(([queryParamMap, userId]) => {
				let filter = {"userId": "" + userId};
				if (queryParamMap.has("searchTerm")) {
					filter["searchTerm"] = queryParamMap.get("searchTerm");
				}
				return Filter.by(filter);
			})
		);


	readonly TABS = [OrderHistoryTab.ALL, OrderHistoryTab.OPEN, OrderHistoryTab.CANCELLED];

	public dataSources: { [tab in OrderHistoryTab]: PagedDataSource<Order> } = {
		all: new PagedDataSource<Order>(this.orderService),
		cancelled: new PagedDataSource<Order>(this.orderService),
		open: new PagedDataSource<Order>(this.orderService)
	};

	filters: { [tab in OrderHistoryTab]: Observable<Filter> } = {
		all: this.filter$,
		cancelled: this.filter$.pipe(
			map(filter => Filter.combine(
				filter,
				Filter.by({"status": "5"})
			))
		),
		open: this.filter$.pipe(
			map(filter => Filter.combine(
				filter,
				Filter.by({
					"status": orderStatusList(OrderStatus.CANCELLED, OrderStatus.COMPLETED, OrderStatus.PARTICIPATED)
						.map(it => statusToInt(it))
						.join(",")
				})
			))
		)
	};

	orders: { [tab in OrderHistoryTab]: Observable<Order[]> } = {
		all: this.dataSources.all.connect(),
		cancelled: this.dataSources.cancelled.connect(),
		open: this.dataSources.open.connect(),
	};

	labels: { [tab in OrderHistoryTab]: string } = {
		all: "Alle",
		cancelled: "Storniert",
		open: "Offen"
	};

	emptyState: { [tab in OrderHistoryTab]: { icon: string; title: string; subtitle: string; } } = {
		all: {
			icon: "assignment",
			title: "Keine Bestellungen",
			subtitle: "Du hast bisher keine Bestellungen getätigt, was du hoffentlich bald nachholen wirst."
		},
		cancelled: {
			icon: "assignment",
			title: "Keine Stornierungen",
			subtitle: "Du hast bisher noch nichts storniert. Yay!"
		},
		open: {
			icon: "assignment",
			title: "Keine offenen Bestellungen",
			subtitle: "Du hast keine offenen Bestellungen mehr. Wird Zeit für eine neue Bestellung!"
		}
	};

	initialValue = this.activatedRoute.snapshot.queryParamMap.has("searchTerm")
		? this.activatedRoute.snapshot.queryParamMap.get("searchTerm")
		: undefined;

	searchIsExpanded$ = new BehaviorSubject(false);
	onDestroy$ = new Subject();

	constructor(private loginService: LogInService,
				private navigationService: NavigationService,
				private scrollService: ScrollingService,
				private router: Router,
				private windowService: WindowService,
				private activatedRoute: ActivatedRoute,
				private orderService: OrderService) {
		this.TABS.forEach(tab => {
			this.dataSources[tab].isExpandable = false;
			this.dataSources[tab].filter$ = this.filters[tab];
			this.dataSources[tab].sort$ = this.sortedBy$
		});

		this.sortedBy$.pipe(first()).subscribe((sortedBy: Sort) => {
			if (sortedBy.sortBys.length === 0) {
				this.router.navigate([], {queryParams: this.sortingOptions[0].queryParameters, skipLocationChange: true})
			}
		});

		this.activatedRoute.queryParamMap
			.pipe(
				filter(map => map.has("view"))
			)
			.subscribe(queryParamMap => {
				this.selectedTabIndex = this.TABS.findIndex(tab => tab === queryParamMap.get("view"));
			})
	}

	ngOnInit() {
		this.TABS.forEach(tab => {
			this.dataSources[tab].paginator = this.paginator;
		});
	}

	ngOnDestroy(): void {
		this.TABS.forEach(tab => this.dataSources[tab].disconnect(null));
		this.onDestroy$.next(true);
	}


	updateView(index: number) {
		const view = this.TABS[index];

		this.paginator.firstPage();
		this.router.navigate([], {
			queryParams: {
				view: view,
			},
			queryParamsHandling: "merge",
			relativeTo: this.activatedRoute,
			replaceUrl: !this.activatedRoute.snapshot.queryParamMap.has("view")
		});
	}


	scrollToTop() {
		this.scrollService.scrollToTop();
	}

	search(keyword: string) {
		const currentParams = this.navigationService.queryParams$.getValue();
		const updatedParams = QueryParameterService.updateQueryParams(currentParams,
			{searchTerm: keyword ? keyword : null}
		);

		this.router.navigate([], {queryParams: updatedParams});
	}

	onFocus(focus: boolean) {
		if (this.windowService.dimensions.width <= 600) {
			this.searchIsExpanded$.next(focus);
		} else {
			this.searchIsExpanded$.next(false);
		}
	}
}
