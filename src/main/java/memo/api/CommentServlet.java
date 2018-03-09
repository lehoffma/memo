package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.CommentAuthStrategy;
import memo.data.CommentRepository;
import memo.model.Comment;
import memo.model.ShopItem;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@WebServlet(name = "CommentServlet", value = "/api/comment")
public class CommentServlet extends AbstractApiServlet<Comment> {

    public CommentServlet() {
        super(new CommentAuthStrategy());
        logger = Logger.getLogger(CommentServlet.class);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response,
                (paramMap, _response) -> CommentRepository.getInstance().get(
                        getParameter(paramMap, "id"),
                        getParameter(paramMap, "eventId"),
                        getParameter(paramMap, "authorId"),
                        response
                ),
                "comments");
    }

    @Override
    public void updateDependencies(JsonNode jsonNode, Comment object) {
        this.manyToOne(object, Comment::getParent, Comment::getId, Comment::getChildren, comment -> comment::setChildren);
        this.manyToOne(object, Comment::getItem, Comment::getId, ShopItem::getComments, shopItem -> shopItem::setComments);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        this.post(request, response, new ApiServletPostOptions<>(
                "comment", new Comment(), Comment.class, Comment::getId,
                this::updateDependencies
        ));
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {
        this.put(request, response, new ApiServletPutOptions<>(
                        "comment", Comment.class, Comment::getId
                )
                        .setUpdateDependencies(this::updateDependencies)
        );
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {
        this.delete(Comment.class, request, response);
    }
}
