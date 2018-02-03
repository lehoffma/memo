package memo.api;


import com.fasterxml.jackson.databind.JsonNode;
import memo.data.EventRepository;
import memo.model.Color;
import memo.model.ShopItem;
import memo.model.Stock;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

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

        List<Color> colorList = new ArrayList<>();
        List<Stock> stockList = new ArrayList<>();

        if (shopItem.getType() == EventType.merch.getValue()) {
            fillSizesFromJson(jObj, colorList, stockList, shopItem);
        }

        List<Serializable> objectsToSave = new ArrayList<>();
        objectsToSave.add(shopItem);
        objectsToSave.addAll(colorList);
        objectsToSave.addAll(stockList);

        DatabaseManager.getInstance().saveAll(objectsToSave);

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
        List<Color> colorList = new ArrayList<>();
        List<Stock> stockList = new ArrayList<>();

        if (shopItem.getType() == EventType.merch.getValue()) {
            fillSizesFromJson(jsonShopItem, colorList, stockList, shopItem);
        }

        DatabaseManager.getInstance().updateAll(new ListBuilder<>()
                .buildAdd(shopItem)
                .buildAll(colorList)
                .buildAll(stockList)
        );

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

    private void fillSizesFromJson(JsonNode event, List<Color> colorList, List<Stock> stockList, ShopItem shopItem) {
        JsonNode jsonStockList = event.get("stock");

        for (int i = 0; i < jsonStockList.size(); ++i) {
            JsonNode jsonStock = jsonStockList.get(i);
            JsonNode jsonColor = jsonStock.get("color");
            Color color = ApiUtils.getInstance().updateFromJson(jsonColor, new Color(), Color.class);
            Stock stock = new Stock();
            stock.setColor(color);
            stock.setItem(shopItem);
            stock.setSize(jsonStock.get("size").asText());
            stock.setAmount(jsonStock.get("amount").asInt());
            colorList.add(color);
            stockList.add(stock);
        }
    }
}
