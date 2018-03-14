package memo.model;

import java.math.BigDecimal;

public class Discount {
    //todo as database entity?

    public static class DiscountLink {
        private String url;
        private String text;

        public String getUrl() {
            return url;
        }

        public DiscountLink setUrl(String url) {
            this.url = url;
            return this;
        }

        public String getText() {
            return text;
        }

        public DiscountLink setText(String text) {
            this.text = text;
            return this;
        }
    }

    private BigDecimal amount;
    private Boolean eligible;
    private DiscountLink link;
    private String reason;

    public BigDecimal getAmount() {
        return amount;
    }

    public Discount setAmount(BigDecimal amount) {
        this.amount = amount;
        return this;
    }

    public Boolean getEligible() {
        return eligible;
    }

    public Discount setEligible(Boolean eligible) {
        this.eligible = eligible;
        return this;
    }

    public DiscountLink getLink() {
        return link;
    }

    public Discount setLink(DiscountLink link) {
        this.link = link;
        return this;
    }

    public String getReason() {
        return reason;
    }

    public Discount setReason(String reason) {
        this.reason = reason;
        return this;
    }
}
