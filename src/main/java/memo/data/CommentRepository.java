package memo.data;

import memo.model.Comment;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.function.Function;

public class CommentRepository extends AbstractRepository<Comment> {

    private static final Logger logger = Logger.getLogger(CommentRepository.class);
    private static CommentRepository instance;

    private CommentRepository() {
        super(Comment.class);
    }

    public static CommentRepository getInstance() {
        if (instance == null) instance = new CommentRepository();
        return instance;
    }


    public List<Comment> getComments() {
        return DatabaseManager.createEntityManager().createQuery("SELECT c FROM Comment c", Comment.class).getResultList();
    }

    public List<Comment> findByEventId(String SEventID, HttpServletResponse response) {
        try {
            Integer eventID = Integer.parseInt(SEventID);
            return DatabaseManager.createEntityManager()
                    .createNamedQuery("Comment.findTopLevelByEventId", Comment.class)
                    .setParameter("eventID", eventID)
                    .getResultList();

        } catch (NumberFormatException e) {
            logger.error("Parsing error", e);
            ApiUtils.getInstance().processInvalidError(response);
        }
        return null;
    }

    public List<Comment> findByAuthorId(String SAuthorID, HttpServletResponse response) {
        try {
            Integer authorID = Integer.parseInt(SAuthorID);
            return DatabaseManager.createEntityManager()
                    .createNamedQuery("Comment.findByAuthorId", Comment.class)
                    .setParameter("authorID", "%" + authorID + "%")
                    .getResultList();

        } catch (NumberFormatException e) {
            logger.error("Parsing error", e);
            ApiUtils.getInstance().processInvalidError(response);
        }
        return null;
    }

    public List<Comment> get(String id, String SEventID, String SAuthorID, HttpServletResponse response) {
        return this.getIf(new MapBuilder<String, Function<String, List<Comment>>>()
                        .buildPut(id, this::get)
                        .buildPut(SEventID, s -> this.findByEventId(SEventID, response))
                        .buildPut(SAuthorID, s -> this.findByAuthorId(SAuthorID, response)),
                this.getAll()
        );
    }

    @Override
    public List<Comment> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT c FROM Comment c", Comment.class).getResultList();
    }
}
