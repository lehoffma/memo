package memo.model.management;

import memo.model.EntryCategory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
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

    private Map<String, BigDecimal> expensesByCategory;
    private Map<String, BigDecimal> incomeByCategory;

    public AccountingState() {
    }

    public AccountingState(Object[] objects) {
        //todo expenses by category
        //todo income by category
        this.currentBalance = (BigDecimal) Optional.ofNullable(objects[0]).orElse(BigDecimal.ZERO);
        this.lastMonthChange = (BigDecimal) Optional.ofNullable(objects[1]).orElse(BigDecimal.ZERO);
        this.tourTotal = (BigDecimal) Optional.ofNullable(objects[2]).orElse(BigDecimal.ZERO);
        this.tourChange = (BigDecimal) Optional.ofNullable(objects[3]).orElse(BigDecimal.ZERO);
        this.partyTotal = (BigDecimal) Optional.ofNullable(objects[4]).orElse(BigDecimal.ZERO);
        this.partyChange = (BigDecimal) Optional.ofNullable(objects[5]).orElse(BigDecimal.ZERO);
        this.merchTotal = (BigDecimal) Optional.ofNullable(objects[6]).orElse(BigDecimal.ZERO);
        this.merchChange = (BigDecimal) Optional.ofNullable(objects[7]).orElse(BigDecimal.ZERO);
        this.itemTotals = new ArrayList<>();
        this.monthlyChanges = new ArrayList<>();
    }

    public AccountingState setExpensesByCategory(List<Object[]> queryResult){
        this.expensesByCategory = queryResult.stream()
                .collect(Collectors.toMap(
                        (Object[] o) -> (String) o[0],
                        (Object[] o) -> Optional.ofNullable((BigDecimal) o[1]).orElse(BigDecimal.ZERO).abs()
                ));
        return this;
    }

    public AccountingState setIncomeByCategory(List<Object[]> queryResult){
        this.incomeByCategory = queryResult.stream()
                .collect(Collectors.toMap(
                        (Object[] o) -> (String) o[0],
                        (Object[] o) -> Optional.ofNullable((BigDecimal) o[1]).orElse(BigDecimal.ZERO).abs()
                ));
        return this;
    }
    public Map<String, BigDecimal> getExpensesByCategory() {
        return expensesByCategory;
    }

    public AccountingState setExpensesByCategory(Map<String, BigDecimal> expensesByCategory) {
        this.expensesByCategory = expensesByCategory;
        return this;
    }

    public Map<String, BigDecimal> getIncomeByCategory() {
        return incomeByCategory;
    }

    public AccountingState setIncomeByCategory(Map<String, BigDecimal> incomeByCategory) {
        this.incomeByCategory = incomeByCategory;
        return this;
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
                .sorted(Comparator.comparing(MonthAccountingSummary::getMonth))
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
