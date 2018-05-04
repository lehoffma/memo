package memo.data;

import memo.auth.api.strategy.CommentAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.Comment;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

public class CommentRepository extends AbstractPagingAndSortingRepository<Comment> {

    private static final Logger logger = LogManager.getLogger(CommentRepository.class);
    private static CommentRepository instance;

    private CommentRepository() {
        super(Comment.class, new CommentAuthStrategy());
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

    private List<Predicate> getParentCommentOfEvent(CriteriaBuilder builder, Root<Comment> root, Filter.FilterRequest filterRequest) {
        //query = "SELECT c FROM Comment c WHERE c.item.id = :eventID AND c.parent = NULL "
        Predicate matchesAnyEventId = PredicateFactory.isEqualToSome(
                builder, root, filterRequest,
                Function.identity(),
                "item", "id"
        );
        Predicate hasNoParent = PredicateFactory.get(root, "parent")
                .map(builder::isNull)
                .orElse(PredicateFactory.isFalse(builder));

        return Collections.singletonList(builder.and(matchesAnyEventId, hasNoParent));
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<Comment> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest,
                new PredicateSupplierMap<Comment>()
                        .buildPut("eventId", this::getParentCommentOfEvent)
                        .buildPut("authorId", PredicateFactory
                                .getIdSupplier(commentRoot -> PredicateFactory.get(commentRoot, "author", "id")))
        );
    }


}
