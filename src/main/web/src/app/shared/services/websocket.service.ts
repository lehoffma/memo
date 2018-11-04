import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {webSocket, WebSocketSubject} from "rxjs/webSocket"

@Injectable({
	providedIn: "root"
})
export class WebsocketService<T> {
	private subject: WebSocketSubject<T>;

	constructor() {
	}

	/**
	 * Connect to the given url if the connection hasn't been opened yet. Returns the current connection if already opened
	 * @param url
	 * @returns {Subject<MessageEvent>}
	 */
	public connect(url: string): Observable<T> {
		if (!this.subject) {
			this.subject = this.create(url);
			console.log("Successfully connected: " + url);
		}
		return this.subject.asObservable();
	}

	public send(message: any): boolean{
		if (!this.subject) {
			console.error("Connection not established - message '" + message + "'was not sent")
			return false;
		}
		this.subject.next(message);
		return true;
	}

	/**
	 * Closes the currently active connection
	 */
	public disconnect() {
		this.subject.unsubscribe();
	}

	/**
	 *
	 * @param url
	 * @returns {Subject<MessageEvent>}
	 */
	private create(url: string): WebSocketSubject<T> {
		return webSocket(url);
	}

}
