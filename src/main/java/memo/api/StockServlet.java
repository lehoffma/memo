package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.data.StockRepository;
import memo.model.Color;
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

@WebServlet(name = "StockServlet", value = "/api/stock")
public class StockServlet extends HttpServlet {
    private static final Logger logger = Logger.getLogger(StockServlet.class);

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        String eventId = request.getParameter("eventId");
        String type = request.getParameter("type");

        logger.trace("GET called with parameters eventId = " + eventId + ", type = " + type);

        List<Stock> stock = StockRepository.getInstance().get(eventId, type, response);

        ApiUtils.getInstance().serializeObject(response, stock, "stock");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        Optional<JsonNode> jsonStockOptional = ApiUtils.getInstance().getJsonObject(request);

        logger.trace("POST called");

        if (jsonStockOptional.isPresent()) {
            JsonNode jsonStock = jsonStockOptional.get();
            //ToDo: Duplicate Events

            Stock stock = createStockFromJson(jsonStock);

            DatabaseManager.getInstance().save(stock);
            logger.trace("Saved Stock to the database");

            response.setStatus(HttpServletResponse.SC_CREATED);
            ApiUtils.getInstance().serializeObject(response, stock.getId(), "id");
        } else {
            logger.error("Could not parse JSON.");
            ApiUtils.getInstance().processInvalidError(response);
        }
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        logger.trace("PUT called");

        Optional<JsonNode> jsonStockOptional = ApiUtils.getInstance().getJsonObject(request);

        if (jsonStockOptional.isPresent()) {
            JsonNode jsonStock = jsonStockOptional.get();
            Integer id = jsonStock.get("id").asInt();

            Stock stock = DatabaseManager.getInstance().getById(Stock.class, id);

            if (stock == null) {
                response.getWriter().append("Not found");
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            stock = updateStockFromJson(jsonStock, stock);

            DatabaseManager.getInstance().updateAll(Arrays.asList(stock, stock.getColor()));

            response.setStatus(HttpServletResponse.SC_CREATED);
            ApiUtils.getInstance().serializeObject(response, stock.getId(), "id");
        } else {
            logger.error("Could not parse JSON.");
            ApiUtils.getInstance().processInvalidError(response);
        }
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().deleteFromDatabase(Stock.class, request, response);
    }

    private List<Stock> getStockFromDatabase(String eventId, String type, HttpServletResponse response) throws IOException {
        StockRepository repository = StockRepository.getInstance();

        if (ApiUtils.stringIsNotEmpty(eventId)) {
            try {
                return repository.getStockByEventId(eventId);
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().append("Could not parse event Id.");
                logger.error("Could not parse event id.", e);
                return new ArrayList<>();
            }
        }

        if (ApiUtils.stringIsNotEmpty(type)) {
            return repository.getStockByEventType(EventServlet.getType(type));
        }
        return repository.getAll();

    }

    private Stock createStockFromJson(JsonNode jsonStock) {
        return updateStockFromJson(jsonStock, new Stock());
    }

    private Stock updateStockFromJson(JsonNode jsonStock, Stock previousStockValue) {
        Stock stock = ApiUtils.getInstance().updateFromJson(jsonStock, previousStockValue, Stock.class);

        JsonNode jsonColor = jsonStock.get("color");
        Color color = ApiUtils.getInstance().updateFromJson(jsonColor, new Color(), Color.class);
        stock.setColor(color);

        JsonNode jsonEvent = jsonStock.get("event");
        if (jsonEvent != null) {
            Integer eventId = jsonEvent.get("id").asInt();
            ShopItem shopItem = DatabaseManager.getInstance().getById(ShopItem.class, eventId);
            stock.setItem(shopItem);
        } else {
            //todo error handling
//            throw new NoSuchFieldException();
        }

        return stock;
    }


}
