import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams, Response } from '@angular/http'
import { Observable } from 'rxjs/Observable';

import { FileFilter } from "../filters/file-filter";
import { Configuration } from './../configuration/configuration';

@Injectable()
export class FileService {

    constructor(private http: Http) { }

    public getAll(filter: FileFilter): Observable<Response> {
        let params: URLSearchParams = new URLSearchParams();
        for (var key in filter) {
            params.set(key.toString(), filter[key]);
        }

        let requestOptions = new RequestOptions();
        requestOptions.params = params;
        return this.http.get(`${Configuration.UrlApi}/files`, requestOptions);
    }
}