package memo.model.management;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

public class AccountingDatePreview {
    private LocalDateTime date;
    private BigDecimal totalBalance;

    public AccountingDatePreview() {

    }

    public AccountingDatePreview(Object[] objects) {
        this.totalBalance = (BigDecimal) Optional.ofNullable(objects[0]).orElse(BigDecimal.ZERO);
        Date date = (Date) Optional.ofNullable(objects[1]).orElse(Date.valueOf(LocalDate.now()));
        this.date = date.toLocalDate().atStartOfDay();
    }

    public LocalDateTime getDate() {
        return date;
    }

    public AccountingDatePreview setDate(LocalDateTime date) {
        this.date = date;
        return this;
    }

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public AccountingDatePreview setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance;
        return this;
    }
}
