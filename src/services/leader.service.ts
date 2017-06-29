import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Observable';

import { Configuration } from './../configuration/configuration';
import { LeaderModel } from "../models";

@Injectable()
export class LeaderService {

  constructor(private http: Http) { }

  public get(id: number): Observable<Response> {
    return this.http.get(`${Configuration.UrlApi}/leaders/${id}`);
  }

  public update(model: LeaderModel): Observable<Response> {
    return this.http.put(`${Configuration.UrlApi}/leaders/${model.leaderID}`, model);
  }
}