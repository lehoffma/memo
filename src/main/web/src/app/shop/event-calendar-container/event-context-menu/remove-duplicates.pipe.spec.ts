import {RemoveDuplicatesPipe} from "./remove-duplicates.pipe";

describe("RemoveDuplicatesPipe", () => {
	it("create an instance", () => {
		const pipe = new RemoveDuplicatesPipe<any>();
		expect(pipe).toBeTruthy();
	});

	it("doesn't change lists without duplicates", () => {
		const pipe = new RemoveDuplicatesPipe<any>();
		let list = [];
		expect(pipe.transform(list).length).toBe(0);
		list = [1, 2, 3];
		expect(pipe.transform(list).length).toBe(3);
		list = ["hallo"];
		expect(pipe.transform(list).length).toBe(1);
	});

	it("removes trivial duplicates", () => {
		const pipe = new RemoveDuplicatesPipe<any>();
		let list: any[] = [1, 2, 3, 4, 5, 2, 2, 4, 5, 6];
		expect(pipe.transform(list).length).toBe(6);
		list = ["a", "a", "a", "a"];
		expect(pipe.transform(list).length).toBe(1);
	});

	it("removes duplicates with provided function", () => {
		const pipe = new RemoveDuplicatesPipe<{ value: number }>();
		let list: { value: number }[] = [
			{value: 0},
			{value: 1},
			{value: 1},
			{value: 1},
			{value: 2}
		];
		expect(pipe.transform(list).length).toBe(5);
		expect(pipe.transform(list, (a, b) => a.value === b.value).length).toBe(3);
	})
});
