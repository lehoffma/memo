package memo.model.management;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class AccountingState {
    private BigDecimal currentBalance;
    private BigDecimal lastMonthChange;

    private BigDecimal tourTotal;
    private BigDecimal tourChange;

    private BigDecimal partyTotal;
    private BigDecimal partyChange;

    private BigDecimal merchTotal;
    private BigDecimal merchChange;

    private List<ItemAccountingSummary> itemTotals;
    private List<MonthAccountingSummary> monthlyChanges;

    public AccountingState() {
    }

    public AccountingState(Object[] objects) {
        //todo expenses by category
        this.currentBalance = BigDecimal.valueOf((Double) Optional.ofNullable(objects[0]).orElse(0D));
        this.lastMonthChange = BigDecimal.valueOf((Double) Optional.ofNullable(objects[1]).orElse(0D));
        this.tourTotal = BigDecimal.valueOf((Double) Optional.ofNullable(objects[2]).orElse(0D));
        this.tourChange = BigDecimal.valueOf((Double) Optional.ofNullable(objects[3]).orElse(0D));
        this.partyTotal = BigDecimal.valueOf((Double) Optional.ofNullable(objects[4]).orElse(0D));
        this.partyChange = BigDecimal.valueOf((Double) Optional.ofNullable(objects[5]).orElse(0D));
        this.merchTotal = BigDecimal.valueOf((Double) Optional.ofNullable(objects[6]).orElse(0D));
        this.merchChange = BigDecimal.valueOf((Double) Optional.ofNullable(objects[7]).orElse(0D));
        this.itemTotals = new ArrayList<>();
        this.monthlyChanges = new ArrayList<>();
    }


    public class ItemAccountingSummary {
        private BigDecimal totalBalance;
        private String itemTitle;
        private Integer itemId;

        public ItemAccountingSummary(BigDecimal totalBalance, String itemTitle, Integer itemId) {
            this.totalBalance = totalBalance;
            this.itemTitle = itemTitle;
            this.itemId = itemId;
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

    public class MonthAccountingSummary {
        private BigDecimal totalBalance;
        private LocalDate month;

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

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public AccountingState setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
        return this;
    }

    public BigDecimal getLastMonthChange() {
        return lastMonthChange;
    }

    public AccountingState setLastMonthChange(BigDecimal lastMonthChange) {
        this.lastMonthChange = lastMonthChange;
        return this;
    }

    public BigDecimal getTourTotal() {
        return tourTotal;
    }

    public AccountingState setTourTotal(BigDecimal tourTotal) {
        this.tourTotal = tourTotal;
        return this;
    }

    public BigDecimal getTourChange() {
        return tourChange;
    }

    public AccountingState setTourChange(BigDecimal tourChange) {
        this.tourChange = tourChange;
        return this;
    }

    public BigDecimal getPartyTotal() {
        return partyTotal;
    }

    public AccountingState setPartyTotal(BigDecimal partyTotal) {
        this.partyTotal = partyTotal;
        return this;
    }

    public BigDecimal getPartyChange() {
        return partyChange;
    }

    public AccountingState setPartyChange(BigDecimal partyChange) {
        this.partyChange = partyChange;
        return this;
    }

    public BigDecimal getMerchTotal() {
        return merchTotal;
    }

    public AccountingState setMerchTotal(BigDecimal merchTotal) {
        this.merchTotal = merchTotal;
        return this;
    }

    public BigDecimal getMerchChange() {
        return merchChange;
    }

    public AccountingState setMerchChange(BigDecimal merchChange) {
        this.merchChange = merchChange;
        return this;
    }

    public List<ItemAccountingSummary> getItemTotals() {
        return itemTotals;
    }

    public AccountingState setItemTotals(List<ItemAccountingSummary> itemTotals) {
        this.itemTotals = itemTotals;
        return this;
    }


    public List<MonthAccountingSummary> getMonthlyChanges() {
        return monthlyChanges;
    }

    public AccountingState setMonthlyChanges(List<MonthAccountingSummary> monthlyChanges) {
        this.monthlyChanges = monthlyChanges;
        return this;
    }


    public AccountingState fillUpMonths() {
        //this method adds empty/zero values for each month without an associated entry
        //from the first entry until today
        //min size: one year

        List<MonthAccountingSummary> monthlyChanges = new ArrayList<>(this.monthlyChanges).stream()
                .sorted(Comparator.comparing(it -> it.month))
                .collect(Collectors.toList());

        MonthAccountingSummary firstSummary = monthlyChanges.get(0);
        LocalDate firstDate = LocalDate.now().minusYears(1).withDayOfMonth(1);
        if (firstSummary.getMonth().isBefore(firstDate)) {
            firstDate = firstSummary.getMonth().withDayOfMonth(1);
        }

        List<MonthAccountingSummary> zeroChanges = new ArrayList<>();
        while ((firstDate = firstDate.plusMonths(1)).isBefore(LocalDate.now())) {
            LocalDate finalFirstDate = firstDate;
            if (monthlyChanges.stream()
                    .noneMatch(change -> change.getMonth().getMonth().equals(finalFirstDate.getMonth()))) {
                zeroChanges.add(new MonthAccountingSummary(BigDecimal.ZERO, finalFirstDate));
            }
        }

        this.setMonthlyChanges(
                Stream.concat(
                        monthlyChanges.stream(),
                        zeroChanges.stream()
                )
                        .sorted(Comparator.comparing(MonthAccountingSummary::getMonth))
                        .collect(Collectors.toList())
        );

        return this;
    }
}
