import {Injectable, OnDestroy} from "@angular/core";
import {WebsocketService} from "../websocket.service";
import {LogInService} from "./login.service";
import {BehaviorSubject, Subscription} from "rxjs";
import {NotificationStatus, UserNotification} from "../../model/user-notification";
import {filter, mergeMap, scan, tap} from "rxjs/operators";
import {AuthService} from "../../authentication/auth.service";

@Injectable()
export class NotificationService implements OnDestroy {
	baseUrl = "ws:localhost:8080/api/notifications_stream";
	notifications$: BehaviorSubject<UserNotification[]> = new BehaviorSubject([]);
	unreadNotifications$ = new BehaviorSubject(0);
	totalNotifications$ = new BehaviorSubject(0);
	loading$ = new BehaviorSubject(true);

	notificationSubscription: Subscription;

	constructor(private websocketService: WebsocketService<UserNotification[]>,
				private authService: AuthService,
				private loginService: LogInService) {
		this.notificationSubscription = this.loginService.currentUser$
			.pipe(
				//only when the user is logged in
				filter(user => user !== null),
				tap(() => this.loading$.next(true)),
				mergeMap(user => this.websocketService.connect(this.baseUrl + "?access_token=" + authService.getToken())
					.pipe(
						scan((acc, value) => {
							if (this.isFirstMessage(value)) {
								this.totalNotifications$.next(value.total);
								this.unreadNotifications$.next(value.unread);
								return [...acc, ...value.content];
							}
							else if (this.isLoadMoreMessage(value)) {
								return [...acc, ...value.content];
							}
							else {
								return [value, ...acc]
							}
						}, [])
					)
				),
				tap(() => this.loading$.next(false)),
			)
			.subscribe(this.notifications$);
	}

	isFirstMessage(value): value is { total: number, unread: number, content: UserNotification[] } {
		return value["total"] !== undefined && value["content"] !== undefined;
	}

	isLoadMoreMessage(value): value is { content: UserNotification[] } {
		return value["content"] !== undefined;
	}

	ngOnDestroy(): void {
		this.notificationSubscription.unsubscribe();
	}

	loadMore() {
		this.websocketService.send({"message": "loadMore"});
	}

	markAsRead(notification: UserNotification) {
		const wasSuccessful = this.websocketService.send(
			{
				"message": "markAsRead",
				"notificationId": notification.id
			}
		);
		if (wasSuccessful) {
			let currentValue = this.notifications$.getValue();
			let notificationIndex = currentValue.findIndex(it => it.id === notification.id);
			currentValue[notificationIndex].status = NotificationStatus.READ;
			this.notifications$.next(currentValue);
			this.unreadNotifications$.next(this.unreadNotifications$.getValue() - 1);
		}
		else {
			//todo display error message that something went wrong
		}
	}


	markAsDeleted(notification: UserNotification) {
		const wasSuccessful = this.websocketService.send(
			{
				"message": "markAsDeleted",
				"notificationId": notification.id
			}
		);
		if (wasSuccessful) {
			let currentValue = this.notifications$.getValue();
			this.notifications$.next(currentValue.filter(it => it.id !== notification.id));
		}
		else {
			//todo display error message that something went wrong
		}
	}
}
