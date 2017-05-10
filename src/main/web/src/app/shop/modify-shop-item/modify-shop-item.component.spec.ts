import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ModifyShopItemComponent} from "./modify-shop-item.component";

describe("ModifyShopItemComponent", () => {
	let component: ModifyShopItemComponent;
	let fixture: ComponentFixture<ModifyShopItemComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ModifyShopItemComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ModifyShopItemComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
