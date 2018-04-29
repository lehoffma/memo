package memo.util.model;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Filter {
    private List<FilterRequest> requests;

    public class FilterRequest {
        String key;
        String value;

        public String getKey() {
            return key;
        }

        public FilterRequest setKey(String key) {
            this.key = key;
            return this;
        }


        public String getValue() {
            return value;
        }

        public FilterRequest setValue(String value) {
            this.value = value;
            return this;
        }
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
