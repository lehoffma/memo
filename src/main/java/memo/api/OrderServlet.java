package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.ModifyPrecondition;
import memo.auth.api.OrderAuthStrategy;
import memo.communication.CommunicationManager;
import memo.communication.MessageType;
import memo.data.CapacityService;
import memo.data.OrderRepository;
import memo.data.StockRepository;
import memo.data.UserRepository;
import memo.model.*;
import memo.util.EventType;
import memo.util.MapBuilder;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
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

    /**
     * Checks if the items ordered by the user are out of stock
     *
     * @param order
     * @return
     */
    private boolean checkOrder(Order order) {
        List<OrderedItem> orderedItems = new ArrayList<>(order.getItems());

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
                seatsAfterBuying.put(item, CapacityService.get(item.getId())
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
                List<Stock> stock = new ArrayList<>(StockRepository.getInstance().findByShopItem(item.getId().toString()));
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
                            it.setItems(new ArrayList<>(it.getItems()).stream()
                                    .peek(orderedItem -> orderedItem.setOrder(it))
                                    .collect(Collectors.toList()));
                            return it;
                        })
                        .setPreconditions(Arrays.asList(
                                new ModifyPrecondition<>(
                                        this::checkOrder,
                                        "This Item is already sold out.",
                                        () -> response.setStatus(HttpServletResponse.SC_PRECONDITION_FAILED)
                                )
                        ))
        );

        if (order != null) {
            User user = order.getUser();
            List<ShopItem> orderedItems = order.getItems().stream()
                    .map(OrderedItem::getItem)
                    .collect(Collectors.toList());
            CommunicationManager.getInstance().sendList(user, orderedItems, MessageType.ORDER_CONFIRMATION);

            User admin = UserRepository.getInstance().getAdmin();
            BankAcc bankAccount = order.getBankAccount();
            Map<String, Object> options = new MapBuilder<String, Object>()
                    .buildPut("order", order)
                    .buildPut("bankAcc", bankAccount);
            switch (order.getMethod()) {
                case Bar:
                    break;
                case Lastschrift:
                    CommunicationManager.getInstance().send(user, null, MessageType.DEBIT_CUSTOMER, options);
                    CommunicationManager.getInstance().send(admin, null, MessageType.DEBIT_TREASURER, options);
                    break;
                case Überweisung:
                    CommunicationManager.getInstance().send(user, null, MessageType.TRANSFER_CUSTOMER, options);
                    CommunicationManager.getInstance().send(admin, null, MessageType.TRANSFER_TREASURER, options);
                    break;
            }
        }
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //todo update: condition
        Order put = this.put(request, response, new ApiServletPutOptions<>(
                        "order", Order.class, Order::getId, "id"
                )
                        .setTransform(order -> {
                            order.setItems(new ArrayList<>(order.getItems()).stream()
                                    .peek(orderedItem -> orderedItem.setOrder(order))
                                    .collect(Collectors.toList()));
                            return order;
                        })
        );

        System.out.println(put);
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.delete(Order.class, request, response);
    }

}
