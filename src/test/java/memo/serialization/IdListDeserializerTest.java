package memo.serialization;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import memo.data.AddressRepository;
import memo.model.Address;
import org.junit.Assert;
import org.junit.Test;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class IdListDeserializerTest {

    private static class AddressTest implements Serializable {
        public AddressTest() {

        }

        @JsonDeserialize(using = AddressIdListDeserializer.class)
        private List<Address> addresses = new ArrayList<>();

        public List<Address> getAddresses() {
            return addresses;
        }

        public AddressTest setAddresses(List<Address> addresses) {
            this.addresses = addresses;
            return this;
        }
    }

    @Test
    public void test() throws IOException {
        List<Integer> values = Arrays.asList(1, 2, 3);

        ObjectNode node = JsonNodeFactory.instance.objectNode();
        ArrayNode arrayNode = node.putArray("addresses");
        values.forEach(arrayNode::add);
        AddressTest test = new AddressTest();
        try {
            test = new ObjectMapper()
                    .readerFor(AddressTest.class)
                    .readValue(node);
        } catch (Exception e) {
            e.printStackTrace();
        }

        AddressRepository repository = AddressRepository.getInstance();

        List<Address> result = values.stream().map(repository::getById).filter(Optional::isPresent)
                .map(Optional::get).collect(Collectors.toList());

        AddressTest finalTest = test;
        result.forEach(address -> Assert.assertTrue(finalTest.getAddresses().contains(address)));
    }
}
