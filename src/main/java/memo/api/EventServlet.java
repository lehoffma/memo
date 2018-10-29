package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.AuthenticationService;
import memo.communication.strategy.ShopItemNotificationStrategy;
import memo.data.EventRepository;
import memo.model.*;
import memo.util.model.EventType;
import org.apache.logging.log4j.LogManager;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/event")
@Named
@RequestScoped
public class EventServlet extends AbstractApiServlet<ShopItem> {
    private EventRepository eventRepository;

    public EventServlet() {

    }

    @Inject
    public EventServlet(
            EventRepository eventRepository,
            ShopItemNotificationStrategy notifyStrategy,
            AuthenticationService authService
    ) {
        super();
        this.eventRepository = eventRepository;
        authenticationStrategy = eventRepository.getAuthenticationStrategy();
        notificationStrategy = notifyStrategy;
        authenticationService = authService;
        logger = LogManager.getLogger(EventServlet.class);
    }

    public static Integer getType(String sType) {
        return EventType.findByString(sType)
                .map(EventType::getValue)
                .orElse(0);
    }

    @Override
    protected ShopItem createCopy(ShopItem object) {
        return new ShopItem(object);
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, ShopItem object) {
        this.oneToMany(object, Entry.class, ShopItem::getEntries, entry -> entry::setItem);
        this.oneToMany(object, Comment.class, ShopItem::getComments, comment -> comment::setItem);
        this.manyToMany(object, User.class, ShopItem::getAuthor, ShopItem::getId, User::getAuthoredItems, user -> user::setAuthoredItems);
        this.manyToMany(object, User.class, ShopItem::getReportWriters, ShopItem::getId, User::getReportResponsibilities, user -> user::setReportResponsibilities);
        this.oneToMany(object, Image.class, ShopItem::getImages, image -> image::setItem);
        this.oneToMany(object, OrderedItem.class, ShopItem::getOrders, orderedItem -> orderedItem::setItem);
        this.oneToMany(object, Address.class, ShopItem::getRoute, address -> address::setItem);
        this.oneToMany(object, Stock.class, ShopItem::getStock, stock -> stock::setItem);
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, ShopItem object, ShopItem previous) {
        this.updateDependencies(jsonNode, object);
        this.nonOwningManyToMany(object, previous, User.class, ShopItem::getAuthor, ShopItem::getId, User::getAuthoredItems, user -> user::setAuthoredItems);
        this.nonOwningManyToMany(object, previous, User.class, ShopItem::getReportWriters, ShopItem::getId, User::getReportResponsibilities, user -> user::setReportResponsibilities);
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Object get(@Context HttpServletRequest request) {
        return this.get(request, eventRepository);
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        ApiServletPostOptions<ShopItem, Integer> options = new ApiServletPostOptions<ShopItem, Integer>()
                .setObjectName("event")
                .setBaseValue(new ShopItem())
                .setClazz(ShopItem.class)
                .setGetSerialized(ShopItem::getId);

        ShopItem item = this.post(request, body, options);

        return this.respond(item, options.getSerializedKey(), options.getGetSerialized());
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        ApiServletPutOptions<ShopItem, Integer> options = new ApiServletPutOptions<ShopItem, Integer>()
                .setObjectName("event")
                .setClazz(ShopItem.class)
                .setGetSerialized(ShopItem::getId);

//        String id = request.getParameter(options.getJsonId());
//        ShopItem previousValue = DatabaseManager.getInstance().getById(ShopItem.class, id);
//        List<User> previouslyResponsible = new ArrayList<>(previousValue.getAuthor());

        ShopItem changedItem = this.put(request, body, options);

        return this.respond(changedItem, options.getSerializedKey(), options.getGetSerialized());
    }

    @DELETE
    public Response delete(@Context HttpServletRequest request) {
        this.delete(ShopItem.class, request);
        return Response.ok().build();
    }
}
