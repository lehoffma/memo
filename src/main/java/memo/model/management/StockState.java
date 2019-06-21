package memo.model.management;

import java.math.BigDecimal;
import java.util.Optional;

public class StockState {
    private Long soldOut;
    private Long warning;
    private Long ok;

    public StockState(Object[] queryResult){
        this.soldOut = Optional.ofNullable((BigDecimal) queryResult[0]).orElse(BigDecimal.ZERO).longValue();
        this.warning = Optional.ofNullable((BigDecimal) queryResult[1]).orElse(BigDecimal.ZERO).longValue();
        this.ok = Optional.ofNullable((BigDecimal) queryResult[2]).orElse(BigDecimal.ZERO).longValue();
    }

    public Long getSoldOut() {
        return soldOut;
    }

    public StockState setSoldOut(Long soldOut) {
        this.soldOut = soldOut;
        return this;
    }

    public Long getWarning() {
        return warning;
    }

    public StockState setWarning(Long warning) {
        this.warning = warning;
        return this;
    }

    public Long getOk() {
        return ok;
    }

    public StockState setOk(Long ok) {
        this.ok = ok;
        return this;
    }
}
