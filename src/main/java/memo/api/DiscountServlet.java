package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.api.ConfigurableAuthStrategy;
import memo.data.EventRepository;
import memo.data.UserRepository;
import memo.model.ClubRole;
import memo.model.Discount;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.EventType;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@WebServlet(name = "DiscountServlet", value = "/api/discounts")
public class DiscountServlet extends AbstractApiServlet<Discount> {

    public DiscountServlet() {
        super(new ConfigurableAuthStrategy<>(true));
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, Discount object) {

    }

    private List<Discount> getUserDiscount(String eventId, String userId) {
        List<ShopItem> shopItems = EventRepository.getInstance().get(eventId);
        if (shopItems.isEmpty() || shopItems.get(0).getType() != EventType.tours.getValue()) {
            return new ArrayList<>();
        }

        Discount discount = new Discount()
                .setAmount(new BigDecimal("5.00"))
                .setEligible(false)
                .setLink(new Discount.DiscountLink()
                        .setUrl("/applyForMembership")
                        .setText("Werde jetzt Mitglied, um 5 Euro auf alle Touren zu sparen!"))
                .setReason("Mitglieder-Rabatt");

        Optional<User> user = UserRepository.getInstance().getById(userId);
        user.ifPresent(it -> discount.setEligible(it.getClubRole().ordinal() > ClubRole.Gast.ordinal()));

        return Arrays.asList(discount);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response,
                (paramMap, response1) ->
                        this.getUserDiscount(
                                getParameter(paramMap, "eventId"),
                                getParameter(paramMap, "userId")
                        ),
                "discounts"
        );
    }

}
