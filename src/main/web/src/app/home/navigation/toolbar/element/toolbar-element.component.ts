	import {Component, Input} from "@angular/core";
import {Link} from "../../../../shared/model/link";
import {NavigationService} from "../../../../shared/services/navigation.service";

@Component({
	selector: "memo-toolbar-element",
	templateUrl: "./toolbar-element.component.html",
	styleUrls: ["./toolbar-element.component.scss"]
})
export class ToolbarElementComponent {
	@Input() link: Link;

	constructor(public navigationService: NavigationService) {

	}

	activateRoute(route: string) {
		this.navigationService.navigateByUrl(route);
	}

	activateRouteIfNoChildren(route: string) {
		if (!this.link.children) {
			this.activateRoute(route);
		}
	}
}
