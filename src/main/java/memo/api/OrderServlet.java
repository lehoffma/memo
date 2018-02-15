package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import memo.data.OrderRepository;
import memo.model.*;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import memo.util.ListBuilder;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;


@WebServlet(name = "OrderServlet", value = "/api/order")
public class OrderServlet extends HttpServlet {

    private static final Logger logger = Logger.getLogger(OrderServlet.class);


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        String orderId = request.getParameter("id");
        String userId = request.getParameter("userId");

        logger.trace("GET called with parameters: orderId = " + orderId + ", userId = " + userId);

        List<Order> orders = OrderRepository.getInstance().get(orderId, userId, response);

        ArrayNode arrayNode = JsonNodeFactory.instance.arrayNode();

        orders.stream()
                .map(order -> {
                    JsonNode jsonOrder = ApiUtils.getInstance().toJsonNode(order);
                    //add the ordered items property to the util object

                    List<OrderedItem> orderedItems = OrderRepository.getInstance().getOrderedItemsByOrderId(order.getId());
                    ((ObjectNode) jsonOrder).set("items", ApiUtils.getInstance().toJsonNode(orderedItems));
                    return jsonOrder;
                })
                .forEach(arrayNode::add);

        ApiUtils.getInstance().serializeObject(response, arrayNode, "orders");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        logger.trace("POST called");

        Optional<JsonNode> jsonOrderOptional = ApiUtils.getInstance().getJsonObject(request)
                .map(it -> it.get("order"));

        if (jsonOrderOptional.isPresent()) {
            JsonNode jsonOrder = jsonOrderOptional.get();
            Order newOrder = ApiUtils.getInstance().updateFromJson(jsonOrder, new Order(), Order.class);

            // update Dependencies
            newOrder.getItems().forEach(it -> it.setOrder(newOrder));

            DatabaseManager.getInstance().save(newOrder);

            response.setStatus(HttpServletResponse.SC_CREATED);
            ApiUtils.getInstance().serializeObject(response, newOrder.getId(), "id");
        } else {
            logger.error("Could not parse json");
            ApiUtils.getInstance().processInvalidError(response);
        }

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);
        logger.trace("PUT called");

        Optional<JsonNode> jsonOrderOptional = ApiUtils.getInstance().getJsonObject(request);

        if (jsonOrderOptional.isPresent()) {
            JsonNode jsonOrder = jsonOrderOptional.get();
            Order order = DatabaseManager.getInstance().getById(Order.class, jsonOrder.get("id").asInt());

            if (order == null) {
                response.getWriter().append("Not found");
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }


            order = updateOrderFromJson(jsonOrder, order);

            List<Stock> updatedStocks = new ArrayList<>();

            List<OrderedItem> items = new ArrayList<>();
            if (jsonOrder.has("items")) {
                ArrayNode jsonOrderedItems = (ArrayNode) jsonOrder.get("items");
                items = updateOrderedItemsFromJson(jsonOrderedItems, updatedStocks, order);
            }


            Order finalOrder = order;
            DatabaseManager.getInstance().updateAll(
                    new ListBuilder<Serializable>()
                            .buildAdd(order)
                            .buildAll(updatedStocks)
                            .buildAll(items.stream()
                                    .peek(item -> item.setOrder(finalOrder))
                                    .collect(Collectors.toList()))
            );

            response.setStatus(HttpServletResponse.SC_OK);
            ApiUtils.getInstance().serializeObject(response, order.getId(), "id");
        } else {
            logger.trace("Could not parse Json.");
            ApiUtils.getInstance().processInvalidError(response);
        }
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().deleteFromDatabase(Order.class, request, response);
    }


    private Order updateOrderFromJson(JsonNode jsonOrder, Order order) {
        order.setTimeStamp(LocalDateTime.now());

        String method = jsonOrder.get("method").asText();

        OrderRepository.paymentMethodFromString(method)
                .ifPresent(order::setMethod);

        return order;
    }

    private List<OrderedItem> updateOrderedItemsFromJson(ArrayNode jsonOrderedItems, List<Stock> updatedStocks, Order order) {
        return StreamSupport.stream(jsonOrderedItems.spliterator(), false)
                .map(jsonNode -> {
                    OrderedItem orderedItem = new OrderedItem();
                    if (jsonNode.has("id")) {
                        orderedItem = DatabaseManager.getInstance().getById(OrderedItem.class, jsonNode.get("id").asInt());
                    }
                    return updateOrderedItemFromJson(jsonNode, updatedStocks, orderedItem, order);
                })
                .collect(Collectors.toList());
    }

    private OrderedItem updateOrderedItemFromJson(JsonNode jsonNode, List<Stock> updatedStocks, OrderedItem item, Order order) {
        try {
            if (jsonNode.has("id")) {
                OrderStatus oldState = item.getStatus();
                item = ApiUtils.getInstance().updateFromJson(jsonNode, item, OrderedItem.class);

                if ((oldState != OrderStatus.Cancelled) && (oldState != OrderStatus.Refused)) {
                    if (item.getStatus() == OrderStatus.Cancelled || item.getStatus() == OrderStatus.Refused) {
                        if (item.getColor() != null) {

                            List<Stock> stocks = DatabaseManager.createEntityManager()
                                    .createQuery("SELECT s FROM Stock s " +
                                            "WHERE s.size = :name AND s.color.hex = :hex", Stock.class)
                                    .setParameter("name", item.getSize())
                                    .setParameter("hex", item.getColor().getHex())
                                    .getResultList();

                            Stock stock = stocks.get(0);
                            stock.setAmount(stock.getAmount() + 1);
                            updatedStocks.add(stock);
                        }
                    }
                }

            } else {
                item = ApiUtils.getInstance().updateFromJson(jsonNode, item, OrderedItem.class);
                // update event,order, color

                //this should happen automagically
                ShopItem shopItem = DatabaseManager.getInstance().getById(ShopItem.class, jsonNode.get("event").get("id").asInt());
                item.setItem(shopItem);
                item.setOrder(order);

                if (jsonNode.has("color")) {
                    List<Stock> stocks = DatabaseManager.createEntityManager()
                            .createQuery("SELECT s FROM Stock s " +
                                    " WHERE s.size = :name AND s.color.hex = :hex", Stock.class)
                            .setParameter("name", item.getSize())
                            .setParameter("hex", item.getColor().getHex())
                            .getResultList();

                    if (stocks.isEmpty()) {
                        throw new Exception("Not in Stock");
                    }
                    Stock stock = stocks.get(0);
                    stock.setAmount(stock.getAmount() - 1);
                    updatedStocks.add(stock);
                }

            }
        } catch (Exception e) {
            logger.error("An error occurred while parsing the stock items.", e);
        }

        return item;
    }


}
