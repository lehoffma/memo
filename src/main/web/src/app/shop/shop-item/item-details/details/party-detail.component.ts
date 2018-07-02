import {Component, OnDestroy, OnInit} from "@angular/core";
import {createParty, Party} from "../../../shared/model/party";
import {ActivatedRoute, Router} from "@angular/router";
import {EventService} from "../../../../shared/services/api/event.service";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {BehaviorSubject, EMPTY, Observable, of, throwError} from "rxjs";
import {catchError, mergeMap} from "rxjs/operators";
import {AddressService} from "../../../../shared/services/api/address.service";


@Component({
	selector: "memo-party-details",
	templateUrl: "./party-detail.component.html",
	styles: [
		`
			.description {
				white-space: pre-wrap;
			}

			memo-comments-section {
				width: 100%;
			}

			/*todo remove*/
			:host /deep/ .item-details-parent-container {
				margin-bottom: 8rem !important;
			}

			memo-route-list {
				display: block;
				border-bottom: 1px solid #ededed;
				margin: -1rem -1rem 1rem;
				padding: 0 1rem;
			}

			@media all and (min-width: 1050px) {
				memo-route-list {
					width: calc(50% + 2rem);
					background: white;
					border-right: 1px solid #ededed;
					border-bottom: none;
					margin-bottom: -1rem;
					height: 410px;
					overflow-y: auto;
				}

				memo-item-details-content /deep/ .object-details-content {
					display: flex;
				}

				memo-route-map {
					width: 50%;
					margin-left: 2rem;
				}
			}
		`
	]
})

export class PartyDetailComponent implements OnInit, OnDestroy {
	_party$: BehaviorSubject<Party> = new BehaviorSubject(createParty());

	party$: Observable<Party> = this._party$
		.pipe(
			mergeMap(event => event === undefined || !EventUtilityService.isParty(event)
				? throwError(new Error())
				: of(event)),
			catchError(error => {
				this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true});
				return EMPTY;
			})
		);

	subscriptions = [];

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private participantService: OrderedItemService,
				private loginService: LogInService,
				private commentService: CommentService,
				private addressService: AddressService,
				private eventService: EventService) {
		this.subscriptions.push(
			this.activatedRoute.params
				.pipe(
					mergeMap(params => this.eventService.getById(+params["id"]))
				)
				.subscribe(this._party$)
		);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}
}

