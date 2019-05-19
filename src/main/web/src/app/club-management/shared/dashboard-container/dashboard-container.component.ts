import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "memo-dashboard-container",
	templateUrl: "./dashboard-container.component.html",
	styleUrls: ["./dashboard-container.component.scss"]
})
export class DashboardContainerComponent implements OnInit {
	@Input() title: string;
	@Input() icon: string;
	@Input() link: string;


	constructor() {
	}

	ngOnInit() {
	}

}
