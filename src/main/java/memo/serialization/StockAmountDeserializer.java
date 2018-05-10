package memo.serialization;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.JsonStreamContext;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import memo.model.Stock;
import memo.util.DatabaseManager;

import java.io.IOException;

public class StockAmountDeserializer extends StdDeserializer<Integer> {
    public StockAmountDeserializer() {
        super(Integer.class);
    }

    protected StockAmountDeserializer(Class<?> vc) {
        super(vc);
    }

    protected StockAmountDeserializer(JavaType valueType) {
        super(valueType);
    }

    protected StockAmountDeserializer(StdDeserializer<?> src) {
        super(src);
    }

    @Override
    public Integer deserialize(JsonParser jsonParser, DeserializationContext context) throws IOException, JsonProcessingException {
        JsonStreamContext parsingContext = jsonParser.getParsingContext();
        Stock stock = (Stock) parsingContext.getCurrentValue();
        Long howManyItemsWereBought = DatabaseManager.createEntityManager()
                .createNamedQuery("Stock.boughtAmount", Long.class)
                .setParameter("id", stock.getId())
                .getSingleResult();

        return jsonParser.getValueAsInt() + howManyItemsWereBought.intValue();
//        return jsonParser.getValueAsInt();
    }
}
