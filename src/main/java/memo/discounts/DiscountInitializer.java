package memo.discounts;

import memo.discounts.model.DiscountEntity;
import memo.model.ClubRole;
import memo.util.DatabaseManager;
import memo.util.model.EventType;

import javax.annotation.PostConstruct;
import javax.ejb.Startup;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Named
@ApplicationScoped
@Startup
public class DiscountInitializer {

    @PostConstruct
    public void initialize() {
        List<DiscountEntity> currentDiscounts = new ArrayList<>(DatabaseManager.createEntityManager()
                .createQuery("SELECT e FROM DiscountEntity e", DiscountEntity.class)
                .getResultList());

        if (!currentDiscounts.isEmpty()) {
            return;
        }

        DiscountEntity tourMemberDiscount = new DiscountEntity()
                .setAmount(new BigDecimal("5.00"))
                .setPercentage(false)
                .setReason("Mitglieder-Rabatt")
                .setLinkUrl("/membership/apply")
                .setLimitPerUserAndItem(1)
                .setClubRoles(ClubRole.getList(ClubRole.Gast))
                .setLinkText("Werde jetzt Mitglied, um 5 Euro auf alle Touren zu sparen!")
                .setItemTypes(Collections.singletonList(EventType.tours.getValue()));

        DatabaseManager.getInstance()
                .save(tourMemberDiscount, DiscountEntity.class);
    }
}
