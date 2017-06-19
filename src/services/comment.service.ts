import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { Configuration } from "../configuration/configuration";
import { CommentFilter } from "../filters/comment-filter";
import { CommentModel } from "../models/comment-model";

@Injectable()
export class CommentService {

    constructor(private http: Http) { }

    public getAll(filter: CommentFilter): Observable<Response> {
        let params: URLSearchParams = new URLSearchParams();
        for (var key in filter) {
            params.set(key.toString(), filter[key]);
        }

        let requestOptions = new RequestOptions();
        requestOptions.params = params;

        return this.http.get(`${Configuration.UrlApi}/actions/${filter.actionID}/comments/`, requestOptions);
    }

    public add(model: CommentModel): Observable<Response> {
        return this.http.post(`${Configuration.UrlApi}/actions/${model.actionID}/comments`, model);
    }

    public update(model: CommentModel): Observable<Response> {
        return this.http.put(`${Configuration.UrlApi}/actions/${model.actionID}/comments/${model.commentID}`, model);
    }

    public patch(model: CommentModel): Observable<Response> {
        return this.http.put(`${Configuration.UrlApi}/actions/${model.actionID}/comments`, model);
    }

    public delete(model: CommentModel): Observable<Response> {
        return this.http.delete(`${Configuration.UrlApi}/actions/${model.actionID}/comments/${model.commentID}`);
    }
}