import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {User} from "../model/user";
import {Observable} from "rxjs/Observable";

@Injectable()
export class CachedUsersStore {
	private _cachedUsers: BehaviorSubject<User[]> = new BehaviorSubject([]);
	public cachedUsers: Observable<User[]> = this._cachedUsers.asObservable();

	private maxCachedEvents = 100;

	constructor() {
	}

	get value() {
		return this._cachedUsers.getValue();
	}

	userIsCached(id: number) {
		return this.value.some(user => user.id === id);
	}

	add(user: User) {
		if (!this.userIsCached(user.id)) {
			this._cachedUsers.next([...this.value, user]);
		}
	}

	addMultiple(...users: User[]) {
		const uncachedUsers = users.filter(user => !this.userIsCached(user.id));
		if (uncachedUsers.length > 0) {
			this._cachedUsers.next([...this.value, ...uncachedUsers]);
		}
	}

	remove(id: number) {
		if (this.userIsCached(id)) {
			const currentValue = this.value;
			const index = currentValue.findIndex(user => user.id === id);
			currentValue.splice(index, 1);
			this._cachedUsers.next([...currentValue]);
		}
	}
}
