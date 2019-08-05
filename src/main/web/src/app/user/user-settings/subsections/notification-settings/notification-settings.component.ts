import {Component} from "@angular/core";
import {LogInService} from "../../../../shared/services/api/login.service";
import {BehaviorSubject, Observable} from "rxjs";
import {filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {ClubRole, isAuthenticated} from "../../../../shared/model/club-role";
import {UserNotificationUnsubscriptionService} from "../../../../shared/services/api/user-notification-unsubscription.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {
	broadcastTypeFromString,
	notificationTypeFromString,
	notificationTypes,
	UserNotificationBroadcastType,
	UserNotificationType
} from "../../../../shared/model/user-notification";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {AccountSettingsService} from "../account-settings.service";
import {User} from "../../../../shared/model/user";
import {MatSnackBar} from "@angular/material";

export type NotificationSettings = { [type in UserNotificationType]: { [broadCaster in UserNotificationBroadcastType]: boolean; } };

@Component({
	selector: "memo-notification-settings",
	templateUrl: "./notification-settings.component.html",
	styleUrls: ["./notification-settings.component.scss"]
})
export class NotificationSettingsComponent extends BaseSettingsSubsectionComponent {
	NotificationType = UserNotificationType;
	BroadcasterType = UserNotificationBroadcastType;

	//todo who should get the notifications?
	canGetTreasurerNotifications$: Observable<boolean> = this.loginService.currentUser$
		.pipe(
			map(it => it === null ? false : isAuthenticated(it.clubRole, ClubRole.Kassenwart))
		);

	canGetOrderCheckNotifications$: Observable<boolean> = this.loginService.currentUser$
		.pipe(
			map(it => it === null ? false : isAuthenticated(it.clubRole, ClubRole.Organisator))
		);

	canGetClubroleChangeNotifications$: Observable<boolean> = this.loginService.currentUser$
		.pipe(
			map(it => it === null ? false : isAuthenticated(it.clubRole, ClubRole.Admin))
		);

	private previousValue: NotificationSettings = null;

	private reloadTrigger$: BehaviorSubject<any> = new BehaviorSubject(true);

	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
				private fb: FormBuilder,
				protected snackBar: MatSnackBar,
				private notificationUnsubscriptionsService: UserNotificationUnsubscriptionService) {
		super(loginService, snackBar, accountSettingsService);

		this.reloadTrigger$.pipe(
			switchMap(() => this.user$),
			filter(it => it !== null),
			switchMap(user => this.userToSettingsValue(user)),
			takeUntil(this.onDestroy$)
		)
			.subscribe(settingsValue => this.previousValue = settingsValue);

		this.formGroup = this.fb.group({
			[UserNotificationType.CLUBROLE_CHANGE_REQUEST]: this.fb.group({
				[UserNotificationBroadcastType.NOTIFICATION]: this.fb.control(true),
				[UserNotificationBroadcastType.MAIL]: this.fb.control(true)
			}),
			[UserNotificationType.RESPONSIBLE_USER]: this.fb.group({
				[UserNotificationBroadcastType.NOTIFICATION]: this.fb.control(true),
				[UserNotificationBroadcastType.MAIL]: this.fb.control(true)
			}),
			[UserNotificationType.OBJECT_HAS_CHANGED]: this.fb.group({
				[UserNotificationBroadcastType.NOTIFICATION]: this.fb.control(true),
				[UserNotificationBroadcastType.MAIL]: this.fb.control(true)
			}),
			[UserNotificationType.DEBIT_TREASURER]: this.fb.group({
				[UserNotificationBroadcastType.NOTIFICATION]: this.fb.control(true),
				[UserNotificationBroadcastType.MAIL]: this.fb.control(true)
			}),
			[UserNotificationType.TRANSFER_TREASURER]: this.fb.group({
				[UserNotificationBroadcastType.NOTIFICATION]: this.fb.control(true),
				[UserNotificationBroadcastType.MAIL]: this.fb.control(true)
			}),
			//todo there are no mails for these notification types
			[UserNotificationType.NEW_COMMENT]: this.fb.group({
				[UserNotificationBroadcastType.NOTIFICATION]: this.fb.control(true),
				[UserNotificationBroadcastType.MAIL]: this.fb.control(true)
			}),
			[UserNotificationType.MARKED_AS_REPORT_WRITER]: this.fb.group({
				[UserNotificationBroadcastType.NOTIFICATION]: this.fb.control(true),
				[UserNotificationBroadcastType.MAIL]: this.fb.control(true)
			}),
			[UserNotificationType.UPCOMING_EVENT]: this.fb.group({
				[UserNotificationBroadcastType.NOTIFICATION]: this.fb.control(true),
				[UserNotificationBroadcastType.MAIL]: this.fb.control(true)
			}),
			[UserNotificationType.CHECK_ON_ORDER]: this.fb.group({
				[UserNotificationBroadcastType.NOTIFICATION]: this.fb.control(true),
				[UserNotificationBroadcastType.MAIL]: this.fb.control(true)
			}),
		});

		this.init();
	}

	ngOnInit() {
	}

	private userToSettingsValue(user: User, baseTypes: UserNotificationType[] = [...notificationTypes]): Observable<NotificationSettings> {
		return this.notificationUnsubscriptionsService.getByUserId(user.id)
			.pipe(
				map(unsubscriptions => {
					let previousValue: NotificationSettings = [...baseTypes].reduce((acc, type) => {
						if (!acc[type]) {
							acc[type] = {
								[UserNotificationBroadcastType.NOTIFICATION]: true,
								[UserNotificationBroadcastType.MAIL]: true
							};
						}
						return acc;
					}, {} as NotificationSettings);
					return unsubscriptions.reduce((acc, value) => {
						const notificationType = notificationTypeFromString(value.notificationType as any);
						const broadcasterType = broadcastTypeFromString(value.broadcasterType as any);
						acc[notificationType][broadcasterType] = false;
						return acc;
					}, previousValue)
				})
			)
	}


	protected initFromUser(user: User, formGroup: FormGroup) {
		this.userToSettingsValue(user)
			.subscribe(settingsValue => {
				const value = formGroup.getRawValue();
				const updatedValue = value;

				Object.keys(value)
					.forEach(key => {
						updatedValue[key] = settingsValue[key];
					});

				formGroup.setValue(updatedValue, {emitEvent: true});
			});

	}


	hasChanges(user: User, value: NotificationSettings) {
		return Object.keys(value)
			.some(key => {
				return value[key][UserNotificationBroadcastType.NOTIFICATION] !== this.previousValue[key][UserNotificationBroadcastType.NOTIFICATION] ||
					value[key][UserNotificationBroadcastType.MAIL] !== this.previousValue[key][UserNotificationBroadcastType.MAIL];
			});
	}


	save(formGroup: FormGroup, user: User) {
		return this.notificationUnsubscriptionsService.pushConfig(user.id, formGroup.value)
			.pipe(tap(() => this.reloadTrigger$.next(true)))
	}

}
