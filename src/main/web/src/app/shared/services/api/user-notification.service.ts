import {Injectable, OnDestroy} from "@angular/core";
import {WebsocketService} from "../websocket.service";
import {LogInService} from "./login.service";
import {Subject} from "rxjs/Subject";
import {UserNotification} from "../../model/user-notification";
import {Subscription} from "rxjs/Subscription";
import {filter, map, mergeMap} from "rxjs/operators";

@Injectable()
export class NotificationService implements OnDestroy {
	baseUrl = "/api/notifications";
	notifications$: Subject<UserNotification> = new Subject();

	notificationSubscription: Subscription;

	constructor(private websocketService: WebsocketService,
				private loginService: LogInService) {
		//todo use rxjs/websocket
		this.notificationSubscription = this.loginService.currentUser$
			.pipe(
				filter(user => user !== null),
				mergeMap(user => this.websocketService.connect(this.baseUrl + "?userId=" + user.id)),
				//todo is it really .data?
				map(notification => notification.data)
			)
			.subscribe(this.notifications$);
	}

	ngOnDestroy(): void {
		this.notificationSubscription.unsubscribe();
	}


}
