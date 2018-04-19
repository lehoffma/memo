package memo.serialization;

import memo.model.Image;

public class ImagePathSerializer extends IdSerializer<Image, String> {
    protected ImagePathSerializer() {
        super(Image::getApiPath, Image.class);
    }
}
