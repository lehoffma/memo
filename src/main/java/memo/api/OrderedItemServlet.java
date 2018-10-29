package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.ModifyPrecondition;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.ParticipantsAuthStrategy;
import memo.data.ParticipantRepository;
import memo.model.Color;
import memo.model.Order;
import memo.model.OrderedItem;
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
import java.util.Collections;

@Path("/orderedItem")
@Named
@RequestScoped
public class OrderedItemServlet extends AbstractApiServlet<OrderedItem> {
    private ParticipantRepository participantRepository;
    private OrderServlet orderServlet;

    public OrderedItemServlet() {
    }

    @Inject
    public OrderedItemServlet(ParticipantRepository participantRepository,
                              OrderServlet orderServlet,
                              ParticipantsAuthStrategy authStrategy,
                              AuthenticationService authService) {
        super();
        logger = LogManager.getLogger(OrderedItemServlet.class);
        this.participantRepository = participantRepository;
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
