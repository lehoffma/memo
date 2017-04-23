import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {profileCategories} from "./profile-info-category";
import {EventService} from "../../shared/services/event.service";
import {UserService} from "../../shared/services/user.service";
import {Event} from "../../shop/shared/model/event";
import {LogInService} from "../../shared/services/login.service";
import {NavigationService} from "../../shared/services/navigation.service";


@Component({
	selector: "memo-profile",
	templateUrl: "./profile.component.html",
	styleUrls: ["./profile.component.scss"]
})

export class ProfileComponent implements OnInit {
	userObservable: Observable<User>;
	userEvents: Observable<Event[]>;

	profileCategories = profileCategories;

	isOwnProfile: Observable<boolean>;

	constructor(private route: ActivatedRoute,
				private navigationService: NavigationService,
				private eventService: EventService,
				private loginService: LogInService,
				private userService: UserService) {

	}

	ngOnInit() {
		const userId = this.route.params.map(params => +params["id"]);

		this.isOwnProfile = userId.combineLatest(this.loginService.accountObservable,
			(profileId, currentUserId) => profileId === currentUserId);
		this.userObservable = userId.flatMap(id => this.userService.getById(id));
		this.userEvents = this.userObservable
			.flatMap(user => this.eventService.getEventsOfUser(user.id, {tours: true, partys: true}));
	}

	editProfile() {
		this.route.params.map(params => +params["id"])
			.first()
			.subscribe(
				id => this.navigationService.navigateByUrl(`/members/${id}/edit`)
			)
	}
}
