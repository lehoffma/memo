package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import memo.model.Comment;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;


@WebServlet(name = "CommentServlet", value = "/api/comment")
public class CommentServlet extends HttpServlet {

    final static Logger logger = Logger.getLogger(CommentServlet.class);

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);
        String Sid = request.getParameter("id");
        String SEventID = request.getParameter("eventId");
        String SAuthorID = request.getParameter("authorId");

        List<Comment> comments = getCommentsFromDatabase(Sid, SEventID, SAuthorID, response);

        if (comments.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        ApiUtils.getInstance().serializeObject(response, comments, "comments");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "comment");
        logger.debug("Method POST called");

        Comment a = ApiUtils.getInstance().updateFromJson(jObj, new Comment(), Comment.class);
        DatabaseManager.getInstance().save(a);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response, a.getId(), "id");

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method PUT called");
        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "address");


        if (!jObj.has("id")) {
            ApiUtils.getInstance().processNotInvalidError(response);
            return;
        }

        Comment a = DatabaseManager.getInstance().getById(Comment.class, jObj.get("id").asInt());

        if (a == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }


        a = ApiUtils.getInstance().updateFromJson(jObj, a, Comment.class);
        DatabaseManager.getInstance().update(a);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response, a.getId(), "id");

    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().deleteFromDatabase(Comment.class, request, response);
    }


    private Comment updateCommentFromJson(JsonNode jComment, Comment c) {

       /*

        TemporalAccessor timeStamp = DateTimeFormatter.ISO_DATE_TIME.parse(jComment.get("timeStamp").getAsString());
        LocalDateTime date = LocalDateTime.from(timeStamp);
        c.setTimeStamp(date);
*/
        return c;
    }


    private List<Comment> getCommentsFromDatabase(String Sid, String SEventID, String SAuthorID, HttpServletResponse response) {

        // if ID is submitted
        if (ApiUtils.getInstance().isStringNotEmpty(Sid)) {
            Comment c = DatabaseManager.getInstance().getByStringId(Comment.class, Sid);
            if (c != null) {
                List<Comment> addresses = new ArrayList<>();
                addresses.add(c);
                return addresses;
            }
        }

        if (ApiUtils.getInstance().isStringNotEmpty(SEventID)) return getCommentsByEventID(SEventID, response);
        if (ApiUtils.getInstance().isStringNotEmpty(SAuthorID)) return getCommentsByAuthorID(SAuthorID, response);

        return getComments();

    }

    private List<Comment> getComments() {
        return DatabaseManager.createEntityManager().createQuery("SELECT c FROM Comment c", Comment.class).getResultList();
    }

    private List<Comment> getCommentsByEventID(String SEventID, HttpServletResponse response) {
        try {
            Integer eventID = Integer.parseInt(SEventID);
            //ToDo: gibt null aus wenn id nicht vergeben
            return DatabaseManager.createEntityManager().createQuery("SELECT c FROM Comment c " +
                    " WHERE c.item.id = :eventID", Comment.class)
                    .setParameter("eventID", eventID)
                    .getResultList();

        } catch (NumberFormatException e) {
            logger.error("Parsing error", e);
            ApiUtils.getInstance().processNotInvalidError(response);
        }
        return null;
    }

    private List<Comment> getCommentsByAuthorID(String SAuthorID, HttpServletResponse response) {
        try {
            Integer authorID = Integer.parseInt(SAuthorID);
            //ToDo: gibt null aus wenn id nicht vergeben
            return DatabaseManager.createEntityManager().createQuery("SELECT c FROM Comment c " +
                    " WHERE c.author.id = :authorID", Comment.class)
                    .setParameter("authorID", "%" + authorID + "%")
                    .getResultList();

        } catch (NumberFormatException e) {
            logger.error("Parsing error", e);
            ApiUtils.getInstance().processNotInvalidError(response);
        }
        return null;
    }
}
