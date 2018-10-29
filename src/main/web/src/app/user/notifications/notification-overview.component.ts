import {Component, OnInit} from "@angular/core";
import {NotificationService} from "../../shared/services/api/user-notification.service";
import {UserNotification} from "../../shared/model/user-notification";
import {Observable} from "rxjs";

@Component({
	selector: "memo-notification-overview",
	templateUrl: "./notification-overview.component.html",
	styleUrls: ["./notification-overview.component.scss"]
})

export class NotificationOverviewComponent implements OnInit {
	notifications$: Observable<UserNotification[]> = this.notificationService.notifications$;

	//todo: pagination (+total)
	//keep track of amount of added realtime notifications
	constructor(private notificationService: NotificationService) {
	}

	ngOnInit() {
	}
}
