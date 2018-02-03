package memo.serialization;

import memo.model.Image;

public class ImagePathListSerializer extends IdListSerializer<Image, String> {
    public ImagePathListSerializer() {
        super(Image::getFullPath, Image.class);
    }
}
