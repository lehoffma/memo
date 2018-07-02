import {ImageSizePipe} from "./image-size.pipe";

describe("ImageSizePipe", () => {
	it("create an instance", () => {
		const pipe = new ImageSizePipe();
		expect(pipe).toBeTruthy();
	});
});
