package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.AuthenticationService;
import memo.data.EventRepository;
import memo.data.UserRepository;
import memo.discounts.auth.DiscountAuthStrategy;
import memo.discounts.data.DiscountRepository;
import memo.discounts.model.DiscountEntity;
import memo.model.Entry;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.model.Page;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/discounts")
@Named
@RequestScoped
public class DiscountServlet extends AbstractApiServlet<DiscountEntity> {
    private DiscountRepository discountRepository;
    private EventRepository eventRepository;
    private UserRepository userRepository;

    public DiscountServlet() {
    }


    @Inject
    public DiscountServlet(AuthenticationService authService,
                           DiscountAuthStrategy discountAuthStrategy,
                           EventRepository eventRepository,
                           UserRepository userRepository,
                           DiscountRepository discountRepository) {
        super(discountAuthStrategy);
        this.authenticationService = authService;
        this.discountRepository = discountRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, DiscountEntity object) {

    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, DiscountEntity object, DiscountEntity previous) {
        //todo update the many-to-many deps?
        this.nonOwningManyToMany(object, previous, OrderedItem.class, DiscountEntity::getOrderedItems,
                DiscountEntity::getId, OrderedItem::getDiscounts, orderedItem -> orderedItem::setDiscounts);
    }

    public interface TriFunction<T, U, V> {
        V apply(T t, U u);
    }

    private Page<DiscountEntity> getDiscounts(String itemId, String userId,
                                              TriFunction<ShopItem, User, Page<DiscountEntity>> inputConsumer) {
        ShopItem shopItem = itemId == null
                ? null
                : this.eventRepository.getById(itemId)
                .orElseThrow(() -> new WebApplicationException("ShopItem not found!", Response.Status.NOT_FOUND));

        User user = userId == null
                ? null
                : this.userRepository.getById(userId)
                .orElseThrow(() -> new WebApplicationException("User not found!", Response.Status.NOT_FOUND));

        return inputConsumer.apply(shopItem, user);
    }

    @GET
    @Path("getPossibilities")
    public Page<DiscountEntity> getPossibilities(@QueryParam("itemId") String itemId,
                                                 @QueryParam("userId") String userId,
                                                 @Context HttpServletRequest request) {
        return this.getDiscounts(itemId, userId, (shopItem, user) -> this.get(
                request,
                discountRepository,
                (repository, id, pageRequest, filter, sort, requestingUser, serializationOption) ->
                        this.discountRepository.getDiscountPossibilities(shopItem, user, pageRequest)
        ));
    }

    @GET
    @Path("get")
    public Page<DiscountEntity> get(@QueryParam("itemId") String itemId,
                                    @QueryParam("userId") String userId,
                                    @Context HttpServletRequest request) {
        return this.getDiscounts(itemId, userId, (shopItem, user) -> this.get(
                request,
                discountRepository,
                (repository, id, pageRequest, filter, sort, requestingUser, serializationOption) ->
                        this.discountRepository.getDiscounts(shopItem, user, pageRequest)
        ));
    }


    @GET
    public Object get(@Context HttpServletRequest request) {
        //to enable getById/filtering stuff
        return this.get(request, discountRepository);
    }


    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        DiscountEntity entry = this.post(request, body, new ApiServletPostOptions<>(
                "discount", new DiscountEntity(), DiscountEntity.class, DiscountEntity::getId
        ));

        return this.respond(entry, "id", DiscountEntity::getId);
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        DiscountEntity entry = this.put(request, body, new ApiServletPutOptions<>(
                "discount", DiscountEntity.class, DiscountEntity::getId
        ));

        return this.respond(entry, "id", DiscountEntity::getId);
    }

}
