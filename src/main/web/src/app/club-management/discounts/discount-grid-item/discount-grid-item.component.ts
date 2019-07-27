import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Discount} from "../../../shared/renderers/price-renderer/discount";
import {combineLatest, Observable, of} from "rxjs";
import {UserService} from "../../../shared/services/api/user.service";
import {EventService} from "../../../shared/services/api/event.service";
import {map} from "rxjs/operators";
import {integerToString} from "../../../shop/shared/model/event-type";
import {isNullOrUndefined} from "util";

export type DiscountPropertyKey = keyof Discount | "age" | "price" | "membershipDurationInDays" | "miles";

export type DiscountConditionProperty<key extends DiscountPropertyKey> = {
	matIcon: string;
	tooltip: string;
	isEmpty?: (value: any) => boolean;
	getMinMax?: (discount: Discount) => string;
	getString?: (value: any) => string;
	getString$?: (value: any) => Observable<string>;
}

@Component({
	selector: "memo-discount-grid-item",
	templateUrl: "./discount-grid-item.component.html",
	styleUrls: ["./discount-grid-item.component.scss"]
})
export class DiscountGridItemComponent implements OnInit {
	@Input() discount: Discount;
	@Output() stopDiscount: EventEmitter<Discount> = new EventEmitter();

	properties: {
		[key in DiscountPropertyKey]?: DiscountConditionProperty<key>
	} = {
		itemTypes: {
			matIcon: "category",
			tooltip: "Gilt nur für diese Itemtypen",
			isEmpty: value => !value || value.length === 0,
			getString: value => "Für " + value.map(it => integerToString(it)).join(", ")
		},
		users: {
			matIcon: "person",
			tooltip: "Gilt nur für diese User",
			isEmpty: value => !value || value.length === 0,
			getString$: value => combineLatest(
				value.map(id => this.userService.getById(id))
			).pipe(
				map((users: any) => "Für " + users.map(it => it.firstName + " " + it.surname).join(", "))
			)
		},
		clubRoles: {
			matIcon: "person",
			tooltip: "Gilt nur für diese Arten von Usern",
			isEmpty: value => !value || value.length === 0,
			getString: value => "Für " + value.map(it => it).join(", ")
		},
		//min/max
		price: {
			matIcon: "attach_money",
			tooltip: "Gilt in dieser Preisspanne",
			getMinMax: discount => this.getMinMax(discount.minPrice, discount.maxPrice, input => input.toFixed(2) + "€")
		},
		age: {
			matIcon: "calendar",
			tooltip: "Gilt für diese Altersspanne",
			getMinMax: discount => this.getMinMax(discount.minAge, discount.maxAge)
		},
		membershipDurationInDays: {
			matIcon: "calendar",
			tooltip: "User muss so lange Mitglied gewesen sein",
			getMinMax: discount => this.getMinMax(discount.minMembershipDurationInDays, discount.maxMembershipDurationInDays) + " Tagen"
		},
		miles: {
			matIcon: "drive_eta",
			tooltip: "Gilt für diesen Meilenbereich",
			getMinMax: discount => this.getMinMax(discount.minMiles, discount.maxMiles) + " Meilen"
		},
		//boolean filters
		isStudent: {
			matIcon: "school",
			tooltip: "Studentenstatus des Nutzers",
			getString: value => value ? "Nur für Studenten" : "Nur für Nicht-Studenten"
		},
		seasonTicket: {
			matIcon: "local_play",
			tooltip: "Dauerkarte",
			getString: value => value ? "Nur für Dauerkartenbesitzer" : "Darf keine Dauerkarte besitzen"
		},
		woelfeClubMembership: {
			matIcon: "star",
			tooltip: "Woelfeclub",
			getString: value => value ? "Nur für Wölfeclub-Mitglieder" : "Darf kein Wölfeclub-Mitglied sein"
		}
	};

	constructor(private userService: UserService,
				private itemService: EventService,) {
	}

	private getMinMax(min: number | undefined, max: number | undefined, transform: (input: number) => string = a => "" + a): string {
		const minIsDefined = min !== undefined && min !== null;
		const maxIsDefined = max !== undefined && max !== null;

		if (minIsDefined && maxIsDefined) {
			return "Zwischen " + transform(min) + " und " + transform(max);
		}
		if (minIsDefined) {
			return ">= " + transform(min);
		}
		if (maxIsDefined) {
			return "<= " + transform(max);
		}
		return "Keine Einschränkung";
	}

	ngOnInit() {
		this.getProperties = this.getProperties.bind(this);
		this.getLabel = this.getLabel.bind(this);
	}

	private toPropertyKey(key: string): DiscountPropertyKey {
		const keyWithoutMinMax = key.replace(/^(min|max)/, "");
		return keyWithoutMinMax.charAt(0).toLowerCase() + keyWithoutMinMax.slice(1) as DiscountPropertyKey;
	}

	getProperties<Key extends DiscountPropertyKey>(key: Key): DiscountConditionProperty<Key> {
		const propertyKey = this.toPropertyKey(key);
		return this.properties[propertyKey]
	}

	getLabel<Key extends DiscountPropertyKey>(property: DiscountConditionProperty<Key>, discount: Discount, key: Key): Observable<string> {
		if (property.getMinMax) {
			return of(property.getMinMax(discount));
		}
		if (property.getString) {
			return of(property.getString(discount[key as keyof Discount]));
		}
		return property.getString$(discount[key as keyof Discount]);
	}

	objectKeys(input: any): string[] {
		return Object.keys(input);
	}

	filterNull = this._filterNull.bind(this);

	private _filterNull(keys: (keyof Discount)[], discount: Discount): (keyof Discount)[] {
		return keys.filter(key => {
			const propertyKey = this.toPropertyKey(key);
			//just don't show unsupported properties
			const isPartOfProperties = !!this.properties[propertyKey];
			const isEmpty = isPartOfProperties && this.properties[propertyKey].isEmpty
				? (this.properties[propertyKey].isEmpty(discount[key]))
				: isNullOrUndefined(discount[key]);

			return isPartOfProperties && !isEmpty;
		})
			.filter((key, index, array) => {
				const propertyKey = this.toPropertyKey(key);
				return array.map(key => this.toPropertyKey(key)).indexOf(propertyKey) === index;
			})
	}

	limitToString(limit: number): string {
		if (limit === -1) {
			return "Kein Limit";
		}
		return `Maximal ${limit} mal einsetzbar`;
	}
}
