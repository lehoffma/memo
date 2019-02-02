import {Component, Input, OnInit} from "@angular/core";
import {Address} from "../../../../shared/model/address";
import {RoutingService} from "../../../shared/services/routing.service";
import {BehaviorSubject} from "rxjs";
import {filter, map} from "rxjs/operators";
import {animate, style, transition, trigger} from "@angular/animations";

enum AddressDisplayFormat {
	Short = "short",
	Long = "long"
}

@Component({
	selector: "memo-route-list",
	templateUrl: "./route-list.component.html",
	styleUrls: ["./route-list.component.scss"],
	animations: [
		trigger("growAndShrink", [
			transition("void => *", [
				style({height: 0}),
				animate("250ms ease-in", style({height: "*"}))
			]),

			transition("* => void", [
				animate("250ms ease-in", style({height: "0"}))
			])
		])
	]
})
export class RouteListComponent implements OnInit {
	_route$: BehaviorSubject<Address[]> = new BehaviorSubject([]);
	first$ = this._route$.pipe(
		filter(it => it && it.length > 0),
		map(it => it[0])
	);
	layovers$ = this._route$.pipe(
		filter(it => it && it.length > 2),
		map(it => it.slice(1, it.length - 1))
	);
	last$ = this._route$.pipe(
		filter(it => it && it.length > 0),
		map(it => it[it.length - 1])
	);

	addressFormats = AddressDisplayFormat;

	showLayovers = false;

	constructor(private routingService: RoutingService) {
	}

	@Input() set route(route: Address[]) {
		this._route$.next(route);
	}

	ngOnInit() {
	}

	toggleLayover() {
		this.showLayovers = !this.showLayovers;
	}
}
