import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {profileCategories} from "./profile-info-category";
import {EventService} from "../../shared/services/event.service";
import {UserService} from "../../shared/services/user.service";
import {Event} from "../../shop/shared/model/event";


@Component({
	selector: "memo-profile",
	templateUrl: "./profile.component.html",
	styleUrls: ["./profile.component.scss"]
})

export class ProfileComponent implements OnInit {
	userObservable: Observable<User>;
	userEvents: Observable<Event[]>;

	profileCategories = profileCategories;

	constructor(private route: ActivatedRoute,
				private eventService: EventService,
				private userService: UserService) {

	}

	ngOnInit() {
		this.userObservable = this.route.params.map(params => +params["id"])
			.flatMap(id => this.userService.getById(id));
		this.userEvents = this.userObservable
			.flatMap(user => this.eventService.getEventsOfUser(user.id, {tours: true, partys: true}));
	}
}
