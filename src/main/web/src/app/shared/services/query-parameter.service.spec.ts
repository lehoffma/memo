import {inject, TestBed} from "@angular/core/testing";

import {QueryParameterService} from "./query-parameter.service";

describe("QueryParameterService", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [QueryParameterService]
		});
	});

	it("should ...", inject([QueryParameterService], (service: QueryParameterService) => {
		expect(service).toBeTruthy();
	}));

	it("todo: test", inject([QueryParameterService], (service: QueryParameterService) => {
		expect(service).toBeTruthy();

		//todo test
	}))
});
