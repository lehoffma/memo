package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.data.CommentRepository;
import memo.model.Comment;
import memo.model.ShopItem;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import memo.util.ListBuilder;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@WebServlet(name = "CommentServlet", value = "/api/comment")
public class CommentServlet extends HttpServlet {

    final static Logger logger = Logger.getLogger(CommentServlet.class);

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);
        String commentId = request.getParameter("id");
        String eventId = request.getParameter("eventId");
        String authorId = request.getParameter("authorId");

        List<Comment> comments = CommentRepository.getInstance().get(commentId, eventId, authorId, response);

        if (ApiUtils.stringIsNotEmpty(commentId) && comments.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        ApiUtils.getInstance().serializeObject(response, comments, "comments");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "comment");
        logger.debug("Method POST called");

        Comment comment = ApiUtils.getInstance().updateFromJson(jObj, new Comment(), Comment.class);

        DatabaseManager.getInstance().save(comment);
        if (comment.getParent() != null) {
            Comment parent = comment.getParent();
            ListBuilder<Comment> newChildren = new ListBuilder<Comment>()
                    .buildAll(Optional.ofNullable(parent.getChildren()).orElse(new ArrayList<>()))
                    .buildAdd(comment);
            parent.setChildren(newChildren);
            DatabaseManager.getInstance().update(parent);
        }
        ShopItem item = comment.getItem();
        ListBuilder<Comment> newComments = new ListBuilder<Comment>()
                .buildAll(Optional.ofNullable(item.getComments()).orElse(new ArrayList<>()))
                .buildAdd(comment);
        item.setComments(newComments);
        DatabaseManager.getInstance().update(item);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response, comment.getId(), "id");

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method PUT called");
        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "address");


        if (!jObj.has("id")) {
            ApiUtils.getInstance().processInvalidError(response);
            return;
        }

        Comment comment = DatabaseManager.getInstance().getById(Comment.class, jObj.get("id").asInt());

        if (comment == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }


        comment = ApiUtils.getInstance().updateFromJson(jObj, comment, Comment.class);
        DatabaseManager.getInstance().update(comment);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response, comment.getId(), "id");

    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {
        ApiUtils.getInstance().deleteFromDatabase(Comment.class, request, response);
    }
}
