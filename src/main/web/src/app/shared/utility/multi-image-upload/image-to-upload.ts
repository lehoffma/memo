export interface ImageToUpload {
	id: string;
	name: string;
	data: any
}

export function isImageToUpload(value: any): value is ImageToUpload {
	return value.id !== undefined && value.name !== undefined && value.data !== undefined
		&& value.name !== value.data;
}
