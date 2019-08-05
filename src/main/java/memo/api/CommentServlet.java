package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.CommentAuthStrategy;
import memo.communication.strategy.CommentNotificationStrategy;
import memo.data.CommentRepository;
import memo.model.Comment;
import memo.model.ShopItem;
import org.apache.logging.log4j.LogManager;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


@Path("/comment")
@Named
@RequestScoped
public class CommentServlet extends AbstractApiServlet<Comment> {
    private CommentRepository commentRepository;

    public CommentServlet() {
    }

    @Inject
    public CommentServlet(CommentRepository commentRepository,
                          CommentAuthStrategy authStrategy,
                          CommentNotificationStrategy commentNotificationStrategy,
                          AuthenticationService authService) {
        super();
        logger = LogManager.getLogger(CommentServlet.class);
        this.commentRepository = commentRepository;
        this.notificationStrategy = commentNotificationStrategy;
        this.authenticationStrategy = authStrategy;
        this.authenticationService = authService;
    }


    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Object get(@Context HttpServletRequest request) {
        return this.get(request, commentRepository);
    }

    @Override
    public void updateDependencies(JsonNode jsonNode, Comment object) {
        this.manyToOne(object, Comment.class, Comment::getParent, Comment::getId, Comment::getChildren, comment -> comment::setChildren);
        this.manyToOne(object, ShopItem.class, Comment::getItem, Comment::getId, ShopItem::getComments, shopItem -> shopItem::setComments);
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        Comment comment = this.post(request, body, new ApiServletPostOptions<>(
                "comment", new Comment(), Comment.class, Comment::getId
        ));

        return this.respond(comment, "id", Comment::getId);
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        Comment comment = this.put(request, body, new ApiServletPutOptions<>(
                        "comment", Comment.class, Comment::getId
                )
        );

        return this.respond(comment, "id", Comment::getId);
    }

    @DELETE
    public Response delete(@Context HttpServletRequest request) {
        this.delete(Comment.class, request);
        return Response.status(Response.Status.OK).build();
    }
}
