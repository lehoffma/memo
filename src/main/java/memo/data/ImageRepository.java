package memo.data;

import memo.model.Image;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ImageRepository extends AbstractRepository<Image> {


    private static final Logger logger = Logger.getLogger(ImageRepository.class);
    private static ImageRepository instance;

    private ImageRepository() {
        super(Image.class);
    }

    public static ImageRepository getInstance() {
        if (instance == null) instance = new ImageRepository();
        return instance;
    }


    public Optional<Image> getByApiPath(String apiPath) {
        return Image.getFileNameFromApiPath(apiPath)
                .flatMap(this::getByFilePath);
    }

    public Optional<Image> getByFilePath(String fileName) {
        return Optional.of(DatabaseManager.createEntityManager().createQuery("SELECT i FROM Image i " +
                " WHERE i.fileName = :name", Image.class)
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
