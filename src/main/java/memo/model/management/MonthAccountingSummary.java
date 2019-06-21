package memo.model.management;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public class MonthAccountingSummary {
    private BigDecimal totalBalance;

    private LocalDate month;

    public MonthAccountingSummary(Object[] objects) {
        //totalBalance, month, year
        this.totalBalance = (BigDecimal) Optional.ofNullable(objects[0]).orElse(BigDecimal.ZERO);
        this.month = LocalDate.now().withDayOfMonth(1).withMonth((Integer) objects[1]).withYear((Integer) objects[2]);
    }

    public MonthAccountingSummary(BigDecimal totalBalance, LocalDate month) {
        this.totalBalance = totalBalance;
        this.month = month;
    }

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public MonthAccountingSummary setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance;
        return this;
    }

    public LocalDate getMonth() {
        return month;
    }

    public MonthAccountingSummary setMonth(LocalDate month) {
        this.month = month;
        return this;
    }
}
