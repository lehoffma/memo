import {BehaviorSubject, Observable} from "rxjs";
import {Http, Response} from "@angular/http";

interface StoreObject {
    id: number;
}

/**
 * An abstract store storing the data the currently logged in user is allowed to see
 * Supports all CRUD (create, read, update, remove) operations.
 */
export abstract class AbstractStore<T extends StoreObject> {
    protected _data: BehaviorSubject<Array<T>> = new BehaviorSubject([]);
    public data: Observable<Array<T>> = this._data
        .asObservable()
        .distinctUntilChanged();
    // .do(changes => console.log("changes to state: ", changes));

    protected baseUrl: string = "www.meilenwoelfe.de/shop";
    protected apiURL: string = "data";
    protected loadDataUrl: string = `${this.baseUrl}/${this.apiURL}.json`;

    constructor(private http: Http) {

    }

    protected getCreateDataUrl(data: T): string {
        return `${this.baseUrl}/${this.apiURL}`;
    }

    protected getUpdateDataUrl(id: number): string {
        return `${this.baseUrl}/${this.apiURL}/${id}`;
    }

    protected getRemoveDataUrl(id: number): string {
        return `${this.baseUrl}/${this.apiURL}/${id}`;
    }

	protected abstract jsonToObject(json: any): T;

    /**
     * Loads the data from the server
     */
    load() {
        //todo replace with real API call
        //also todo configure security/authorization so we don't load everything if not logged in/not an admin
        this.http.get(this.loadDataUrl)
            .map(response => response.json())
			.subscribe((json: any) => {
				let data: T[] = json.map(data => this.jsonToObject(data));

                this._data.next(data);
            });
    }

    /**
     * Creates new data object.
     * This calls the createData-API on the server and waits until the server is done adding the new data object to the database.
     * After the server returns the new data object, we add it to the observable data-stream.
     *
     * @param data the data object to be created
     */
    create(data: T) {
        this.http.post(this.getCreateDataUrl(data), JSON.stringify(data))
            .map(response => response.json())
            .subscribe((json: any) => {
				let data: T = this.jsonToObject(json);

                //add new user to the observable after creating new entry in database
                let currentData: T[] = this._data.value;
                this._data.next(Object.assign({}, currentData.concat(data)));
            }, error => console.error(`could not create user, error msg: ${error}`));
    }

    /**
     * Updates a data object with new data.
     * Similar to {@link AbstractStore#create create}, except we now update the existing user in our user-stream with
     * the new data after the server has responded with the new data.
     *
     * @param data the updated version of the data object
     */
    update(data: T) {
        this.http.put(this.getUpdateDataUrl(data.id), JSON.stringify(data))
            .map(response => response.json())
            .subscribe((json: T) => {
                let data: T = this.jsonToObject(json);

                //update the user in our user-stream with the new data
                let currentData: T[] = this._data.value;
                let index: number = currentData.findIndex(_user => _user.id === data.id);

                //replaces 1 element at 'index' with 'data'
                currentData.splice(index, 1, data);

                this._data.next(Object.assign({}, currentData));
            }, error => console.error(`could not update user, error msg: ${error}`));
    }

    /**
     * Removes the data object with the specified ID.
     * Similar to {@link AbstractStore#create create}, except we now remove the existing data object in our data-stream after the
     * server has responded.
     * @param id
     */
    remove(id: number) {
        this.http.delete(this.getRemoveDataUrl(id))
            .subscribe((response: Response) => {
                let currentData: T[] = this._data.value;
                let index: number = currentData.findIndex(data => data.id === id);

                //replaces 1 element at 'index' with nothing, thereby removing the element
                currentData.splice(index, 1);

                this._data.next(Object.assign({}, currentData));
            }, error => console.error(`could not remove user, error msg: ${error}`));
    }

    /**
     *
     * @param id the identifier
     * @returns {Observable<T>} an observable of the data object with the given ID
     */
    getDataByID(id: number): Observable<T> {
        return this.data.map(data => data.find(_data => _data.id === id))
    }

}
