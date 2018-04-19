package memo.serialization;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.model.Address;
import org.junit.Assert;
import org.junit.Test;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class IdListSerializationTest {


    private static class AddressTest implements Serializable {
        public AddressTest() {

        }

        @JsonSerialize(using = AddressIdListSerializer.class)
        private List<Address> addresses = new ArrayList<>();

        public List<Address> getAddresses() {
            return addresses;
        }

        public AddressTest setAddresses(List<Address> address) {
            this.addresses = address;
            return this;
        }
    }

    private Address getAddress(Integer id) {
        Address address = new Address();
        address.setId(id);
        return address;
    }

    @Test
    public void test() throws JsonProcessingException {
        AddressTest addressTest = new AddressTest();

        List<Integer> testValues = Arrays.asList(1, 2, 5, 10);

        addressTest.setAddresses(testValues.stream().map(this::getAddress).collect(Collectors.toList()));
        String value = new ObjectMapper().writeValueAsString(addressTest);

        testValues.forEach(id -> Assert.assertTrue(value.contains(id.toString())));
    }
}
