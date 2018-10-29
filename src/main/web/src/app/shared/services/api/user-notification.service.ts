import {Injectable, OnDestroy} from "@angular/core";
import {WebsocketService} from "../websocket.service";
import {LogInService} from "./login.service";
import {BehaviorSubject, Subscription} from "rxjs";
import {UserNotification} from "../../model/user-notification";
import {filter, mergeMap, scan} from "rxjs/operators";
import {AuthService} from "../../authentication/auth.service";
import {isArray} from "util";

@Injectable()
export class NotificationService implements OnDestroy {
	baseUrl = "ws:localhost:8080/api/notifications_stream";
	notifications$: BehaviorSubject<UserNotification[]> = new BehaviorSubject([]);

	notificationSubscription: Subscription;

	constructor(private websocketService: WebsocketService<UserNotification[]>,
				private authService: AuthService,
				private loginService: LogInService) {
		this.notificationSubscription = this.loginService.currentUser$
			.pipe(
				//only when the user is logged in
				filter(user => user !== null),
				mergeMap(user => this.websocketService.connect(this.baseUrl + "?access_token=" + authService.getToken())
					.pipe(
						scan((acc, value) => {
							if (isArray(value)) {
								return [...value, ...acc];
							}
							else {
								return [value, ...acc]
							}
						}, [])
					)
				),
			)
			.subscribe(this.notifications$);
	}

	ngOnDestroy(): void {
		this.notificationSubscription.unsubscribe();
	}


}
