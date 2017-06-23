import { IResult } from './../models/IResult';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { Configuration } from "../configuration/configuration";
import { ActionFilter } from "../filters/action-filter";
import { CacheService } from "./cache.service";

@Injectable()
export class ActionService {

  constructor(private http: Http, private cache: CacheService) { }

  public getAll(filter: ActionFilter): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    for (var key in filter) {
      params.set(key.toString(), filter[key]);
    }

    let requestOptions = new RequestOptions();
    requestOptions.params = params;
    if (filter.searchCriteria == '') {
      let request = this.http.get(`${Configuration.UrlApi}/actions`, requestOptions).map(res => res.json());
      return this.cache.loadFromDelayedObservable(params.toString(), request, `${Configuration.UrlApi}/actions`);
    } else {
      return this.http.get(`${Configuration.UrlApi}/actions`, requestOptions).map(res => res.json());
    }
  }

  public add(model: any): Observable<Response> {
    return this.http.post(`${Configuration.UrlApi}/actions`, model);
  }

  public get(id: number): Observable<Response> {
    return this.http.get(`${Configuration.UrlApi}/actions/${id}`);
  }

  public update(model: any): Observable<Response> {
    return this.http.put(`${Configuration.UrlApi}/actions/${model.actionID}`, model);
  } 

  public delete(id: number): Observable<Response> {
    return this.http.delete(`${Configuration.UrlApi}/actions/${id}`);
  }

  public patch(model: any): Observable<Response> {
    return this.http.patch(`${Configuration.UrlApi}/actions/${model.actionID}/relationusers`, model);
  }

  public changeStatus(model: any): Observable<Response> {
    return this.http.patch(`${Configuration.UrlApi}/actions/${model.actionID}`, model);
  }
 
  public countActive() {
    return this.http.get(`${Configuration.UrlApi}/actions/countactive`);
  }

  public updateLocalAction(action: any, firstItem: boolean) {
    if (action.actionID != undefined) {
      this.cache.getAllKeys().then(keys => {
        keys.forEach(t => {
          this.cache.getItem(t).then(obj => {
            let local:IResult = obj;
            let actionL = local.results.find(t => t.actionID == action.actionID);
            if (actionL != undefined) {
              var index = local.results.indexOf(actionL);
              if (firstItem) {
                local.results.splice(index, 1);
                local.results.splice(0, 0, action);
              } else {
                local.results[index] = action;
              }              
              
              this.cache.saveItem(t, local);
            }
          });                    
        });
      });      
    }
  }
}
