package memo.serialization;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import memo.data.OrderRepository;
import memo.model.PaymentMethod;

import java.io.IOException;

public class PaymentMethodDeserializer extends StdDeserializer<PaymentMethod> {
    public PaymentMethodDeserializer() {
        super(PaymentMethod.class);
    }

    @Override
    public PaymentMethod deserialize(JsonParser jsonParser, DeserializationContext ctxt) throws IOException, JsonProcessingException {
        String textValue = jsonParser.getText();

        return OrderRepository.findPaymentMethodByString(textValue)
                .orElse(PaymentMethod.Bar);
    }
}
