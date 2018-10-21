package memo.api;


import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.strategy.ShopItemAuthStrategy;
import memo.communication.CommunicationManager;
import memo.communication.MessageType;
import memo.data.EventRepository;
import memo.model.*;
import memo.util.model.EventType;
import org.apache.logging.log4j.LogManager;

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
@WebServlet(name = "EventServlet", value = "/api/event")
public class EventServlet extends AbstractApiServlet<ShopItem> {

    public EventServlet() {
        super(new ShopItemAuthStrategy());
        logger = LogManager.getLogger(EventServlet.class);
    }

    public static Integer getType(String sType) {
        return EventType.findByString(sType)
                .map(EventType::getValue)
                .orElse(0);
    }

    @Override
    protected ShopItem createCopy(ShopItem object) {
        return new ShopItem(object);
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, ShopItem object) {
        this.oneToMany(object, Entry.class, ShopItem::getEntries, entry -> entry::setItem);
        this.oneToMany(object, Comment.class, ShopItem::getComments, comment -> comment::setItem);
        this.manyToMany(object, User.class, ShopItem::getAuthor, ShopItem::getId, User::getAuthoredItems, user -> user::setAuthoredItems);
        this.manyToMany(object, User.class, ShopItem::getReportWriters, ShopItem::getId, User::getReportResponsibilities, user -> user::setReportResponsibilities);
        this.oneToMany(object, Image.class, ShopItem::getImages, image -> image::setItem);
        this.oneToMany(object, OrderedItem.class, ShopItem::getOrders, orderedItem -> orderedItem::setItem);
        this.oneToMany(object, Address.class, ShopItem::getRoute, address -> address::setItem);
        this.oneToMany(object, Stock.class, ShopItem::getStock, stock -> stock::setItem);
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, ShopItem object, ShopItem previous) {
        this.updateDependencies(jsonNode, object);
        this.nonOwningManyToMany(object, previous, User.class, ShopItem::getAuthor, ShopItem::getId, User::getAuthoredItems, user -> user::setAuthoredItems);
        this.nonOwningManyToMany(object, previous, User.class, ShopItem::getReportWriters, ShopItem::getId, User::getReportResponsibilities, user -> user::setReportResponsibilities);
        System.out.println("hi");
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.get(request, response, EventRepository.getInstance());
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiServletPostOptions<ShopItem, Integer> options = new ApiServletPostOptions<ShopItem, Integer>()
                .setObjectName("event")
                .setBaseValue(new ShopItem())
                .setClazz(ShopItem.class)
                .setGetSerialized(ShopItem::getId);

        ShopItem item = this.post(request, response, options);

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

//        String id = request.getParameter(options.getJsonId());
//        ShopItem previousValue = DatabaseManager.getInstance().getById(ShopItem.class, id);
//        List<User> previouslyResponsible = new ArrayList<>(previousValue.getAuthor());

        ShopItem changedItem = this.put(request, response, options);

        if (changedItem == null) {
            return;
        }
        //notify participants of changes
        List<OrderedItem> orders = new ArrayList<>(changedItem.getOrders());
        orders.stream()
                .map(OrderedItem::getOrder)
                .map(Order::getUser)
                .distinct()
                .forEach(participant -> CommunicationManager.getInstance().send(participant, changedItem, MessageType.OBJECT_HAS_CHANGED));
        //notify newly added responsible users
        List<User> newResponsible = new ArrayList<>(changedItem.getAuthor());
        newResponsible.stream()
                //todo only send mails to newly added users
//                .filter(user -> previouslyResponsible.stream().noneMatch(it -> it.getId().equals(user.getId())))
                .forEach(user -> CommunicationManager.getInstance().send(user, changedItem, MessageType.RESPONSIBLE_USER));
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.delete(ShopItem.class, request, response);
    }
}
