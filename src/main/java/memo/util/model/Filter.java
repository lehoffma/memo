package memo.util.model;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Filter {
    private List<FilterRequest> requests;

    public class FilterRequest {
        String key;
        List<String> values;

        public FilterRequest() {
        }

        public FilterRequest(String key, List<String> values) {
            this.key = key;
            this.values = values;
        }

        public String getKey() {
            return key;
        }

        public FilterRequest setKey(String key) {
            this.key = key;
            return this;
        }


        public List<String> getValues() {
            return values;
        }

        public FilterRequest setValues(List<String> value) {
            this.values = value;
            return this;
        }
    }

    public  FilterRequest request(String key, String... values) {
        return new FilterRequest(key, Arrays.stream(values).collect(Collectors.toList()));
    }

    public static Filter by(List<Filter.FilterRequest> filterRequests) {
        return new Filter().setRequests(filterRequests);
    }

    public static Filter by(Filter.FilterRequest... filterRequests) {
        return new Filter().setRequests(Stream.of(filterRequests).collect(Collectors.toList()));
    }

    public List<FilterRequest> getRequests() {
        return requests;
    }

    public Filter setRequests(List<FilterRequest> requests) {
        this.requests = requests;
        return this;
    }
}
