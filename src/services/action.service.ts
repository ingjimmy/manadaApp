import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams } from '@angular/http'
import { Observable } from 'rxjs/Observable';

import { CacheService } from './cache.service';
import { IResult } from './../models';
import { Configuration } from "../configuration/configuration";
import { ActionFilter } from "../filters/action-filter";

@Injectable()
export class ActionService {

  constructor(private http: Http, private cache: CacheService) { }

  public getAll(filter: ActionFilter): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();

    if (filter.searchCriteria == '' && filter.status == 'active') {
      params.set('getAll', 'true');

      let requestOptions = new RequestOptions();
      requestOptions.params = params;

      let request = this.http.get(`${Configuration.UrlApi}/actions`, requestOptions).map(res => res.json());
      return this.cache.loadFromDelayedObservable('active-actions', request);
    } else {
      for (var key in filter) {
        if (key.toString() != 'hasNextPage') {
          params.set(key.toString(), filter[key]);
        }
      }

      let requestOptions = new RequestOptions();
      requestOptions.params = params;

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

  public updateLocalAction(action: any, firstItem: boolean): void {
    if (action.actionID != undefined) {
      this.cache.getItem('active-actions').then(obj => {
        let local: IResult = obj;
        if (local.results != undefined) {
          let actionL = local.results.find(t => t.actionID == action.actionID);
          if (actionL != undefined) {
            var index = local.results.indexOf(actionL);
            if (firstItem) {
              local.results.splice(index, 1);
              local.results.splice(0, 0, action);
            } else {
              local.results[index] = action;
            }

            this.cache.saveItem('active-actions', local).catch(sav => {
              this.cache.clearExpired(true);
            });
          }
        }
      }).catch(error => { console.log(error); });
    }
  }

  public addLocalAction(action: any): void {
    this.cache.getItem('active-actions').then(obj => {
      let local: IResult = obj;
      local.results.unshift(action);
      this.cache.saveItem('active-actions', local).then(sav => {
      }).catch(sav => {
        this.cache.clearExpired(true);
      });
    }).catch(error => { console.log(error); });
  }

  public addLocalArrayActions(actions: Array<any>): void {
    this.cache.getItem('active-actions').then(obj => {
      let local: IResult = obj;
      actions.forEach(itm => {
        local.results.unshift(itm);
      });
      
      this.cache.saveItem('active-actions', local).then(sav => {
      }).catch(sav => {
        this.cache.clearExpired(true);
      });
    }).catch(error => { console.log(error); });
  }

  public removeLocalAction(action: any): void {
    this.cache.getItem('active-actions').then(obj => {
      let local: IResult = obj;

      let actionLocal = local.results.find(t => t.actionID == action.actionID);
      if (actionLocal != undefined) {
        let index = local.results.indexOf(actionLocal);
        local.results.splice(index, 1);

        this.cache.saveItem('active-actions', local).then(sav => {
        }).catch(sav => {
          this.cache.clearExpired(true);
        });
      }
    }).catch(error => { console.log(error); });
  }
}
