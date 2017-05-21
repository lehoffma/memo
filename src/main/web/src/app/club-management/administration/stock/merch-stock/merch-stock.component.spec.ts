import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {MerchStockComponent} from "./merch-stock.component";

describe("MerchStockComponent", () => {
	let component: MerchStockComponent;
	let fixture: ComponentFixture<MerchStockComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MerchStockComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MerchStockComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
