package memo.serialization;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import memo.model.Stock;
import memo.util.DatabaseManager;

import java.io.IOException;

public class StockAmountSerializer extends StdSerializer<Integer> {
    public StockAmountSerializer() {
        super(Integer.class);
    }

    protected StockAmountSerializer(Class<Integer> t) {
        super(t);
    }

    protected StockAmountSerializer(JavaType type) {
        super(type);
    }

    protected StockAmountSerializer(Class<?> t, boolean dummy) {
        super(t, dummy);
    }

    protected StockAmountSerializer(StdSerializer<?> src) {
        super(src);
    }

    @Override
    public void serialize(Integer value, JsonGenerator gen, SerializerProvider provider) throws IOException {
        Stock stock = (Stock) gen.getCurrentValue();
        Long howManyItemsWereBought = DatabaseManager.createEntityManager()
                .createNamedQuery("Stock.boughtAmount", Long.class)
                .setParameter("id", stock.getId())
                .getSingleResult();

        gen.writeNumber(value - howManyItemsWereBought.intValue());
    }
}
