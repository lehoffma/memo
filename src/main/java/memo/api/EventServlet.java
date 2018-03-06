package memo.api;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.ShopItemAuthStrategy;
import memo.data.EventRepository;
import memo.model.ShopItem;
import memo.model.Stock;
import memo.util.ApiUtils;
import memo.util.EventType;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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

    private void updateShopItemDependencies(JsonNode jsonShopItem, ShopItem shopItem) {
        List<Stock> stockList = new ArrayList<>();

        if (shopItem.getType() == EventType.merch.getValue()) {
            stockList = fillSizesFromJson(jsonShopItem);
        }

        shopItem.setStock(stockList);
        shopItem.getImages().forEach(image -> image.setItem(shopItem));
        stockList.forEach(it -> it.setItem(shopItem));
        //todo databaseManager.save() bla
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

        this.post(request, response, options);
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiServletPutOptions<ShopItem, Integer> options = new ApiServletPutOptions<ShopItem, Integer>()
                .setObjectName("event")
                .setClazz(ShopItem.class)
                .setGetSerialized(ShopItem::getId);

        this.put(request, response, options);
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.delete(ShopItem.class, request, response);
    }


    private List<Stock> fillSizesFromJson(JsonNode event) {
        ArrayNode jsonStockList = (ArrayNode) event.get("stock");

        return StreamSupport.stream(jsonStockList.spliterator(), false)
                .map(jsonStock -> ApiUtils.getInstance().updateFromJson(jsonStock, new Stock(), Stock.class))
                .collect(Collectors.toList());
    }
}
