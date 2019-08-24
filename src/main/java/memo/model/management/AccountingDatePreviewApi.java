package memo.model.management;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

public class AccountingDatePreviewApi {
    private String date;
    private BigDecimal totalBalance;

    public AccountingDatePreviewApi(AccountingDatePreview accountingDatePreview) {
        this.date = accountingDatePreview.getDate().format(DateTimeFormatter.ISO_DATE_TIME);
        this.totalBalance = accountingDatePreview.getTotalBalance();
    }

    public String getDate() {
        return date;
    }

    public AccountingDatePreviewApi setDate(String date) {
        this.date = date;
        return this;
    }

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public AccountingDatePreviewApi setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance;
        return this;
    }
}
