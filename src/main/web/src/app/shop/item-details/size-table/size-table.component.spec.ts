import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {SizeTableComponent} from "./size-table.component";


describe("SizeTableComponent", () => {
	let component: SizeTableComponent;
	let fixture: ComponentFixture<SizeTableComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SizeTableComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SizeTableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
