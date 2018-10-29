package memo.data;

import memo.model.*;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class MilesRepository {
    private EventRepository eventRepository;
    private UserRepository userRepository;
    private ParticipantRepository participantRepository;

    public MilesRepository() {
    }

    @Inject
    public MilesRepository(EventRepository eventRepository,
                           UserRepository userRepository,
                           ParticipantRepository participantRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
    }

    private boolean isBetween(LocalDateTime value, LocalDateTime start, LocalDateTime end) {
        return (value.isAfter(start) || value.isEqual(start)) && (value.isBefore(end) || value.isEqual(end));
    }

    /**
     * Queries the participated events of the given user and sums the miles of all of them
     *
     * @param userId a value > 0 representing the ID of a memoshop user
     * @return the all-time accumulated miles of the user
     */
    public Integer milesOfUser(Integer userId) {
        List<User> users = userRepository.get(userId.toString());
        if (users.isEmpty() || users.get(0).getClubRole().ordinal() == ClubRole.Gast.ordinal()) {
            return 0;
        }

        List<ShopItem> participatedEvents = eventRepository.findByParticipant(userId).stream()
                .filter(item -> {
                    List<OrderedItem> items = participantRepository.findByUserAndEvent(userId, item.getId());
                    if (items.isEmpty()) {
                        return false;
                    }
                    OrderedItem itemOfUser = items.get(0);
                    return itemOfUser.getStatus().equals(OrderStatus.Completed);
                })
                .collect(Collectors.toList());
        return participatedEvents.stream()
                .mapToInt(ShopItem::getMiles)
                //x2 for the way back
                .map(it -> it * 2)
                .sum();
    }

    /**
     * Same as milesOfUser(userId), but filters events by their date first. The start and end values are usually
     * the beginning and end dates of the Bundesliga seasons
     *
     * @param userId a value > 0 representing the ID of a memoshop user
     * @param start  all events before this date will be filtered out
     * @param end    all events after this date will be filtered out
     * @return the accumulated miles of the user for the given season/date-range
     */
    public Integer milesOfUser(Integer userId, LocalDateTime start, LocalDateTime end) {
        List<ShopItem> participatedEvents = eventRepository.findByParticipant(userId);
        return participatedEvents.stream()
                .filter(item -> item.getDate().toLocalDateTime().isBefore(LocalDateTime.now()))
                .filter(item -> isBetween(item.getDate().toLocalDateTime(), start, end))
                .mapToInt(ShopItem::getMiles)
                //x2 for the way back
                .map(it -> it * 2)
                .sum();
    }

    /**
     * @param userId a value > 0 representing the ID of a memoshop user
     * @return the all-time accumulated miles of the user, wrapped in a milesListEntry object
     */
    public MilesListEntry milesListEntryOfUser(Integer userId) {
        return new MilesListEntry().setUserId(userId).setMiles(milesOfUser(userId));
    }

    /**
     * @param userId a value > 0 representing the ID of a memoshop user
     * @param start  all events before this date will be filtered out
     * @param end    all events after this date will be filtered out
     * @return the accumulated miles of the user for the given season/date-range, wrapped in a milesListEntry object
     */
    public MilesListEntry milesListEntryOfUser(Integer userId, LocalDateTime start, LocalDateTime end) {
        return new MilesListEntry().setUserId(userId).setMiles(milesOfUser(userId, start, end));
    }

    /**
     * @return the all-time miles leaderboard
     */
    public List<MilesListEntry> milesList() {
        List<User> users = userRepository.getAll();
        return users.stream()
                .map(User::getId)
                .map(userId -> new MilesListEntry()
                        .setUserId(userId)
                        .setMiles(milesOfUser(userId))
                )
                .collect(Collectors.toList());
    }

    /**
     * @param start all events before this date will be filtered out
     * @param end   all events after this date will be filtered out
     * @return the miles leaderboard for the given season/date-range
     */
    public List<MilesListEntry> milesList(LocalDateTime start, LocalDateTime end) {
        List<User> users = userRepository.getAll();
        return users.stream()
                .map(User::getId)
                .map(userId -> new MilesListEntry()
                        .setUserId(userId)
                        .setMiles(milesOfUser(userId, start, end))
                )
                .collect(Collectors.toList());
    }

}
