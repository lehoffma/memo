import {Observable, BehaviorSubject} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable()
export class LogInService {
    private accountSubject: BehaviorSubject<number> = new BehaviorSubject(null);
    public accountObservable: Observable<number> = this.accountSubject.asObservable();

    constructor() {
    }

    isLoggedIn() {
        return this.accountSubject.getValue() != null;
    }

    pushNewData(id: number) {
        this.accountSubject.next(id);
    }
}
