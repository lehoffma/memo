import {ImageToUpload} from "../../../shared/multi-image-upload/image-to-upload";

export interface ModifiedImages {
	imagePaths: string[],
	imagesToUpload: ImageToUpload[]
}
