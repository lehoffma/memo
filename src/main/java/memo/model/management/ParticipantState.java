package memo.model.management;

public class ParticipantState {
    private Long total;
    private Long drivers;
    private Long ticketsNeeded;

    private Long waitingListTotal;
    private Long waitingListDrivers;
    private Long waitingListTicketsNeeded;

    public Long getTotal() {
        return total;
    }

    public ParticipantState setTotal(Long total) {
        this.total = total;
        return this;
    }

    public Long getDrivers() {
        return drivers;
    }

    public ParticipantState setDrivers(Long drivers) {
        this.drivers = drivers;
        return this;
    }

    public Long getTicketsNeeded() {
        return ticketsNeeded;
    }

    public ParticipantState setTicketsNeeded(Long ticketsNeeded) {
        this.ticketsNeeded = ticketsNeeded;
        return this;
    }

    public Long getWaitingListTotal() {
        return waitingListTotal;
    }

    public ParticipantState setWaitingListTotal(Long waitingListTotal) {
        this.waitingListTotal = waitingListTotal;
        return this;
    }

    public Long getWaitingListDrivers() {
        return waitingListDrivers;
    }

    public ParticipantState setWaitingListDrivers(Long waitingListDrivers) {
        this.waitingListDrivers = waitingListDrivers;
        return this;
    }

    public Long getWaitingListTicketsNeeded() {
        return waitingListTicketsNeeded;
    }

    public ParticipantState setWaitingListTicketsNeeded(Long waitingListTicketsNeeded) {
        this.waitingListTicketsNeeded = waitingListTicketsNeeded;
        return this;
    }
}
