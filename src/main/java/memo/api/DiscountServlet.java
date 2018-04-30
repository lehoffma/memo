package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.data.DiscountService;
import memo.model.Discount;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "DiscountServlet", value = "/api/discounts")
public class DiscountServlet extends AbstractApiServlet<Discount> {

    public DiscountServlet() {
        super(new ConfigurableAuthStrategy<>(true));
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, Discount object) {

    }


    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response,
                (paramMap, response1) ->
                        DiscountService.getUserDiscount(
                                getParameter(paramMap, "eventId"),
                                getParameter(paramMap, "userId")
                        ),
                "discounts"
        );
    }

}
