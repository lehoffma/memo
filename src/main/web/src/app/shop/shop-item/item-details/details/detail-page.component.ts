import {AfterViewInit, ChangeDetectorRef, Component, Input, NgZone, OnInit, QueryList, ViewChildren} from "@angular/core";
import {Event} from "../../../shared/model/event";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {PageRequest} from "../../../../shared/model/api/page-request";
import {Comment} from "../../../shared/model/comment";
import {ActivatedRoute, Router} from "@angular/router";
import {isComment} from "../../../../shared/model/util/model-type-util";
import {Page} from "../../../../shared/model/api/page";
import {userPermissions} from "../../../../shared/model/user";
import {Filter} from "../../../../shared/model/api/filter";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {PagedDataSource} from "../../../../shared/utility/material-table/paged-data-source";
import {filter, map, mergeMap, scan, startWith, take} from "rxjs/operators";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {Sort} from "../../../../shared/model/api/sort";
import {ParticipantUser} from "../../../shared/model/participant";
import {AddressService} from "../../../../shared/services/api/address.service";
import {Address} from "../../../../shared/model/address";
import {Permission} from "../../../../shared/model/permission";
import {LogInService} from "../../../../shared/services/api/login.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {canCheckIn, canConclude, canDeleteEntries, canEdit, canReadEntries, canReadOrders} from "../../../../util/permissions-util";
import {ItemImagePopupComponent} from "../image-popup/item-image-popup.component";
import {MatDialog} from "@angular/material/dialog";
import {SpiedOnElementDirective} from "../../../../shared/utility/spied-on-element.directive";
import {WindowService} from "../../../../shared/services/window.service";
import {OrderService} from "../../../../shared/services/api/order.service";
import {UserService} from "../../../../shared/services/api/user.service";
import {GroupedParticipants} from "../participants/participants.component";
import {ShareDialogComponent} from "../../../../shared/share-dialog/share-dialog.component";
import {NavigationService} from "../../../../shared/services/navigation.service";

@Component({
	selector: "memo-detail-page",
	templateUrl: "./detail-page.component.html",
	styleUrls: ["./detail-page.component.scss"]
})
export class DetailPageComponent implements OnInit, AfterViewInit {
	event$: BehaviorSubject<Event> = new BehaviorSubject<Event>(null);
	route$: Observable<Address[]> = this.event$
		.pipe(
			map(item => item.route),
			filter(route => route.length > 0),
			mergeMap(ids => combineLatest(
				...ids.map(id => this.addressService.getById(id))
			)),
		);
	participants$: Observable<GroupedParticipants[]> = this.event$
		.pipe(
			filter(item => item.id !== -1),
			mergeMap((item: Event) => this.participantService.getParticipantUsersByEvent(item.id, PageRequest.all(), Sort.none())),
			map(it => it.content),
			//group by user
			map((participants: ParticipantUser[]) => participants.reduce((acc: GroupedParticipants[], user) => {
				const index = acc.findIndex(it => it.user.id === user.user.id);
				if (index >= 0) {
					if (user.isDriver) {
						acc[index].isDriverAmount++;
					}
					if (user.needsTicket) {
						acc[index].needsTicketAmount++;
					}
					acc[index].extraPersons++;
				} else {
					acc.push({
						user: user.user,
						isDriverAmount: user.isDriver ? 1 : 0,
						needsTicketAmount: user.needsTicket ? 1 : 0,
						extraPersons: 0
					});
				}

				return acc;
			}, [])),
		);
	participantsLink$ = combineLatest(this.event$, this.loginService.currentUser$)
		.pipe(
			map(([item, user]) => {
				if (user !== null) {
					let permissions = userPermissions(user);
					return EventUtilityService.optionalShopItemSwitch(item, {
						tours: () => {
							return permissions.tour >= Permission.write
								? "/shop/tours/" + item.id + "/participants"
								: null
						},
						partys: () => {
							return permissions.party >= Permission.write
								? "/shop/partys/" + item.id + "/participants"
								: null
						}
					});
				}
				return null;
			})
		);
	permissions$: Observable<{
		checkIn: boolean;
		edit: boolean;
		conclude: boolean;
		orders: boolean;
		waitingList: boolean;
		entries: boolean;
		delete: boolean;
	}> = combineLatest(
		this.loginService.currentUser$,
		this.event$
	)
		.pipe(
			map(([currentUser, event]) => ({
				checkIn: canCheckIn(currentUser, event),
				edit: canEdit(currentUser, event),
				conclude: canConclude(currentUser, event),
				waitingList: canEdit(currentUser, event),
				orders: canReadOrders(currentUser, event),
				entries: canReadEntries(currentUser, event),
				delete: canDeleteEntries(currentUser, event)
			}))
		);
	page$ = new BehaviorSubject(PageRequest.first());
	commentDataSource: PagedDataSource<Comment> = new PagedDataSource<Comment>(this.commentService, this.page$);
	canLoadMore$ = this.commentDataSource.currentPage$.pipe(
		map((it: Page<Comment>) => !it.last)
	);
	filter$ = this.event$.pipe(
		filter(item => item && item.id >= 0),
		map(item => Filter.by({"eventId": "" + item.id}))
	);
	comments$ = this.commentDataSource.connect().pipe(
		map((it: Comment[]) => it.filter(comment => isComment(comment))),
		scan((acc, value) => [...acc, ...value])
	);
	images$: Observable<string[]> = this.event$
		.pipe(
			map(event => {
				if (!event) {
					return [];
				}
				if (event.groupPicture) {
					return [...event.images, event.groupPicture];
				} else {
					return [...event.images];
				}
			})
		);
	subscriptions = [];


