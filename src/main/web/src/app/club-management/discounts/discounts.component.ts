import {Component} from "@angular/core";
import {BaseSearchResultsComponent, FilterTransformations} from "../../shared/search/base-search-results.component";
import {Discount} from "../../shared/renderers/price-renderer/discount";
import {Filter} from "../../shared/model/api/filter";
import {BehaviorSubject, Observable, of} from "rxjs";
import {FilterOption} from "../../shared/search/filter-options/filter-option";
import {SortingOptionHelper} from "../../shared/model/sorting-option";
import {Direction, Sort} from "../../shared/model/api/sort";
import {LogInService} from "../../shared/services/api/login.service";
import {map} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {SearchFilterService} from "../../shared/search/search-filter.service";
import {NavigationService} from "../../shared/services/navigation.service";
import {DiscountService} from "../../shop/shared/services/discount.service";
import {DateRangeFilterOption} from "../../shared/search/filter-options/date-range-filter-option";
import {ShopItemFilterOption} from "../../shared/search/filter-options/shop-item-filter-option";
import {EventService} from "../../shared/services/api/event.service";
import {MultiFilterOption} from "../../shared/search/filter-options/multi-filter-option";

@Component({
	selector: "memo-discounts",
	templateUrl: "./discounts.component.html",
	styleUrls: ["./discounts.component.scss"]
})
export class DiscountsComponent extends BaseSearchResultsComponent<Discount> {

	constructor(protected loginService: LogInService,
				protected activatedRoute: ActivatedRoute,
				protected searchFilterService: SearchFilterService,
				protected navigationService: NavigationService,
				protected eventService: EventService,
				protected discountService: DiscountService,
				protected router: Router,) {
		super(
			//todo
			new BehaviorSubject<FilterOption[]>([]),
			//todo
			[
				SortingOptionHelper.build(
					"Alphabetisch A-Z",
					Sort.by(Direction.ASCENDING, "reason"),
					"A-Z"
				),
				SortingOptionHelper.build(
					"Alphabetisch Z-A",
					Sort.by(Direction.DESCENDING, "reason"),
					"Z-A"
				),
				SortingOptionHelper.build(
					"Discountmenge aufsteigend",
					Sort.by(Direction.ASCENDING, "amount"),
					"Menge ↑"
				),
				SortingOptionHelper.build(
					"Discountmenge absteigend",
					Sort.by(Direction.DESCENDING, "amount"),
					"Menge ↓"
				),
			],
			loginService.getActionPermissions("funds")
				.pipe(
					map(permission => permission.Hinzufuegen),
				),
			FilterTransformations.none(),
			activatedRoute,
			searchFilterService,
			navigationService,
			loginService,
			discountService,
			router
		)
	}

	ngOnInit() {
	}

	protected buildFilterOptions(filter: Filter): Observable<FilterOption[]> {
		return of([
			new DateRangeFilterOption("date", "Zeitraum"),
			new ShopItemFilterOption("item", "Nach Item filtern", id => this.eventService.getById(id)),
			new MultiFilterOption("outdated", "Aktiv", [
				{key: "isActive", label: "Nur aktive", query: [{key: "outdated", value: "false"}]},
			]),
			new MultiFilterOption("percentage", "Typ", [
				{key: "onlyPercentage", label: "Prozentual", query: [{key: "isPercentage", value: "true"}]},
				{key: "onlyAbsolute", label: "Absolut", query: [{key: "isPercentage", value: "false"}]},
			])
		])
	}

	redirectToForm() {
		this.router.navigate(["form"], {relativeTo: this.activatedRoute});
	}

	stopDiscount(discount: Discount) {
		console.warn(discount);
		//todo set "outdated" to true and invalidate caches/reload the data
	}
}
