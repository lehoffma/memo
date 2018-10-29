package memo.serialization;

import memo.data.ImageRepository;
import memo.model.Image;

public class ImagePathDeserializer extends IdDeserializer<Image, ImageRepository> {
    public ImagePathDeserializer() {
        super(ImageRepository.class, ImageRepository::findByApiPath, Image.class);
    }
}
