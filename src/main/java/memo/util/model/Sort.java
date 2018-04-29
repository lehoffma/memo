package memo.util.model;


import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class Sort {
    private List<Order> orders;

    public enum Direction {
        DESCENDING("asc"),
        ASCENDING("desc"),
        NONE("none");

        String queryValue;

        Direction(String queryValue) {
            this.queryValue = queryValue;
        }

        public static Optional<Direction> getByQueryValue(String value) {
            return Arrays.stream(Direction.values())
                    .filter(it -> it.queryValue.equalsIgnoreCase(value))
                    .findAny();
        }
    }

    public static class Order {
        Direction direction;
        String property;

        public Order(Direction direction, String property) {
            this.direction = direction;
            this.property = property;
        }

        public Order setDirection(Direction direction) {
            this.direction = direction;
            return this;
        }

        public Order setProperty(String property) {
            this.property = property;
            return this;
        }

        public Direction getDirection() {
            return direction;
        }

        public String getProperty() {
            return property;
        }
    }

    public static Sort by(List<Sort.Order> sortOrders) {
        return new Sort().setOrders(sortOrders);
    }

    public static Sort by(Sort.Order... sortOrders) {
        return new Sort().setOrders(Arrays.stream(sortOrders).collect(Collectors.toList()));
    }

    public static Sort by(Direction direction, String... properties) {
        return new Sort()
                .setOrders(Arrays.stream(properties)
                        .map(prop -> new Order(direction, prop))
                        .collect(Collectors.toList())
                );
    }

    public static Sort by(Direction direction, List<String> properties) {
        return new Sort()
                .setOrders(properties.stream()
                        .map(prop -> new Order(direction, prop))
                        .collect(Collectors.toList())
                );
    }

    private Sort changeDirection(Direction direction) {
        return this.setOrders(
                this.getOrders().stream()
                        .map(it -> it.setDirection(direction))
                        .collect(Collectors.toList())
        );
    }

    public Sort ascending() {
        return this.changeDirection(Direction.ASCENDING);
    }


    public Sort descending() {
        return this.changeDirection(Direction.DESCENDING);
    }

    public Sort unsorted() {
        return this.changeDirection(Direction.NONE);
    }

    public List<Order> getOrders() {
        return orders;
    }

    public Sort setOrders(List<Order> orders) {
        this.orders = orders;
        return this;
    }
}
