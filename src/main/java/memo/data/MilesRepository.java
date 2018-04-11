package memo.data;

import memo.model.MilesListEntry;
import memo.model.ShopItem;
import memo.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class MilesRepository {
    public MilesRepository() {
    }

    private static boolean isBetween(LocalDateTime value, LocalDateTime start, LocalDateTime end) {
        return (value.isAfter(start) || value.isEqual(start)) && (value.isBefore(end) || value.isEqual(end));
    }

    /**
     * Queries the participated events of the given user and sums the miles of all of them
     *
     * @param userId a value > 0 representing the ID of a memoshop user
     * @return the all-time accumulated miles of the user
     */
    public static Integer milesOfUser(Integer userId) {
        List<ShopItem> participatedEvents = EventRepository.getInstance().findByParticipant(userId).stream()
                .filter(item -> item.getDate().toLocalDateTime().isBefore(LocalDateTime.now()))
                .collect(Collectors.toList());
        return participatedEvents.stream()
                .mapToInt(ShopItem::getMiles)
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
    public static Integer milesOfUser(Integer userId, LocalDateTime start, LocalDateTime end) {
        List<ShopItem> participatedEvents = EventRepository.getInstance().findByParticipant(userId);
        return participatedEvents.stream()
                .filter(item -> item.getDate().toLocalDateTime().isBefore(LocalDateTime.now()))
                .filter(item -> isBetween(item.getDate().toLocalDateTime(), start, end))
                .mapToInt(ShopItem::getMiles)
                .sum();
    }

    /**
     * @param userId a value > 0 representing the ID of a memoshop user
     * @return the all-time accumulated miles of the user, wrapped in a milesListEntry object
     */
    public static MilesListEntry milesListEntryOfUser(Integer userId) {
        return new MilesListEntry().setUserId(userId).setMiles(milesOfUser(userId));
    }

    /**
     * @param userId a value > 0 representing the ID of a memoshop user
     * @param start  all events before this date will be filtered out
     * @param end    all events after this date will be filtered out
     * @return the accumulated miles of the user for the given season/date-range, wrapped in a milesListEntry object
     */
    public static MilesListEntry milesListEntryOfUser(Integer userId, LocalDateTime start, LocalDateTime end) {
        return new MilesListEntry().setUserId(userId).setMiles(milesOfUser(userId, start, end));
    }

    /**
     * @return the all-time miles leaderboard
     */
    public static List<MilesListEntry> milesList() {
        List<User> users = UserRepository.getInstance().getAll();
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
    public static List<MilesListEntry> milesList(LocalDateTime start, LocalDateTime end) {
        List<User> users = UserRepository.getInstance().getAll();
        return users.stream()
                .map(User::getId)
                .map(userId -> new MilesListEntry()
                        .setUserId(userId)
                        .setMiles(milesOfUser(userId, start, end))
                )
                .collect(Collectors.toList());
    }

}
