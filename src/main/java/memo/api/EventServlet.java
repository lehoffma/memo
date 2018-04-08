package memo.api;


import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.ShopItemAuthStrategy;
import memo.communication.CommunicationManager;
import memo.communication.MessageType;
import memo.data.EventRepository;
import memo.model.Order;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.DatabaseManager;
import memo.util.EventType;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Servlet implementation class EventServlet
 */
// Tested

@WebServlet(name = "EventServlet", value = "/api/event")
public class EventServlet extends AbstractApiServlet<ShopItem> {

    public EventServlet() {
        super(new ShopItemAuthStrategy());
        logger = Logger.getLogger(EventServlet.class);
    }

    public static Integer getType(String sType) {
        return EventType.findByString(sType)
                .map(EventType::getValue)
                .orElse(0);
    }


    @Override
    protected void updateDependencies(JsonNode jsonNode, ShopItem object) {
        this.oneToMany(object, ShopItem::getEntries, entry -> entry::setItem);
        this.oneToMany(object, ShopItem::getComments, comment -> comment::setItem);
        this.manyToMany(object, ShopItem::getAuthor, ShopItem::getId, User::getAuthoredItems, user -> user::setAuthoredItems);
        this.manyToMany(object, ShopItem::getReportWriters, ShopItem::getId, User::getReportResponsibilities, user -> user::setReportResponsibilities);
        this.oneToMany(object, ShopItem::getImages, image -> image::setItem);
        this.oneToMany(object, ShopItem::getOrders, orderedItem -> orderedItem::setItem);
        this.oneToMany(object, ShopItem::getRoute, address -> address::setItem);
        this.oneToMany(object, ShopItem::getStock, stock -> stock::setItem);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.get(
                request, response,
                (paramMap, _response) -> EventRepository.getInstance().get(
                        getParameter(paramMap, "id"),
                        getParameter(paramMap, "searchTerm"),
                        getParameter(paramMap, "type"),
                        getParameter(paramMap, "userId"),
                        getParameter(paramMap, "authorId"),
                        _response
                ),
                "shopItems"
        );
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiServletPostOptions<ShopItem, Integer> options = new ApiServletPostOptions<ShopItem, Integer>()
                .setObjectName("event")
                .setBaseValue(new ShopItem())
                .setClazz(ShopItem.class)
                .setGetSerialized(ShopItem::getId);

        ShopItem item = this.post(request, response, options).item;

        if (item != null) {
            List<User> responsibleUsers = item.getAuthor();
            responsibleUsers.forEach(user -> CommunicationManager.getInstance().send(user, item, MessageType.RESPONSIBLE_USER));
        }
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiServletPutOptions<ShopItem, Integer> options = new ApiServletPutOptions<ShopItem, Integer>()
                .setObjectName("event")
                .setClazz(ShopItem.class)
                .setGetSerialized(ShopItem::getId);


        ApiResponse result = this.put(request, response, options);
        ShopItem changedItem = result.item;
        JsonNode jsonNode = result.jsonNode;

        ShopItem previousValue = DatabaseManager.getInstance().getById(ShopItem.class, jsonNode.get(options.getJsonId()).asInt());
        List<User> previouslyResponsible = new ArrayList<>(previousValue.getAuthor());

        if (changedItem == null) {
            return;
        }
        //notify participants of changes
        //todo getOrders is empty
        changedItem.getOrders().stream()
                .map(OrderedItem::getOrder)
                .map(Order::getUser)
                .forEach(participant -> CommunicationManager.getInstance().send(participant, changedItem, MessageType.OBJECT_HAS_CHANGED));
        //notify newly added responsible users
        List<User> newResponsible = changedItem.getAuthor();
        newResponsible.stream()
                //todo only send mails to newly added users
                .filter(user -> previouslyResponsible.stream().noneMatch(it -> it.getId().equals(user.getId())))
                .forEach(user -> CommunicationManager.getInstance().send(user, changedItem, MessageType.RESPONSIBLE_USER));
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.delete(ShopItem.class, request, response);
    }
}
