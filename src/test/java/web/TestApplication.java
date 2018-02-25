package web;

import org.junit.Assert;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class TestApplication {

    //todo

    public void test(List<String> values) {
        values = values.stream().filter(it -> it.startsWith("le")).collect(Collectors.toList());
    }

    public void anotherTest(List<String> values) {
        values.removeIf(s -> !s.startsWith("le"));
    }

    @Test
    public void javaTest() {
        List<String> values = new ArrayList<>();
        values.add("le funi");
        values.add("hallo");

        Assert.assertEquals(2, values.size());

        test(values);

        Assert.assertEquals(2, values.size());

        anotherTest(values);

        Assert.assertEquals(1, values.size());
    }
}
