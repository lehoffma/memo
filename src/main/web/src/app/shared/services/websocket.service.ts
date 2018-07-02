import {Injectable} from "@angular/core";
import {Observable, Observer, Subject} from "rxjs";

@Injectable()
export class WebsocketService {
	private subject: Subject<MessageEvent>;

	constructor() {
	}

	/**
	 * Connect to the given url if the connection hasn't been opened yet. Returns the current connection if already opened
	 * @param url
	 * @returns {Subject<MessageEvent>}
	 */
	public connect(url: string): Subject<MessageEvent> {
		if (!this.subject) {
			this.subject = this.create(url);
			console.log("Successfully connected: " + url);
		}
		return this.subject;
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
	private create(url: string): Subject<MessageEvent> {
		const socket = new WebSocket(url);

		const observable = Observable.create(
			(obs: Observer<MessageEvent>) => {
				socket.onmessage = obs.next.bind(obs);
				socket.onerror = obs.error.bind(obs);
				socket.onclose = obs.complete.bind(obs);
				return socket.close.bind(socket);
			});
		const observer = {
			next: (data: Object) => {
				if (socket.readyState === WebSocket.OPEN) {
					socket.send(JSON.stringify(data));
				}
			}
		};
		return Subject.create(observer, observable);
	}

}
