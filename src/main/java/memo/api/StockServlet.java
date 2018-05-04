package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.strategy.StockAuthStrategy;
import memo.data.StockRepository;
import memo.model.Color;
import memo.model.ShopItem;
import memo.model.SizeTable;
import memo.model.Stock;
import org.apache.logging.log4j.LogManager;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "StockServlet", value = "/api/stock")
public class StockServlet extends AbstractApiServlet<Stock> {

    public StockServlet() {
        super(new StockAuthStrategy());
        logger = LogManager.getLogger(StockServlet.class);
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, Stock object) {
        this.manyToOne(object, ShopItem.class, Stock::getItem, Stock::getId, ShopItem::getStock, shopItem -> shopItem::setStock);
        this.manyToOne(object, Color.class, Stock::getColor, Stock::getId, Color::getStock, color -> color::setStock);
        this.oneToMany(object, SizeTable.class, Stock::getSizeTable, sizeTable -> sizeTable::setStock);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.get(request, response, StockRepository.getInstance(), "stock");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.post(request, response, new ApiServletPostOptions<>(
                "stock", new Stock(), Stock.class, Stock::getId
        ));
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.put(request, response, new ApiServletPutOptions<>(
                "stock", Stock.class, Stock::getId
        ));
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.delete(Stock.class, request, response);
    }


}
