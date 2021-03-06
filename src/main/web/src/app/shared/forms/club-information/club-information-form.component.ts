import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {ClubRole} from "../../model/club-role";
import {Observable, Subject} from "rxjs";
import {UserService} from "../../services/api/user.service";
import {LogInService} from "../../services/api/login.service";
import {map, takeUntil} from "rxjs/operators";
import {BreakpointObserver} from "@angular/cdk/layout";

@Component({
	selector: "memo-club-information-form",
	templateUrl: "./club-information-form.component.html",
	styleUrls: ["./club-information-form.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubInformationFormComponent implements OnInit, OnDestroy {
	@Input() formGroup: FormGroup;

	isAdmin$: Observable<boolean> = this.loginService.currentUser$
		.pipe(map(user => user !== null && user.clubRole === ClubRole.Admin));
	clubRoleOptions = [ClubRole.Organisator, ClubRole.Admin, ClubRole.Vorstand, ClubRole.Kassenwart, ClubRole.Mitglied, ClubRole.Gast];

	onDestroy$ = new Subject();

	get isMobile() {
		return this.breakpointObserver.isMatched("(max-width: 650px)");
	}

	constructor(private breakpointObserver: BreakpointObserver,
				private userService: UserService,
				private loginService: LogInService) {
	}

	ngOnInit() {
		this.isAdmin$.pipe(takeUntil(this.onDestroy$)).subscribe(isAdmin => {
			if (isAdmin) {
				this.formGroup.get("clubRole").enable();
				this.formGroup.get("joinDate").enable();
			} else {
				this.formGroup.get("clubRole").disable();
				this.formGroup.get("joinDate").disable();
			}
		})
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

}
