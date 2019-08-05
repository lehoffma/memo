export interface UserNotification {
	id: string;
	text: string;
	type: UserNotificationType;
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

	//both
	CLUBROLE_CHANGE_REQUEST,
	RESPONSIBLE_USER,
	OBJECT_HAS_CHANGED,

	DEBIT_TREASURER,
	TRANSFER_TREASURER,
	NEW_COMMENT,
	MARKED_AS_REPORT_WRITER,

	//notification only
	UPCOMING_EVENT,
	CHECK_ON_ORDER,
}

export const notificationTypeMap: { [value: string]: UserNotificationType } = {
	REGISTRATION: UserNotificationType.REGISTRATION,
	FORGOT_PASSWORD: UserNotificationType.FORGOT_PASSWORD,
	ORDER_CONFIRMATION: UserNotificationType.ORDER_CONFIRMATION,
	DEBIT_CUSTOMER: UserNotificationType.DEBIT_CUSTOMER,
	TRANSFER_CUSTOMER: UserNotificationType.TRANSFER_CUSTOMER,
	CLUBROLE_CHANGE_REQUEST: UserNotificationType.CLUBROLE_CHANGE_REQUEST,
	RESPONSIBLE_USER: UserNotificationType.RESPONSIBLE_USER,
	OBJECT_HAS_CHANGED: UserNotificationType.OBJECT_HAS_CHANGED,
	DEBIT_TREASURER: UserNotificationType.DEBIT_TREASURER,
	TRANSFER_TREASURER: UserNotificationType.TRANSFER_TREASURER,
	NEW_COMMENT: UserNotificationType.NEW_COMMENT,
	MARKED_AS_REPORT_WRITER: UserNotificationType.MARKED_AS_REPORT_WRITER,
	UPCOMING_EVENT: UserNotificationType.UPCOMING_EVENT,
	CHECK_ON_ORDER: UserNotificationType.CHECK_ON_ORDER,
};

export function notificationTypeFromString(input: string): UserNotificationType {
	return notificationTypeMap[input];
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
	UserNotificationType.NEW_COMMENT,
	UserNotificationType.MARKED_AS_REPORT_WRITER,
	UserNotificationType.UPCOMING_EVENT,
	UserNotificationType.CHECK_ON_ORDER,
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

export const broadcastTypeMap: { [value: string]: UserNotificationBroadcastType } = {
	MAIL: UserNotificationBroadcastType.MAIL,
	NOTIFICATION: UserNotificationBroadcastType.NOTIFICATION
};

export function broadcastTypeFromString(input: string): UserNotificationBroadcastType {
	return broadcastTypeMap[input];
}

export interface UserNotificationUnsubscription {
	id: number;
	user: number;
	notificationType: UserNotificationType;
	broadcasterType: UserNotificationBroadcastType;
}
