package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.ModifyPrecondition;
import memo.auth.api.strategy.ParticipantsAuthStrategy;
import memo.data.ParticipantRepository;
import memo.model.Color;
import memo.model.Order;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@WebServlet(name = "OrderedItemServlet", value = "/api/orderedItem")
public class OrderedItemServlet extends AbstractApiServlet<OrderedItem> {
    public OrderedItemServlet() {
        super(new ParticipantsAuthStrategy());
        logger = Logger.getLogger(OrderedItemServlet.class);
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

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.get(request, response, ParticipantRepository.getInstance(), "orderedItems");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        this.post(request, response, new ApiServletPostOptions<>(
                        "orderedItem", new OrderedItem(), OrderedItem.class, OrderedItem::getId
                )
                        .setPreconditions(Collections.singletonList(
                                new ModifyPrecondition<>(
                                        item -> OrderServlet.checkOrder(Collections.singletonList(item)),
                                        "Item is already sold out",
                                        () -> response.setStatus(HttpServletResponse.SC_PRECONDITION_FAILED)
                                )
                        ))
        );
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.put(request, response, new ApiServletPutOptions<>(
                "orderedItem", OrderedItem.class, OrderedItem::getId, "id"
        ));
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.delete(OrderedItem.class, request, response);
    }
}
