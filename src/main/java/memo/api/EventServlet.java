package memo.api;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import memo.data.EventRepository;
import memo.model.ShopItem;
import memo.model.Stock;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

enum EventType {
    tours(1, "tours"),
    partys(2, "partys"),
    merch(3, "merch");


    private int value;
    private String stringRepresentation;

    EventType(int value, String stringRepresentation) {
        this.value = value;
        this.stringRepresentation = stringRepresentation;
    }

    public int getValue() {
        return value;
    }

    public String getStringRepresentation() {
        return stringRepresentation;
    }

    public static Optional<EventType> findByValue(int value) {
        return Arrays.stream(EventType.values())
                .filter(type -> type.value == value)
                .findFirst();
    }

    public static Optional<EventType> findByString(String value) {
        return Arrays.stream(EventType.values())
                .filter(type -> type.stringRepresentation.equals(value))
                .findFirst();
    }
}

/**
 * Servlet implementation class EventServlet
 */
// Tested

@WebServlet(name = "EventServlet", value = "/api/event")
public class EventServlet extends HttpServlet {


    final static Logger logger = Logger.getLogger(EventServlet.class);

    public EventServlet() {
        super();
    }

    public static Integer getType(String sType) {
        return EventType.findByString(sType)
                .map(EventType::getValue)
                .orElse(0);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        ApiUtils.getInstance().setContentType(request, response);

        String eventId = request.getParameter("id");
        String searchTerm = request.getParameter("searchTerm");
        String sType = request.getParameter("type");
        String userId = request.getParameter("userId");
        String authorId = request.getParameter("authorId");

        logger.debug("Method GET called with param ID = " + eventId + " + searchTerm = " + searchTerm + " + type = " + sType + " + userId = " + userId + " + authorId = " + authorId);

        List<ShopItem> shopItems = EventRepository.getInstance().get(eventId, searchTerm, sType, userId, authorId, response);

        if (ApiUtils.stringIsNotEmpty(eventId) && shopItems.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        ApiUtils.getInstance().serializeObject(response, shopItems, "shopItems");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "event");
        logger.debug("Method POST called");

        //ToDo: Duplicate Events

        ShopItem shopItem = ApiUtils.getInstance().updateFromJson(jObj, new ShopItem(), ShopItem.class);

        List<Stock> stockList = new ArrayList<>();

        if (shopItem.getType() == EventType.merch.getValue()) {
            stockList = fillSizesFromJson(jObj);
        }

        shopItem.getImages().forEach(image -> image.setItem(shopItem));
        shopItem.setStock(stockList);
        stockList.forEach(it -> it.setItem(shopItem));

        DatabaseManager.getInstance().save(shopItem);


        response.setStatus(HttpServletResponse.SC_CREATED);
        ApiUtils.getInstance().serializeObject(response, shopItem.getId(), "id");
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method PUT called");
        JsonNode jsonShopItem = ApiUtils.getInstance().getJsonObject(request, "event");

        if (!jsonShopItem.has("id")) {
            ApiUtils.getInstance().processInvalidError(response);
            return;
        }

        ShopItem shopItem = DatabaseManager.getInstance().getById(ShopItem.class, jsonShopItem.get("id").asInt());

        if (shopItem == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }

        shopItem = ApiUtils.getInstance().updateFromJson(jsonShopItem, shopItem, ShopItem.class);
        List<Stock> stockList = new ArrayList<>();

        if (shopItem.getType() == EventType.merch.getValue()) {
            stockList = fillSizesFromJson(jsonShopItem);
        }

        shopItem.setStock(stockList);
        ShopItem finalShopItem = shopItem;
        shopItem.getImages().forEach(image -> image.setItem(finalShopItem));
        stockList.forEach(it -> it.setItem(finalShopItem));

        DatabaseManager.getInstance().save(shopItem);

        response.setStatus(HttpServletResponse.SC_CREATED);
        ApiUtils.getInstance().serializeObject(response, shopItem.getId(), "id");
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().deleteFromDatabase(ShopItem.class, request, response);
    }


    private ShopItem getEventByID(String eventId, HttpServletResponse response) throws IOException {
        try {
            Integer id = Integer.parseInt(eventId);
            return DatabaseManager.createEntityManager().find(ShopItem.class, id);
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
        return null;
    }

    private List<Stock> fillSizesFromJson(JsonNode event) {
        ArrayNode jsonStockList = (ArrayNode) event.get("stock");

        return StreamSupport.stream(jsonStockList.spliterator(), false)
                .map(jsonStock -> ApiUtils.getInstance().updateFromJson(jsonStock, new Stock(), Stock.class))
                .collect(Collectors.toList());
    }
}
