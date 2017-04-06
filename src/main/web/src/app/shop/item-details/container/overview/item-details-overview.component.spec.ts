import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {ItemDetailsOverviewComponent} from "./item-details-overview.component";


describe("ItemDetailsOverviewComponent", () => {
	let component: ItemDetailsOverviewComponent;
	let fixture: ComponentFixture<ItemDetailsOverviewComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ItemDetailsOverviewComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ItemDetailsOverviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
