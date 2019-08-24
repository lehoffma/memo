package memo.model.management;

import java.util.Arrays;
import java.util.Optional;

public enum AccountingTimespan {
    MONTH("month"),
    YEAR("year");

    private String queryValue;

    AccountingTimespan(String queryValue){
        this.queryValue = queryValue;
    }

    public String getQueryValue() {
        return queryValue;
    }

    public static Optional<AccountingTimespan> fromQueryValue(String queryValue){
        return Arrays.stream(AccountingTimespan.values())
                .filter(it -> it.getQueryValue().equalsIgnoreCase(queryValue))
                .findFirst();
    }
}
