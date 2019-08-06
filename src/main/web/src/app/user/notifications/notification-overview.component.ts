import {Component, OnInit} from "@angular/core";
import {NotificationService} from "../../shared/services/api/user-notification.service";
import {NotificationStatus, UserNotification} from "../../shared/model/user-notification";
import {Observable} from "rxjs";
import {map, mergeMap} from "rxjs/operators";
import {Params} from "@angular/router";

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
		this.getBaseLink = this.getBaseLink.bind(this);
		this.getQueryParams = this.getQueryParams.bind(this);
	}

	ngOnInit() {
	}

	getBaseLink(input: string): string {
		const result = /([^?]+)\??(.*)?/g.exec(input);
		if (!result) {
			return input;
		}
		return result[1];
	}

	getQueryParams(input: string): Params {
		const result = /([^?]+)\??(.*)?/g.exec(input);
		if (!result || !result[2]) {
			return {};
		}

		const paramsString = result[2];
		return paramsString.split("&").reduce((params, paramString) => {
			const [key, value] = paramString.split("=");
			params[key] = value;
			return params;
		}, {});
	}

	loadMore() {
		this.notificationService.loadMore();
	}

	markAsRead(notification: UserNotification) {
		if (notification.status === NotificationStatus.UNREAD) {
			this.notificationService.markAsRead(notification);
		}
	}

	markAsDeleted(notification: UserNotification) {
		this.notificationService.markAsDeleted(notification);
	}
}
