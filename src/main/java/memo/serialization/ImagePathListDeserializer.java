package memo.serialization;

import memo.data.ImageRepository;
import memo.model.Image;

public class ImagePathListDeserializer extends IdListDeserializer<Image> {
    public ImagePathListDeserializer() {
        super(ImageRepository::getInstance, (imageRepository, s) -> ((ImageRepository) imageRepository).getByApiPath(s), Image.class);
    }
}
