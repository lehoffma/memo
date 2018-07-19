import {Component, OnInit} from "@angular/core";
import {User, userPermissions} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {profileCategories} from "./profile-info-category";
import {UserService} from "../../shared/services/api/user.service";
import {Event} from "../../shop/shared/model/event";
import {LogInService} from "../../shared/services/api/login.service";
import {NavigationService} from "../../shared/services/navigation.service";
import {AddressService} from "../../shared/services/api/address.service";
import {EventRoute} from "../../shop/shared/model/route";
import {Address} from "../../shared/model/address";
import {OrderedItemService} from "../../shared/services/api/ordered-item.service";
import {defaultIfEmpty, first, map, mergeMap} from "rxjs/operators";
import {combineLatest, Observable} from "rxjs";
import {MilesService} from "../../shared/services/api/miles.service";
import {ClubRole, isAuthenticated} from "../../shared/model/club-role";
import {Permission} from "../../shared/model/permission";
import {PageRequest} from "../../shared/model/api/page-request";
import {Direction, Sort} from "../../shared/model/api/sort";
import {setProperties} from "../../shared/model/util/base-object";


@Component({
	selector: "memo-profile",
	templateUrl: "./profile.component.html",
	styleUrls: ["./profile.component.scss"]
})

export class ProfileComponent implements OnInit {
	userId$ = this.route.params
		.pipe(
			map(params => +params["id"])
		);
	userObservable: Observable<User> = this.userId$
		.pipe(
			mergeMap(id => this.userService.getById(id)),
			mergeMap(user => this.milesService.get(user.id)
				.pipe(
					map(entry => setProperties(user, {miles: entry.miles}))
				)
			)
		);
	userEvents: Observable<Event[]> = this.userObservable
		.pipe(
			mergeMap(user => this.participantService.getParticipatedEventsOfUser(
				user.id,
				PageRequest.first(),
				Sort.by(Direction.DESCENDING, "date"))),
			map(it => it.content)
		);
	//todo pagination: as filter
	userDestinations: Observable<Address[]> = this.userEvents
		.pipe(
			map(events => [...events
				.map(event => event.route)
				.filter(route => route.length > 1)
				.map((route: EventRoute) => route[route.length - 1])]),
			mergeMap((addressIds: number[]) => combineLatest(
				...addressIds.map(id => this.addressService.getById(id))
			))
		);

	centerOfUserDestinations: Observable<any> = this.userDestinations
		.pipe(
			map(addresses => {
					let longitude = 0;
					let latitude = 0;
					addresses.forEach(tourRoute => {
						longitude += tourRoute.longitude;
						latitude += tourRoute.latitude;
					});
					longitude /= addresses.length;
					latitude /= addresses.length;

					return {longitude, latitude};
				}
			),
			defaultIfEmpty({
				longitude: 0,
				latitude: 0
			})
		);
	canEditUser: Observable<boolean> = combineLatest(this.userId$, this.loginService.currentUser$)
		.pipe(
			map(([profileId, currentUser]) => {
				return currentUser && (profileId === currentUser.id || isAuthenticated(currentUser.clubRole, ClubRole.Admin)
					|| userPermissions(currentUser).userManagement >= Permission.write);
			})
		);
	profileCategories = profileCategories;

	canReadPhoneNumber$: Observable<boolean> = combineLatest(this.userObservable, this.loginService.currentUser$).pipe(
		map(([profileUser, loggedInUser]) => loggedInUser && (profileUser.id === loggedInUser.id ||
			userPermissions(loggedInUser).userManagement >= Permission.read ||
			isAuthenticated(loggedInUser.clubRole, ClubRole.Vorstand)))
	);

	constructor(private route: ActivatedRoute,
				private navigationService: NavigationService,
				private milesService: MilesService,
				private addressService: AddressService,
				private participantService: OrderedItemService,
				private loginService: LogInService,
				private userService: UserService) {

	}

	ngOnInit() {
	}

	editProfile() {
		this.route.params
			.pipe(
				map(params => +params["id"]),
				first()
			)
			.subscribe(
				id => this.navigationService.navigateByUrl(`/members/${id}/edit`)
			)
	}
}
