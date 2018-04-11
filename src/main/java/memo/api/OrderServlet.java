package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.OrderAuthStrategy;
import memo.communication.CommunicationManager;
import memo.communication.MessageType;
import memo.data.OrderRepository;
import memo.model.Order;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.model.User;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;


@WebServlet(name = "OrderServlet", value = "/api/order")
public class OrderServlet extends AbstractApiServlet<Order> {
    public OrderServlet() {
        super(new OrderAuthStrategy());
        logger = Logger.getLogger(OrderServlet.class);
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, Order object) {
        this.manyToOne(object, User.class, Order::getUser, Order::getId, User::getOrders, user -> user::setOrders);
        this.oneToMany(object, OrderedItem.class, Order::getItems, orderedItem -> orderedItem::setOrder);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.get(request, response,
                (paramMap, _response) -> OrderRepository.getInstance().get(
                        getParameter(paramMap, "id"),
                        getParameter(paramMap, "userId"),
                        getParameter(paramMap, "orderedItemId"),
                        _response
                ),
                "orders"
        );
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Order order = this.post(request, response, new ApiServletPostOptions<>(
                        "order", new Order(), Order.class, Order::getId
                )
                        .setTransform(it -> {
                            it.setItems(it.getItems().stream()
                                    .peek(orderedItem -> orderedItem.setOrder(it))
                                    .collect(Collectors.toList()));
                            return it;
                        })
        );

        if (order != null) {
            User user = order.getUser();
            List<ShopItem> orderedItems = order.getItems().stream()
                    .map(OrderedItem::getItem)
                    .collect(Collectors.toList());
            CommunicationManager.getInstance().sendList(user, orderedItems, MessageType.ORDER_CONFIRMATION);
        }
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.put(request, response, new ApiServletPutOptions<>(
                        "order", Order.class, Order::getId, "id"
                )
                        .setTransform(order -> {
                            order.setItems(order.getItems().stream()
                                    .peek(orderedItem -> orderedItem.setOrder(order))
                                    .collect(Collectors.toList()));
                            return order;
                        })
        );
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.delete(Order.class, request, response);
    }

}
