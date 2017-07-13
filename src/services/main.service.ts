import { Injectable } from '@angular/core';
import { Response } from '@angular/http'

import { IResult, TokenModel, SyncModel } from './../models';
import { UserFilter } from "../filters/user-filter";
import { ProjectFilter } from "../filters/project-filter";
import { ActionFilter } from "../filters/action-filter";
import { FileFilter } from "../filters/file-filter";
import { SyncEnum } from "../enums/sync-enum";
import { Configuration } from "../configuration/configuration";
import { UserService } from "./user.service";
import { ProjectService } from "./project.service";
import { ActionService } from "./action.service";
import { CacheService } from "./cache.service";
import { HelperService } from "./index";
import { CommentService } from "./comment.service"
import { Observable } from "rxjs";


@Injectable()
export class MainService {
  public isOpenMenu: boolean = false;
  public currentUser: TokenModel;
  public users: Array<any> = [];
  public projects: Array<any> = [];
  public actions: Array<any> = [];
  public filterDocuments: any = {};
  public selectUser: any = {};
  public editUser: any = {};
  public editProject: any = {};
  public projectRaw: any = {};
  public files: Array<any> = [];
  public selected: string = 'active';
  public userFilter: UserFilter = new UserFilter();
  public projectFilter: ProjectFilter = new ProjectFilter();
  public actionFilter: ActionFilter = new ActionFilter();
  public fileFilter: FileFilter = new FileFilter();
  public title: string = 'All Actions';
  public viewDocument: boolean = false;
  public countAll: number = 0;
  public intervalSync: any;
  public syncArray: Array<SyncModel> = new Array<SyncModel>();
  private subscriber:any;

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private actionService: ActionService,
    private cacheService: CacheService,
    private helperService: HelperService,
    private commentService: CommentService) {
    this.userFilter.enableCounters = true;
    this.projectFilter.enableCounters = true;
    this.actionFilter.status = 'active';

    this.cacheService.getNetworkStatusChanges().subscribe(status => {
      if (status) {
        this.syncUp();
      }
    })
  }

  public bindSyncArray(data: SyncModel[]): void {
    if (this.actionFilter.userID != null) {
      this.syncArray = data.filter(t => {
        var hasUser = t.data.assignedUsers.find(t => t.userID == this.actionFilter.userID) != null;
        if (!hasUser && this.actionFilter.userID == this.currentUser.user_id) {
          hasUser = t.data.assignedUsers.length == 0;
        }
        return hasUser && t.type == SyncEnum.creation;
      });
    } else if (this.actionFilter.projectID != null) {
      this.syncArray = data.filter(t => {
        var hasUser = t.data.projects.find(t => t.projectD == this.actionFilter.projectID) != null;
        return hasUser && t.type == SyncEnum.creation;
      });
    } else {
      this.syncArray = data.filter(t => { return t.type == SyncEnum.creation });
    }
  }

  public syncUp(): void {
    this.cacheService.getItem('sync-key').then(data => {
      if (data.length > 0 && this.cacheService.isOnline()) {
        this.cacheService.saveItem('sync-key', [], null, Configuration.MinutesInMonth);
        this.bindSyncArray([]);
        
        let arrayObj: Array<Observable<Response>> = [];

        for (let i = 0; i < data.length; i++) {
          if (data[i].type == SyncEnum.creation) {
            if (data[i].data.actionID != undefined) {
              delete data[i].data.actionID;
            }
            arrayObj.push(this.actionService.add(data[i].data));
          } else if (data[i].type == SyncEnum.comment) {
            arrayObj.push(this.commentService.add(data[i].data));
          }
        }
        
        Observable.forkJoin(arrayObj).subscribe(data => {
          let actions:Array<any> = new Array<any>();
          data.forEach(result => {
            let action = result.json();
            if (action.commentID == undefined) {
              actions.push(action);
              this.updateMenuItems(action);
            }
          });

          this.actionService.addLocalArrayActions(actions);           
        }, error => {
          this.cacheService.saveItem('sync-key', [], null, Configuration.MinutesInMonth);
          this.bindSyncArray([]);
        });
      }
    }).catch(error => { });
  }

  public bindUsers(): void {
    this.userService.getAll(this.userFilter).subscribe(resp => {
      let response: IResult = resp.json();
      this.users = response.results;
    }, err => { })
  }

  public bindProjects(): void {
    this.projectService.getAll(this.projectFilter).subscribe(resp => {
      let response: IResult = resp.json();
      this.projects = response.results;
    }, err => { })
  }

  public bindActions(call?: (enabled: boolean) => void): void {
    this.cacheService.getItem('sync-key').then(data => {
      this.bindSyncArray(data);
    }).catch(error => { })

    if (this.subscriber != undefined) {
      this.subscriber.unsubscribe();
    }

    this.subscriber = this.actionService.getAll(this.actionFilter).subscribe(resp => {
      let response: IResult = resp;

      if (this.actionFilter.searchCriteria == '' && this.actionFilter.status == 'active') {
        this.actions = [];
        if (this.actionFilter.userID != null) {
          this.actions = response.results.filter(t => {
            var hasUser = t.assignedUsers.find(t => t.userID == this.actionFilter.userID) != null;
            if (!hasUser && this.actionFilter.userID == this.currentUser.user_id) {
              hasUser = t.assignedUsers.length == 0;
            }
            return hasUser;
          });
        } else if (this.actionFilter.projectID != null) {
          this.actions = response.results.filter(t => {
            var hasUser = t.projects.find(t => t.projectID == this.actionFilter.projectID) != null;
            if (!hasUser && this.actionFilter.projectID == 0) {
              hasUser = t.projects.length == 0;
            }
            return hasUser;
          });
        } else {
          this.actions = response.results;
        }

        this.actionFilter.hasNextPage = false;
        if (call != null) {
          call.call(null, false);
        }
      } else {
        if (this.actionFilter.page == 0) {
          this.actions = [];
        }

        response.results.forEach(element => {
          this.actions.push(element);
        });

        this.actionFilter.hasNextPage = response.hasNextPage;

        if (call != null) {
          call.call(null, response.hasNextPage);
        }
      }
    }, err => { this.helperService.presentToastMessage(Configuration.ErrorMessage); })
  }

  public bindCountActions(): void {
    this.actionService.countActive().subscribe(data => {
      this.countAll = parseInt(data.json());
      let countByProject = 0
      this.projects.forEach(element => {
        countByProject += element.countActions;
      });

      this.projectRaw = {
        projectID: 0,
        name: 'Raw',
        countActions: this.countAll - countByProject,
        countUpdates: 0
      };
    }, err => { console.log(err); })
  }

  public bind(call?: () => void): void {
    this.actionFilter.page = 0;
    this.bindUsers();
    this.bindActions();
    this.projectService.getAll(this.projectFilter).subscribe(resp => {
      let response: IResult = resp.json();
      this.projects = response.results;

      this.bindCountActions();
      if (call != null) {
        call.call(null);
      }
    }, err => {
      console.log(err);
      if (call != null) {
        call.call(null);
      }
    });
  }

  public displayUserOption(event, user: any): void {
    event.stopPropagation();
    this.editUser = user;
  }

  public displayProjectOption(event, project: any): void {
    event.stopPropagation();
    this.editProject = project;
  }

  public deleteUser(user: any): void {
    this.clean();
    let index = this.users.indexOf(user);
    this.users.splice(index, 1);
  }

  public deleteProject(project: any): void {
    this.clean();
    let index = this.projects.indexOf(project);
    this.projects.splice(index, 1);
  }

  public clean(): void {
    this.editProject = {};
    this.editUser = {};
  }

  public updateMenuItems(action: any): void {
    let push: boolean = false;

    if (action.assignedUsers.length > 0) {
      for (let index = 0; index < action.assignedUsers.length; index++) {
        let user = this.users.find(t => t.userID == action.assignedUsers[index].userID);
        let indexUser = this.users.indexOf(user);
        this.users.splice(indexUser, 1);
        user.countActiveActions++;

        this.users.splice(0, 0, user);

        if (user.userID == this.actionFilter.userID) {
          push = true;
        }
      }
    }

    if (action.projects.length > 0) {
      let project = this.projects.find(t => t.projectID == action.projects[0].projectID);
      let indexProject = this.projects.indexOf(project);
      this.projects.splice(indexProject, 1);
            
      project.countActions++;
      this.projects.splice(0, 0, project);

      if (project.projectID == this.actionFilter.projectID) {
        push = true;
      }
    }

    if (this.actionFilter.userID == null && this.actionFilter.projectID == null || this.actionFilter.projectID == 0) {
      push = true;
    }

    if (push) {
      this.actions.unshift(action);
      this.countAll++;
    }
  }
}
