import {inject, TestBed} from "@angular/core/testing";
import {SearchFilterService} from "./search-filter.service";

describe("SearchFilterService", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [SearchFilterService]
		});
	});

	it("should ...", inject([SearchFilterService], (service: SearchFilterService) => {
		expect(service).toBeTruthy();
	}));

	it("todo: test", inject([SearchFilterService], (service: SearchFilterService) => {
		expect(service).toBeTruthy();

		//todo test
	}))
});
