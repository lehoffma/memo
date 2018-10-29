package memo.data;

import memo.model.Image;
import memo.util.DatabaseManager;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Named
@ApplicationScoped
public class ImageRepository extends AbstractRepository<Image> {

    public ImageRepository() {
        super(Image.class);
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
