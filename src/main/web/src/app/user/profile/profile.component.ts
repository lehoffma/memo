import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {profileCategories} from "./profile-info-category";
import {UserService} from "../../shared/services/api/user.service";
import {Event} from "../../shop/shared/model/event";
import {LogInService} from "../../shared/services/api/login.service";
import {NavigationService} from "../../shared/services/navigation.service";
import {AddressService} from "../../shared/services/api/address.service";
import {EventRoute} from "../../shop/shared/model/route";
import {Address} from "../../shared/model/address";
import {ParticipantsService} from "../../shared/services/api/participants.service";
import {defaultIfEmpty, first, map, mergeMap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";


@Component({
	selector: "memo-profile",
	templateUrl: "./profile.component.html",
	styleUrls: ["./profile.component.scss"]
})

export class ProfileComponent implements OnInit {
	userId = this.route.params
		.pipe(
			first(),
			map(params => +params["id"])
		);
	userObservable: Observable<User> = this.userId
		.pipe(
			mergeMap(id => this.userService.getById(id))
		);
	userEvents: Observable<Event[]> = this.userObservable
		.pipe(
			mergeMap(user => this.participantService.getParticipatedEventsOfUser(user.id))
		);
	userDestinations: Observable<Address[]> = this.userEvents
		.pipe(
			mergeMap(events => combineLatest(...events
				.map(event => event.route)
				.filter(route => route.length > 1)
				.map((route: EventRoute) => this.addressService.getById(route[route.length - 1]))))
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
	isOwnProfile: Observable<boolean> = combineLatest(this.userId, this.loginService.accountObservable)
		.pipe(
			map(([profileId, currentUserId]) => profileId === currentUserId)
		);
	profileCategories = profileCategories;

	constructor(private route: ActivatedRoute,
				private navigationService: NavigationService,
				private addressService: AddressService,
				private participantService: ParticipantsService,
				private loginService: LogInService,
				private userService: UserService) {

	}

	ngOnInit() {
	}

	editProfile() {
		this.route.params.map(params => +params["id"])
			.pipe(
				first()
			)
			.subscribe(
				id => this.navigationService.navigateByUrl(`/members/${id}/edit`)
			)
	}
}
