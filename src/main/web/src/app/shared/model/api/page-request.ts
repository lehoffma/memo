import {PageEvent} from "@angular/material";

const DEFAULT_PAGE_SIZE = 20;

export class PageRequest {
	page: number;
	pageSize: number;

	constructor(page: number, pageSize: number) {
		this.page = page;
		this.pageSize = pageSize;
	}

	static all(){
		return new PageRequest(0, 10000);
	}

	static first(pageSize: number = DEFAULT_PAGE_SIZE) {
		return new PageRequest(0, pageSize);
	}

	static at(page: number, pageSize: number = DEFAULT_PAGE_SIZE) {
		return new PageRequest(page, pageSize);
	}

	static fromMaterialPageEvent(pageEvent: PageEvent): PageRequest {
		return PageRequest.at(pageEvent.pageIndex, pageEvent.pageSize);
	}

	prev() {
		return PageRequest.at(this.page - 1, this.pageSize);
	}

	next() {
		return PageRequest.at(this.page + 1, this.pageSize);
	}
}
