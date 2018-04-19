package memo.serialization;

import memo.data.ImageRepository;
import memo.model.Image;

public class ImagePathDeserializer extends IdDeserializer<Image> {
    public ImagePathDeserializer() {
        super(ImageRepository::getInstance, (imageRepository, s) -> ((ImageRepository) imageRepository).findByApiPath(s), Image.class);
    }
}
