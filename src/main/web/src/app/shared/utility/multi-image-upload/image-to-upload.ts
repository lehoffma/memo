export interface ImageToUpload {
	id: string;
	name: string;
	data: any
}

export function isImageToUpload(value: any): value is ImageToUpload {
	return value.id !== undefined && value.name !== undefined && value.model !== undefined
		&& value.name !== value.model;
}
