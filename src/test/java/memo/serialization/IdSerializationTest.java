package memo.serialization;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.model.Address;
import org.junit.Assert;
import org.junit.Test;

import java.io.Serializable;

public class IdSerializationTest {


    private static class AddressTest implements Serializable {
        public AddressTest() {

        }

        @JsonSerialize(using = AddressIdSerializer.class)
        private Address address = new Address();

        public Address getAddress() {
            return address;
        }

        public AddressTest setAddress(Address address) {
            this.address = address;
            return this;
        }
    }

    @Test
    public void test() throws JsonProcessingException {
        AddressTest addressTest = new AddressTest();
        Address address = new Address();
        address.setId(5);
        addressTest.setAddress(address);
        String value = new ObjectMapper().writeValueAsString(addressTest);

        Assert.assertTrue(value.contains("\"5\""));
    }
}
