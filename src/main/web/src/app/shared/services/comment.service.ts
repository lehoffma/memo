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

		//todo demo
		switch(id){
			case 0: return Observable.of(new Comment(0, 0, new Date(), 0, "Hallo wie gehts euch?", [1,2,3]));
			case 1: return Observable.of(new Comment(0, 1, new Date(), 1, "Ganz okay und dir?"));
			case 2: return Observable.of(new Comment(0, 2, new Date(), 0, "Ja auch gut.", [5]));
			case 3: return Observable.of(new Comment(0, 3, new Date(), 1, "Gutes Gespräch."));
			case 4: return Observable.of(new Comment(0, 4, new Date(), 2, "le funi comment"));
			case 5: return Observable.of(new Comment(0, 5, new Date(), 3, "jo what the fuck"))
		}

		console.log(id);
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

		//todo demo
		if(eventId >= 0){
			return Observable.of([
				new Comment(0, 0, new Date(), 0, "Hallo wie gehts euch?", [1,2,3]),
				new Comment(0, 4, new Date(), 2, "le funi comment")
			])
		}

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
