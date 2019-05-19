package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.OrderAuthStrategy;
import memo.communication.strategy.OrderNotificationStrategy;
import memo.data.OrderRepository;
import memo.data.OrderStateRepository;
import memo.model.Order;
import memo.model.User;
import org.apache.logging.log4j.LogManager;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

@Path("/order")
@Named
@RequestScoped
public class OrderStateServlet extends AbstractApiServlet<Order> {
    private OrderRepository orderRepository;
    private OrderStateRepository orderStateRepository;

    public OrderStateServlet() {
        super();
        logger = LogManager.getLogger(OrderStateServlet.class);
    }

    @Inject
    public OrderStateServlet(
            OrderRepository orderRepository,
            OrderStateRepository orderStateRepository,
            OrderAuthStrategy authStrategy,
            OrderNotificationStrategy notifyStrategy,
            AuthenticationService authService) {
        this.orderStateRepository = orderStateRepository;
        this.orderRepository = orderRepository;
        this.authenticationStrategy = authStrategy;
        this.notificationStrategy = notifyStrategy;
        this.authenticationService = authService;
    }


    private <T> Response readState(HttpServletRequest request, Supplier<T> stateSupplier, String responseKey) {
        User requestingUser = authenticationService.parseNullableUserFromRequestHeader(request);
        boolean isAllowed = this.authenticationStrategy.isAllowedToReadState(requestingUser);

        if (!isAllowed) {
            return Response.status(Response.Status.FORBIDDEN)
                    .build();
        }

        Map<String, T> response = new HashMap<>();
        response.put(responseKey, stateSupplier.get());

        return Response.ok(response).build();
    }


    @GET
    @Path("/open-orders")
    @Produces({MediaType.APPLICATION_JSON})
    public Response openOrders(@Context HttpServletRequest request) {
        return this.readState(request, () -> orderStateRepository.openOrders(), "openOrders");
    }

    @GET
    @Path("/total-orders")
    @Produces({MediaType.APPLICATION_JSON})
    public Response totalOrders(@Context HttpServletRequest request) {
        return this.readState(request, () -> orderStateRepository.totalOrders(), "totalOrders");
    }

    @GET
    @Path("/orders-over-time")
    @Produces({MediaType.APPLICATION_JSON})
    public Response ordersOverTime(@Context HttpServletRequest request) {
        //todo read from request?
        LocalDateTime from = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);
        LocalDateTime to = LocalDateTime.now();

        return this.readState(request, () -> orderStateRepository.ordersOverTime(from, to), "orders");
    }

    @GET
    @Path("/popular-items")
    @Produces({MediaType.APPLICATION_JSON})
    public Response popularItems(@Context HttpServletRequest request) {
        return this.readState(request, () -> orderStateRepository.popularItems(), "popularItems");
    }

    @GET
    @Path("/popular-colors")
    @Produces({MediaType.APPLICATION_JSON})
    public Response popularColors(@Context HttpServletRequest request) {
        return this.readState(request, () -> orderStateRepository.popularColors(), "popularColors");
    }

    @GET
    @Path("/popular-sizes")
    @Produces({MediaType.APPLICATION_JSON})
    public Response popularSizes(@Context HttpServletRequest request) {
        return this.readState(request, () -> orderStateRepository.popularSizes(), "popularSizes");
    }


    @Override
    protected void updateDependencies(JsonNode jsonNode, Order object) {

    }
}