	//info, eventMap, description, eventParticipants, comments
	elements$ = new Subject<SpiedOnElementDirective[]>();
	sections: { id: string, label: string, predicate?: () => boolean }[] = [
		{id: "info", label: "Info"},
		{id: "eventMap", label: "Route", predicate: () => !this.isMerch(this.event$.getValue())},
		{id: "description", label: "Beschreibung"},
		{id: "eventParticipants", label: "Teilnehmer", predicate: () => !this.isMerch(this.event$.getValue())},
		{id: "comments", label: "Kommentare"}
	];
	currentSection$ = new BehaviorSubject<string>("info");
	@ViewChildren(SpiedOnElementDirective) elementRefs: QueryList<SpiedOnElementDirective>;

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private userService: UserService,
				private zone: NgZone,
				private participantService: OrderedItemService,
				private orderService: OrderService,
				private cdRef: ChangeDetectorRef,
				private loginService: LogInService,
				private navigationService: NavigationService,
				private window: WindowService,
				private commentService: CommentService,
				private matDialog: MatDialog,
				private addressService: AddressService) {
		this.commentDataSource.isExpandable = false;
		this.commentDataSource.filter$ = this.filter$;
	}

	get event() {
		return this.event$.getValue();
	}

	@Input() set event(event: Event) {
		this.event$.next(event);
		// setTimeout(() => this.cdRef.detectChanges());
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
		this.commentDataSource.disconnect(null);
	}

	/**
	 *
	 * @param {Comment} comment
	 * @param {number} parentId
	 */
	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id, parentId)
			.subscribe(() => {
				this.commentDataSource.reload();
			});
	}

	loadMoreComments() {
		const currentValue = this.page$.getValue();
		this.page$.next(PageRequest.at(currentValue.page + 1, currentValue.pageSize));
	}

	showDetailedImage(selectedImage: string) {
		this.images$.pipe(take(1))
			.subscribe(images => {
				this.matDialog.open(ItemImagePopupComponent, {
					data: {
						images: images,
						imagePath: selectedImage
					}
				})
			})
	}


	isTour(item: any) {
		return EventUtilityService.isTour(item);
	}

	isMerch(item: any) {
		return EventUtilityService.isMerchandise(item);
	}

	onSectionChange(event: SpiedOnElementDirective) {
		if (event === null) {
			this.currentSection$.next(this.sections[0].id);
			this.cdRef.detectChanges();
			return;
		}
		this.currentSection$.next(event.id);
		this.cdRef.detectChanges();
	}

	ngAfterViewInit(): void {
		// setTimeout(() => {
		// 	this.elements$.next(this.elementRefs.toArray());
		// }, 1);
		this.elementRefs.changes.pipe(startWith(null)).subscribe(item => {
			this.zone.runOutsideAngular(() => {
				const elements = this.elementRefs.toArray();
				this.elements$.next(elements);
				this.cdRef.detectChanges();
			});
		})
	}


	scrollTo(section: { id: string, label: string, predicate?: () => boolean }) {
		const elements = this.elementRefs.toArray() as SpiedOnElementDirective[];
		const selectedElement = elements.find(it => it.id === section.id);
		if (!selectedElement) {
			console.warn("Could not find element " + section.id);
			return;
		}
		selectedElement.elementRef.nativeElement.scrollIntoView();
	}

	scrollToId(id: string) {
		this.scrollTo({id, label: ""});
	}

	openShareDialog() {
		//<protocol>//<hostname>:<port>/<pathname>
		const location = window.location;
		const url = location.protocol + "//" + location.hostname + (location.port === "80" ? '' : (':' + location.port)) + location.pathname;
		this.matDialog.open(ShareDialogComponent, {
			data: {
				title: this.event.title,
				url: url,
				description: this.event.description,
				image: this.event.images[0],
				additionalTags: []
			}
		})
	}

}
