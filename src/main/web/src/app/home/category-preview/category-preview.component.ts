import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../shop/shared/model/event";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable} from "rxjs";

@Component({
	selector: "memo-category-preview",
	templateUrl: "./category-preview.component.html",
	styleUrls: ["./category-preview.component.scss"]
})
export class CategoryPreviewComponent implements OnInit {
	@Input() events: Observable<Event[]>;
	@Input() route: string;

	showDate = Observable.of(false);

	constructor(public navigationService: NavigationService) {

	}

	ngOnInit(): void {
		this.showDate = this.events
			.map(events => events[0] && !(events[0] instanceof Merchandise));
	}

	showDetails(event: Event) {
		this.navigationService.navigateByUrl(`${this.route}/${event.id}`);
	}
}
