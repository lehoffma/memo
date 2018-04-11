package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.auth.api.ParticipantsAuthStrategy;
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

@WebServlet(name = "ParticipantsServlet", value = "/api/participants")
public class ParticipantsServlet extends AbstractApiServlet<OrderedItem> {
    public ParticipantsServlet() {
        super(new ParticipantsAuthStrategy());
        logger = Logger.getLogger(ParticipantsServlet.class);
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
        this.get(request, response,
                (paramMap, _response) -> ParticipantRepository.getInstance().get(
                        getParameter(paramMap, "eventId"),
                        _response
                ),
                "participants"
        );
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        this.post(request, response, new ApiServletPostOptions<>(
                        "participant", new OrderedItem(), OrderedItem.class, OrderedItem::getId
                )
        );
    }

}
