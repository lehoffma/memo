import {Injectable} from "@angular/core";
import {ServletService} from "./servlet.service";
import {Observable} from "rxjs/Observable";
import {Http, RequestOptionsArgs, Response} from "@angular/http";
import {Comment} from "../../shop/shared/model/comment";

@Injectable()
	export class CommentService extends ServletService<Comment> {

	constructor(private http: Http) {
		super();
	}

	/**
	 *
	 * @param id
	 */
	getById(id: number): Observable<Comment> {
		let params = new URLSearchParams();
		params.set("id", "" + id);

		return this.performRequest(this.http.get("/api/comment", {search: params}))
			.map(response => response.json().comments as any)
			.map(json => Comment.create().setProperties(json))
	}

	/**
	 *
	 * @param eventId
	 * @returns {Observable<Comment[]>}
	 */
	getByEventId(eventId: number): Observable<Comment[]> {
		let params = new URLSearchParams();
		params.set("eventId", "" + eventId);

		return this.performRequest(this.http.get("/api/comment", {search: params}))
			.map(response => response.json().comments as any[])
			.map(commentJson => commentJson.map(json => Comment.create().setProperties(json)))
		//todo cache?
	}

	/**
	 *
	 * @param searchTerm
	 */
	search(searchTerm: string): Observable<Comment[]> {
		let params = new URLSearchParams();
		params.set("searchTerm", searchTerm);

		return this.performRequest(this.http.get("/api/comment", {search: params}))
			.map(response => response.json().comments as any[])
			.map(commentJson => commentJson.map(json => Comment.create().setProperties(json)))
		//todo cache?
	}

	/**
	 *
	 * @param requestMethod
	 * @param comment
	 * @param parentId
	 * @returns {Observable<R>}
	 */
	addOrModify(requestMethod: (url: string, body: any, options?: RequestOptionsArgs) => Observable<Response>,
				comment: Comment, parentId?: number): Observable<Comment> {
		//todo remove demo
		if (comment.id >= -2) {
			return Observable.of(comment);
		}

		return this.performRequest(requestMethod("/api/comment", {comment, parentId}))
			.map(response => response.json().comment)
			.map(commentJson => Comment.create().setProperties(commentJson))
	}

	/**
	 *
	 * @param comment
	 * @param parentId
	 */
	add(comment: Comment, parentId?: number): Observable<Comment> {
		return this.addOrModify(this.http.post.bind(this.http), comment, parentId);
	}

	/**
	 *
	 * @param comment
	 * @param parentId
	 */
	modify(comment: Comment, parentId?: number): Observable<Comment> {
		return this.addOrModify(this.http.put.bind(this.http), comment, parentId);
	}

	/**
	 *
	 * @param id
	 * @param parentId
	 */
	remove(id: number, parentId?: number): Observable<Response> {
		return this.performRequest(this.http.delete("/api/delete", {body: {id, parentId}}));
	}

}
