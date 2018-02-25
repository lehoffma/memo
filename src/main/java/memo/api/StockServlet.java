package memo.api;

import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.StockAuthStrategy;
import memo.data.StockRepository;
import memo.model.Stock;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "StockServlet", value = "/api/stock")
public class StockServlet extends AbstractApiServlet<Stock> {

    public StockServlet() {
        super(new StockAuthStrategy());
        logger = Logger.getLogger(StockServlet.class);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.get(request, response,
                (paramMap, _response) -> StockRepository.getInstance().get(
                        getParameter(paramMap, "eventId"),
                        getParameter(paramMap, "type"),
                        response
                ),
                "stock");
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
