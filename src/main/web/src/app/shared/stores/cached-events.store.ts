import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {Tour} from "../../shop/shared/model/tour";
import {Party} from "../../shop/shared/model/party";
import {Event} from "../../shop/shared/model/event";
import {EventUtilityService} from "../services/event-utility.service";
import {EventType} from "../../shop/shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {isNullOrUndefined} from "util";

/**
 * Speichert die bereits geladenen Events im Speicher, so dass dem User schneller Ergebnisse geliefert werden können
 * bei wiederholten Anfragen
 */
@Injectable()
export class CachedEventsStore {
	private _cachedEvents = {
		merch: new BehaviorSubject<Merchandise[]>([]),
		tours: new BehaviorSubject<Tour[]>([]),
		partys: new BehaviorSubject<Party[]>([])
	};
	public cachedEvents = {
		merch: this._cachedEvents.merch.asObservable(),
		tours: this._cachedEvents.tours.asObservable(),
		partys: this._cachedEvents.partys.asObservable(),
	};

	private maxCachedEvents = 100;

	constructor(private eventUtilService: EventUtilityService) {
	}

	get values(): { merch?: Merchandise[], tours?: Tour[], partys?: Party[] } {
		return {
			merch: this._cachedEvents.merch.getValue(),
			tours: this._cachedEvents.tours.getValue(),
			partys: this._cachedEvents.partys.getValue()
		};
	}


	/**
	 *
	 * @param eventId
	 * @returns {boolean}
	 */
	eventIsCached(eventId: number): boolean {
		return Object.keys(this.values)
			.some(key => this.values[key].some(event => event.id === eventId));
	}

	/**
	 * Fügt ein Event zu dem passenden Event-Cache hinzu.
	 * @param event
	 */
	add(event: Event) {
		const eventType = this.eventUtilService.getEventType(event);

		//Event Type is supported
		if (this._cachedEvents[eventType]) {
			const value: Event[] = this._cachedEvents[eventType].getValue();

			//and event isn't already part of the cache
			if (!value.find(_event => _event.id === event.id)) {
				this._cachedEvents[eventType].next([...value, event]);
			}
		}
		//todo falls zu viele events gecached sind ein paar rausschmeißen?
	}

	/**
	 * Fügt mehrere Events zu den jeweiligen Event-Caches hinzu, falls sie nicht bereits darin vorhanden sind
	 * @param events
	 */
	addMultiple(...events: Event[]) {
		const values: { merch?: Merchandise[], tours?: Tour[], partys?: Party[] } = this.values;

		events.forEach(event => {
			const eventType: EventType = this.eventUtilService.getEventType(event);

			if (!values[eventType].find(_event => _event.id === event.id)) {
				values[eventType].push(event);
			}
		});

		Object.keys(values)
			.forEach(eventType => this._cachedEvents[eventType].next(values[eventType]));
		//todo falls zu viele events gecached sind ein paar rausschmeißen?
	}

	/**
	 * Löscht das Event mit der gegebenen eventId aus dem Cache
	 * @param eventId
	 */
	remove(eventId: number) {
		const values: { merch?: Merchandise[], tours?: Tour[], partys?: Party[] } = this.values;
		Object.keys(values)
			.forEach(eventType => {
				const index = values[eventType].findIndex(event => event.id === eventId);
				if (index !== -1) {
					this._cachedEvents[eventType].next(values[eventType].splice(index, 1))
				}
			});
	}

	/**
	 * Durchsucht den cache des gegebenen Event Typens nach dem gegebenen Suchbegriff.
	 * Falls ein Wert eines Attributes eines Events matcht, wird es zu den Ergebnissen hinzugefügt
	 * @param searchTerm
	 * @param eventType
	 */
	search(searchTerm: string, eventType?: EventType): Observable<Event[]> {
		//no event type specified => return all events matching the string
		if (!eventType || isNullOrUndefined(eventType)) {
			return Observable.combineLatest(this.cachedEvents.tours, this.cachedEvents.partys, this.cachedEvents.merch,
				(tours, partys, merch) => [...tours, ...partys, ...merch])
				.map(events => events.filter((event: Event) => event.matchesSearchTerm(searchTerm)));
		}

		return this.cachedEvents[eventType]
			.map(events => events.filter((event: Event) => event.matchesSearchTerm(searchTerm)));
	}

}
