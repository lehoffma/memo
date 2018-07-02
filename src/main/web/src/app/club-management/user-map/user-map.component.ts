import {Component, Input, OnInit} from "@angular/core";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {User} from "../../shared/model/user";
import {UserService} from "../../shared/services/api/user.service";
import {Filter} from "../../shared/model/api/filter";
import {Sort} from "../../shared/model/api/sort";
import {Address} from "../../shared/model/address";
import {filter, map, mergeMap} from "rxjs/operators";
import {AddressService} from "../../shared/services/api/address.service";

@Component({
	selector: "memo-user-map",
	templateUrl: "./user-map.component.html",
	styleUrls: ["./user-map.component.scss"]
})
export class UserMapComponent implements OnInit {
	users$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>(null);
	userAddresses$ :Observable<UserAddress[]> = this.users$.pipe(
		filter(it => it !== null),
		mergeMap(users => combineLatest(
			...users.map(user => this.addressService.getById(user.addresses[0]).pipe(
					map(address => ({
						...user,
						address
					}))
				)
			)
		))
	);

	@Input() set users(users :User[]){
		this.users$.next(users);
	}

	constructor(private userService:UserService,
				private addressService : AddressService) {
	}

	ngOnInit() {
		if(this.users$.getValue() === null){
			this.userService.getAll(Filter.none(), Sort.none()).subscribe(it => this.users = it)
		}
	}

}

export interface UserAddress extends User{
	address: Address;
}
