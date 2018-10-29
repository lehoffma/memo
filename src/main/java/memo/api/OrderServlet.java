package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.OrderAuthStrategy;
import memo.communication.strategy.OrderNotificationStrategy;
import memo.data.CapacityService;
import memo.data.OrderRepository;
import memo.data.StockRepository;
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
import java.util.*;
import java.util.stream.Collectors;

@Path("/order")
@Named
@RequestScoped
public class OrderServlet extends AbstractApiServlet<Order> {
    private StockRepository stockRepository;
    private OrderRepository orderRepository;
    private CapacityService capacityService;

    public OrderServlet() {
        super();
        logger = LogManager.getLogger(OrderServlet.class);
    }

    @Inject
    public OrderServlet(StockRepository stockRepository,
                        OrderRepository orderRepository,
                        OrderAuthStrategy authStrategy,
                        OrderNotificationStrategy notifyStrategy,
                        AuthenticationService authService,
                        CapacityService capacityService) {
        this.stockRepository = stockRepository;
        this.orderRepository = orderRepository;
        this.authenticationStrategy = authStrategy;
        this.notificationStrategy = notifyStrategy;
        this.authenticationService = authService;
        this.capacityService = capacityService;
    }


    @Override
    protected void updateDependencies(JsonNode jsonNode, Order object) {
        this.manyToOne(object, User.class, Order::getUser, Order::getId, User::getOrders, user -> user::setOrders);
        this.oneToMany(object, OrderedItem.class, Order::getItems, orderedItem -> orderedItem::setOrder);
    }

    public boolean checkOrder(Order order) {
        return checkOrder(new ArrayList<>(order.getItems()));
    }

    /**
     * Checks if the items ordered by the user are out of stock
     *
     * @return
     */
    public boolean checkOrder(List<OrderedItem> orderedItems) {

        List<OrderedItem> partysAndEvents = orderedItems.stream()
                .filter(item -> item.getItem().getType() != EventType.merch.getValue())
                .collect(Collectors.toList());
        Map<ShopItem, Integer> seatsAfterBuying = new HashMap<>();
        //count how often an item is bought and check whether the available stock is enough to fulfill that requirement
        for (OrderedItem orderedItem : partysAndEvents) {
            ShopItem item = orderedItem.getItem();

            if (seatsAfterBuying.containsKey(item)) {
                seatsAfterBuying.put(item, seatsAfterBuying.get(item) - 1);
            } else {
                seatsAfterBuying.put(item, capacityService.get(item.getId())
                        .map(EventCapacity::getCapacity)
                        .orElse(0) - 1);
            }

            if (seatsAfterBuying.get(item) < 0) {
                return true;
            }
        }

        List<OrderedItem> merchandise = orderedItems.stream()
                .filter(item -> item.getItem().getType() == EventType.merch.getValue())
                .collect(Collectors.toList());

        Map<String, Integer> stockAfterBuying = new HashMap<>();
        //count how often an item is bought and check whether the available stock is enough to fulfill that requirement
        for (OrderedItem orderedItem : merchandise) {
            ShopItem item = orderedItem.getItem();
            Color color = orderedItem.getColor();
            String size = orderedItem.getSize();
            String key = item.getId() + "-" + color.getName() + "-" + size;

            if (stockAfterBuying.containsKey(key)) {
                stockAfterBuying.put(key, stockAfterBuying.get(key) - 1);
            } else {
                List<Stock> stock = new ArrayList<>(stockRepository.findByShopItem(item.getId().toString()));
                int availableStock = stock.stream()
                        .filter(it -> it.getColor().getName().equalsIgnoreCase(color.getName())
                                && it.getSize().equalsIgnoreCase(size))
                        .mapToInt(Stock::getAmount)
                        .sum();

                stockAfterBuying.put(key, availableStock - 1);
            }

            if (stockAfterBuying.get(key) < 0) {
                return true;
            }
        }


        return false;
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Object get(@Context HttpServletRequest request) {
        return this.get(request, orderRepository);
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        Order order = this.post(request, body, new ApiServletPostOptions<>(
                        "order", new Order(), Order.class, Order::getId
                )
                        .setTransform(it -> {
                            it.setItems(new ArrayList<>(it.getItems()).stream()
                                    .peek(orderedItem -> orderedItem.setOrder(it))
                                    .collect(Collectors.toList()));
                            return it;
                        })
                        .setPreconditions(Arrays.asList(
//                                new ModifyPrecondition<>(
//                                        OrderServlet::checkOrder,
//                                        "This Item is already sold out.",
//                                        () -> response.setStatus(HttpServletResponse.SC_PRECONDITION_FAILED)
//                                )
                        ))
        );

        return this.respond(order, "id", Order::getId);
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        //todo update: condition
        Order updatedOrder = this.put(request, body, new ApiServletPutOptions<>(
                        "order", Order.class, Order::getId, "id"
                )
                        .setTransform(order -> {
                            order.setItems(new ArrayList<>(order.getItems()).stream()
                                    .peek(orderedItem -> orderedItem.setOrder(order))
                                    .collect(Collectors.toList()));
                            return order;
                        })
        );

        return this.respond(updatedOrder, "id", Order::getId);
    }

    @DELETE
    public Response delete(@Context HttpServletRequest request) {
        this.delete(Order.class, request);
        return Response.ok().build();
    }
}
