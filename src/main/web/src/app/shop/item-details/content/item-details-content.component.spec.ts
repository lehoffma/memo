import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {ItemDetailsContentComponent} from "./item-details-content.component";


describe("ItemDetailsContentComponent", () => {
	let component: ItemDetailsContentComponent;
	let fixture: ComponentFixture<ItemDetailsContentComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ItemDetailsContentComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ItemDetailsContentComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
