package memo.serialization;

import memo.data.ImageRepository;
import memo.model.Image;

public class ImagePathListDeserializer extends IdListDeserializer<Image, ImageRepository> {
    public ImagePathListDeserializer() {
        super(ImageRepository.class, ImageRepository::findByApiPath, Image.class);
    }
}
