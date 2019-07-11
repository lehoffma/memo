import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Discount} from "../../../shared/renderers/price-renderer/discount";
import {combineLatest, Observable} from "rxjs";
import {UserService} from "../../../shared/services/api/user.service";
import {EventService} from "../../../shared/services/api/event.service";
import {map} from "rxjs/operators";
import {integerToString} from "../../../shop/shared/model/event-type";
import {isNullOrUndefined} from "util";

@Component({
	selector: "memo-discount-grid-item",
	templateUrl: "./discount-grid-item.component.html",
	styleUrls: ["./discount-grid-item.component.scss"]
})
export class DiscountGridItemComponent implements OnInit {
	@Input() discount: Discount;
	@Output() stopDiscount: EventEmitter<Discount> = new EventEmitter();

	properties: {
		[key in keyof Discount]?: {
			matIcon: string;
			tooltip: string;
			isEmpty?: (value: any) => boolean;
			getString?: (value: Discount[key]) => string;
			getString$?: (value: Discount[key]) => Observable<string>;
		}
	} = {
		itemTypes: {
			matIcon: "filter_list",
			tooltip: "Gilt nur für diese Itemtypen",
			isEmpty: value => !value || value.length === 0,
			getString: value => value.map(it => integerToString(it)).join(", ")
		},
		users: {
			matIcon: "person",
			tooltip: "Gilt nur für diese User",
			isEmpty: value => !value || value.length === 0,
			getString$: value => combineLatest(
				value.map(id => this.userService.getById(id))
			).pipe(
				map(users => users.map(it => it.firstName + " " + it.surname).join(", "))
			)
		},
		clubRoles: {
			matIcon: "person",
			tooltip: "Gilt nur für diese Arten von Usern",
			isEmpty: value => !value || value.length === 0,
			getString: value => value.map(it => it).join(", ")
		},
		//todo all the other ones...
	};

	constructor(private userService: UserService,
				private itemService: EventService,) {
	}

	ngOnInit() {
	}

	objectKeys(input: any): string[] {
		return Object.keys(input);
	}

	filterNull = this._filterNull.bind(this);

	private _filterNull(keys: (keyof Discount)[], value: Discount): (keyof Discount)[] {
		return keys.filter(key => {
			const isEmpty = this.properties[key] && this.properties[key].isEmpty
				? this.properties[key].isEmpty(value[key])
				: !value[key];
			return !isNullOrUndefined(value[key]) && this.properties[key] !== undefined && !isEmpty;
		});
	}
}
