import {Component, OnDestroy, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {UserStore} from "../../shared/stores/user.store";
import {TourStore} from "../../shared/stores/tour.store";
import {Tour} from "../../shared/model/tour";
import {Party} from "../../shared/model/party";
import {PartyStore} from "../../shared/stores/party.store";

interface ProfileInfoCategory {
    name: string,
    icon: string,
    key: string,
    isDate?: boolean
}

type ProfileCategory = ProfileInfoCategory[];

const profileCategories: ProfileCategory[] = [
    [
        {
            name: "Rolle",
            icon: "work",
            key: "clubRole"
        },
        {
            name: "Geburtstag",
            icon: "cake",
            key: "birthDate",
            isDate: true
        },
    ],
    [
        {
            name: "Telefonnummer",
            icon: "local_phone",
            key: "telephone"
        },
        {
            name: "Email-Adresse",
            icon: "local_post_office",
            key: "email"
        }
    ],
    // [
    //     {
    //         name: "Adresse",
    //         icon: "home",
    //         key: "address"
    //     },
    //     {
    //         name: "Bankkonto",
    //         icon: "account_balance",
    //         key: "bankAccount"
    //     }
    // ]
    [
        {
            name: "Meilen",
            icon: "directions_car",
            key: "miles"
        },
        {
            name: "Interessen",
            icon: "favorite",
            key: ""
        }
    ]
];


@Component({
    selector: "account-profiles",
    templateUrl: "./account-profile.component.html",
    styleUrls: ["./account-profile.component.scss"]
})

export class AccountProfileComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    observableUser: Observable<User>;
    user: User;

    profileCategories = profileCategories;

    constructor(private route: ActivatedRoute,
                private tourStore: TourStore,
                private userStore: UserStore,
                private partyStore: PartyStore) {

    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            let id = +params['id']; // (+) converts string 'id' to a number

            this.observableUser = this.userStore.getDataByID(id);
            this.observableUser.subscribe(user => {
                this.user = user;

            })
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getEventsOfUser(id: number) {
        return Observable.zip(this.tourStore.data, this.partyStore.data, (tours, partys) => {
            //combine the two arrays into one
            return [...tours, ...partys];
        })
            .map((events: (Tour|Party)[]) =>
                events.filter(event =>
                    event.participants.find(participants => participants.id=== id) !== undefined
                )
            );
    }

    showEvent() {
        //todo
    }
}