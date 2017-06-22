import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ModifyMerchStockComponent} from "./modify-merch-stock.component";

describe("ModifyMerchStockComponent", () => {
	let component: ModifyMerchStockComponent;
	let fixture: ComponentFixture<ModifyMerchStockComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ModifyMerchStockComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ModifyMerchStockComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
