package memo.model;

public class EventCapacity {
    private Integer eventId;
    private Integer capacity;

    public Integer getEventId() {
        return eventId;
    }

    public EventCapacity setEventId(Integer eventId) {
        this.eventId = eventId;
        return this;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public EventCapacity setCapacity(Integer capacity) {
        this.capacity = capacity;
        return this;
    }
}
