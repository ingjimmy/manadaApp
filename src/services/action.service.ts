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

    for (var key in filter) {
      if (key.toString() != 'hasNextPage') {
        params.set(key.toString(), filter[key]);
      }
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

  public updateLocalAction(action: any, firstItem: boolean): void {
    if (action.actionID != undefined) {
      this.cache.getAllKeys().then(keys => {
        keys.forEach(t => {
          this.cache.getItem(t).then(obj => {
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

                this.cache.saveItem(t, local).catch(t => {
                  this.cache.clearExpired(true);
                });
              }
            }
          }).catch(error => { console.log(error); });
        });
      }).catch(error => { console.log(error); });
    }
  }

  public addLocalAction(action: any, status: string): void {
    this.cache.getAllKeys().then(keys => {
      keys.forEach(t => {
        let params: URLSearchParams = new URLSearchParams(t);

        if (params.get('status') == status && params.get('page') == '0') {
          let isInclude: boolean = !params.has('userID') && !params.has('projectID');

          if (action.assignedUsers.length > 0) {
            for (let index = 0; index < action.assignedUsers.length; index++) {
              var user = action.assignedUsers[index];
              if (params.get('userID') == user.userID.toString()) {
                isInclude = true;
              }
            }
          }

          if (action.projects.length > 0) {
            for (let index = 0; index < action.projects.length; index++) {
              var project = action.projects[index];
              if (params.get('projectID') == project.projectID.toString()) {
                isInclude = true;
              }
            }
          }

          if (isInclude) {
            this.cache.getItem(t).then(obj => {
              let local: IResult = obj;
              if (local.results != undefined) {
                local.results.unshift(action);
                this.cache.saveItem(t, local).catch(t => {
                  this.cache.clearExpired(true);
                });
              }
            }).catch(error => { console.log(error); });
          }
        }
      });
    }).catch(error => { console.log(error); });
  }

  public removeLocalAction(action: any, status: string): void {
    this.cache.getAllKeys().then(keys => {
      keys.forEach(t => {
        let params: URLSearchParams = new URLSearchParams(t);
        if (params.get('status') == status && params.get('page') == '0') {
          let isRemove: boolean = !params.has('userID') && !params.has('projectID');

          if (action.assignedUsers.length > 0) {
            for (let index = 0; index < action.assignedUsers.length; index++) {
              var user = action.assignedUsers[index];
              if (params.get('userID') == user.userID.toString()) {
                isRemove = true;
              }
            }
          }

          if (action.projects.length > 0) {
            for (let index = 0; index < action.projects.length; index++) {
              var project = action.projects[index];
              if (params.get('projectID') == project.projectID.toString()) {
                isRemove = true;
              }
            }
          }

          if (isRemove) {
            this.cache.getItem(t).then(obj => {
              let local: IResult = obj;
              if (local.results != undefined) {
                let removeAction = local.results.find(t => t.actionID = action.actionID);
                if (removeAction != undefined) {
                  let index = local.results.indexOf(removeAction);
                  local.results.splice(index, 1);
                  this.cache.saveItem(t, local).catch(t => {
                    this.cache.clearExpired(true);
                  });
                }
              }
            }).catch(error => { console.log(error); });
          }
        }
      });
    }).catch(error => { console.log(error); });
  }
}
