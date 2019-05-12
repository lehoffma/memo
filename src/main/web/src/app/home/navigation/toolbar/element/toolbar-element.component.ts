import {ChangeDetectionStrategy, Component, HostBinding, Input} from "@angular/core";
import {Link} from "../../../../shared/model/link";
import {NavigationService} from "../../../../shared/services/navigation.service";

@Component({
	selector: "memo-toolbar-element",
	templateUrl: "./toolbar-element.component.html",
	styleUrls: ["./toolbar-element.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarElementComponent {
	@Input() link: Link;

	@HostBinding("class.centered")
	@Input() centered: boolean;

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
