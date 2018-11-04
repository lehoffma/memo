export interface UserNotification {
	id: string;
	text: string;
	type: number; //todo enum
	status: NotificationStatus;
	imagePath: string;
	link: string;
	timestamp: string;
}


export enum NotificationStatus {
	READ = "READ",
	UNREAD = "UNREAD",
	DELETED = "DELETED"
}
