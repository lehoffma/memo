package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.ModifyPrecondition;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.ParticipantsAuthStrategy;
import memo.data.EventRepository;
import memo.data.ParticipantRepository;
import memo.model.*;
import org.apache.logging.log4j.LogManager;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Path("/orderedItem")
@Named
@RequestScoped
public class OrderedItemServlet extends AbstractApiServlet<OrderedItem> {
    private ParticipantRepository participantRepository;
    private EventRepository eventRepository;
    private OrderServlet orderServlet;

    public OrderedItemServlet() {
    }

    @Inject
    public OrderedItemServlet(ParticipantRepository participantRepository,
                              OrderServlet orderServlet,
                              EventRepository eventRepository,
                              ParticipantsAuthStrategy authStrategy,
                              AuthenticationService authService) {
        super();
        logger = LogManager.getLogger(OrderedItemServlet.class);
        this.participantRepository = participantRepository;
        this.eventRepository = eventRepository;
        this.orderServlet = orderServlet;
        this.authenticationStrategy = authStrategy;
        this.authenticationService = authService;
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, OrderedItem object) {
        this.manyToOne(object, ShopItem.class, OrderedItem::getItem, OrderedItem::getId, ShopItem::getOrders,
                shopItem -> shopItem::setOrders);
        this.manyToOne(object, Color.class, OrderedItem::getColor, OrderedItem::getId, Color::getOrderedItems,
                color -> color::setOrderedItems);
        this.manyToOne(object, Order.class, OrderedItem::getOrder, OrderedItem::getId, Order::getItems,
                order -> order::setItems);
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Object get(@Context HttpServletRequest request) {
        return this.get(request, participantRepository);
    }


    @GET
    @Path("/state")
    @Produces({MediaType.APPLICATION_JSON})
    public Response getState(@Context HttpServletRequest request) {
        User requestingUser = authenticationService.parseNullableUserFromRequestHeader(request);

        Map<String, String[]> parameterMap = request.getParameterMap();
        String id = getParameter(parameterMap, "id");
        String showCancelled = getParameter(parameterMap, "showCancelled");
        Optional<ShopItem> optionalItem = this.eventRepository.getById(id);

        if (!optionalItem.isPresent()) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        ShopItem shopItem = optionalItem.get();
        boolean isAllowed = ((ParticipantsAuthStrategy) this.authenticationStrategy).isAllowedToReadState(requestingUser, shopItem);

        if (!isAllowed) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        return Response.ok(participantRepository.getStateOfItem(shopItem, showCancelled.equals("true"))).build();
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        OrderedItem createdItem = this.post(request, body, new ApiServletPostOptions<>(
                        "orderedItem", new OrderedItem(), OrderedItem.class, OrderedItem::getId
                )
                        .setPreconditions(Collections.singletonList(
                                new ModifyPrecondition<>(
                                        item -> orderServlet.checkOrder(Collections.singletonList(item)),
                                        "Item is already sold out",
                                        Response.Status.PRECONDITION_FAILED
                                )
                        ))
        );

        return this.respond(createdItem, "id", OrderedItem::getId);
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        OrderedItem item = this.put(request, body, new ApiServletPutOptions<>(
                "orderedItem", OrderedItem.class, OrderedItem::getId, "id"
        ));

        return this.respond(item, "id", OrderedItem::getId);
    }

    @DELETE
    public Response delete(@Context HttpServletRequest request) {
        this.delete(OrderedItem.class, request);
        return Response.ok().build();
    }
}
