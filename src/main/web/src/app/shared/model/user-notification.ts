export interface UserNotification {
	id: string;
	text: string;
	type: UserNotificationType; //todo enum
	status: NotificationStatus;
	imagePath: string;
	link: string;
	timestamp: string;
}

//todo redesign: change notification templates

export enum NotificationStatus {
	READ = "READ",
	UNREAD = "UNREAD",
	DELETED = "DELETED"
}

//todo keep up to date
export enum UserNotificationType {
	//email only
	REGISTRATION,
	FORGOT_PASSWORD,
	ORDER_CONFIRMATION,

	DEBIT_CUSTOMER,
	TRANSFER_CUSTOMER,

	//notification only
	////nothing yet

	//both
	CLUBROLE_CHANGE_REQUEST,
	RESPONSIBLE_USER,
	OBJECT_HAS_CHANGED,

	DEBIT_TREASURER,
	TRANSFER_TREASURER,
}

export const notificationTypes: UserNotificationType[] = [
	UserNotificationType.REGISTRATION,
	UserNotificationType.FORGOT_PASSWORD,
	UserNotificationType.ORDER_CONFIRMATION,
	UserNotificationType.DEBIT_CUSTOMER,
	UserNotificationType.TRANSFER_CUSTOMER,
	UserNotificationType.CLUBROLE_CHANGE_REQUEST,
	UserNotificationType.RESPONSIBLE_USER,
	UserNotificationType.OBJECT_HAS_CHANGED,
	UserNotificationType.DEBIT_TREASURER,
	UserNotificationType.TRANSFER_TREASURER,
];

export const configurableNotificationTypes: UserNotificationType[] = [
	UserNotificationType.CLUBROLE_CHANGE_REQUEST,
	UserNotificationType.RESPONSIBLE_USER,
	UserNotificationType.OBJECT_HAS_CHANGED,
	UserNotificationType.DEBIT_TREASURER,
	UserNotificationType.TRANSFER_TREASURER,
];

export enum UserNotificationBroadcastType {
	MAIL,
	NOTIFICATION
}

export interface UserNotificationUnsubscription {
	id: number;
	user: number;
	notificationType: UserNotificationType;
	broadcasterType: UserNotificationBroadcastType;
}
