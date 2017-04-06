import {Component, OnDestroy, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {Observable, Subscription} from "rxjs";
import {UserStore} from "../../shared/stores/user.store";
import {TourStore} from "../../shared/stores/tour.store";
import {Tour} from "../../shop/shared/model/tour";
import {Party} from "../../shop/shared/model/party";
import {PartyStore} from "../../shared/stores/party.store";
import {profileCategories} from "./profile-info-category";


@Component({
	selector: "memo-profile",
	templateUrl: "./profile.component.html",
	styleUrls: ["./profile.component.scss"]
})

export class ProfileComponent implements OnInit, OnDestroy {
	subscription: Subscription;
	userObservable: Observable<User>;

	profileCategories = profileCategories;

	constructor(private route: ActivatedRoute,
				private tourStore: TourStore,
				private userStore: UserStore,
				private partyStore: PartyStore) {

	}

	ngOnInit() {
		this.userObservable = this.route.params.map(params => +params["id"])
			.flatMap(id => this.userStore.getDataByID(id));
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	getEventsOfUser(id: number) {
		return Observable.zip(this.tourStore.data, this.partyStore.data, (tours, partys) => {
			//combine the two arrays into one
			return [...tours, ...partys];
		})
			.map((events: (Tour | Party)[]) =>
				events.filter(event =>
					event.participants.find(participants => participants.id === id) !== undefined
				)
			);
	}

	showEvent() {
		//todo
	}
}
