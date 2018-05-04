package memo.data;

import memo.model.Image;
import memo.util.DatabaseManager;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ImageRepository extends AbstractRepository<Image> {

    private static ImageRepository instance;

    private ImageRepository() {
        super(Image.class);
    }

    public static ImageRepository getInstance() {
        if (instance == null) instance = new ImageRepository();
        return instance;
    }


    public Optional<Image> findByApiPath(String apiPath) {
        return Image.getFileNameFromApiPath(apiPath)
                .flatMap(this::findByFilePath);
    }

    public Optional<Image> findByFilePath(String fileName) {
        return Optional.of(DatabaseManager.createEntityManager()
                .createNamedQuery("Image.findByFileName", Image.class)
                .setParameter("name", fileName)
                .getResultList()
        )
                .filter(list -> !list.isEmpty())
                .map(list -> list.get(0));
    }


    @Override
    public List<Image> getAll() {
        return new ArrayList<>();
    }
}
