import {Component, OnInit} from "@angular/core";
import {NotificationService} from "../../shared/services/api/user-notification.service";
import {NotificationStatus, UserNotification} from "../../shared/model/user-notification";
import {Observable} from "rxjs";
import {map, mergeMap} from "rxjs/operators";

@Component({
	selector: "memo-notification-overview",
	templateUrl: "./notification-overview.component.html",
	styleUrls: ["./notification-overview.component.scss"]
})
export class NotificationOverviewComponent implements OnInit {
	notifications$: Observable<UserNotification[]> = this.notificationService.notifications$;
	canLoadMore$: Observable<boolean> = this.notificationService.totalNotifications$.pipe(
		mergeMap(total => this.notifications$.pipe(
			map(notifications => notifications.length < total)
		))
	);
	loading$ = this.notificationService.loading$;

	constructor(private notificationService: NotificationService) {
	}

	ngOnInit() {
	}

	loadMore() {
		this.notificationService.loadMore();
	}

	markAsRead(notification: UserNotification) {
		if (notification.status === NotificationStatus.UNREAD) {
			this.notificationService.markAsRead(notification);
		}
	}

	markAsDeleted(notification: UserNotification){
		this.notificationService.markAsDeleted(notification);
	}
}
