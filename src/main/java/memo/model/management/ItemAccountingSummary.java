package memo.model.management;


import java.math.BigDecimal;
import java.util.Optional;

public class ItemAccountingSummary {
    private BigDecimal totalBalance;
    private String itemTitle;
    private Integer itemId;

    public ItemAccountingSummary(BigDecimal totalBalance, String itemTitle, Integer itemId) {
        this.totalBalance = totalBalance;
        this.itemTitle = itemTitle;
        this.itemId = itemId;
    }

    public ItemAccountingSummary(Object[] objects) {
        //totalBalance, itemTitle, itemId
        this.totalBalance = (BigDecimal) Optional.ofNullable(objects[0]).orElse(BigDecimal.ZERO);
        this.itemTitle = (String) Optional.ofNullable(objects[1]).orElse("");
        this.itemId = (Integer) Optional.ofNullable(objects[2]).orElse(-1);
    }


    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public ItemAccountingSummary setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance;
        return this;
    }

    public String getItemTitle() {
        return itemTitle;
    }

    public ItemAccountingSummary setItemTitle(String itemTitle) {
        this.itemTitle = itemTitle;
        return this;
    }

    public Integer getItemId() {
        return itemId;
    }

    public ItemAccountingSummary setItemId(Integer itemId) {
        this.itemId = itemId;
        return this;
    }
}
