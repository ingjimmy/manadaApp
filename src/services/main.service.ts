import { Injectable } from '@angular/core';

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

@Injectable()
export class MainService {
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

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private actionService: ActionService,
    private cacheService: CacheService) {
    this.userFilter.enableCounters = true;
    this.projectFilter.enableCounters = true;
    this.actionFilter.status = 'active';
    this.intervalSync = setInterval(() => {
      this.syncUp();
    }, 60000);
  }

  public syncUp(): void {
    this.cacheService.getItem('sync-key').then(data => {
      this.syncArray = data;
      if (this.syncArray.length > 0 && this.cacheService.isOnline()) {
        this.syncArray.forEach(element => {
          if (element.type == SyncEnum.creation) {
            this.actionService.add(element.data).subscribe(result => {
              let action = result.json();
              this.updateMenuItems(action);
              this.actionService.addLocalAction(action, 'active');

              let index = this.syncArray.indexOf(element);
              this.syncArray.splice(index, 1);

              this.cacheService.saveItem('sync-key', this.syncArray, null, Configuration.MinutesInMonth);
            }, error => console.log(error));
          }
        });
      }
    }).catch(error => { });
  }

  public bindUsers(): void {
    this.userService.getAll(this.userFilter).subscribe(resp => {
      let response: IResult = resp.json();
      this.users = response.results;
    }, err => { console.log(err); })
  }

  public bindProjects(): void {
    this.projectService.getAll(this.projectFilter).subscribe(resp => {
      let response: IResult = resp.json();
      this.projects = response.results;
    }, err => { console.log(err); })
  }

  public bindActions(call?: (enabled: boolean) => void): void {
    this.actionService.getAll(this.actionFilter).subscribe(resp => {
      let response: IResult = resp;
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
    }, err => { console.log(err); })
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
        user.countActiveActions++;

        if (user.userID == this.actionFilter.userID) {
          push = true;
        }
      }
    }

    if (action.projects.length > 0) {
      let project = this.projects.find(t => t.projectID == action.projects[0].projectID);
      project.countActions++;

      if (project.projectID == this.actionFilter.projectID) {
        push = true;
      }
    }

    if (this.actionFilter.userID == null && this.actionFilter.projectID == null) {
      push = true;
    }

    if (push) {
      this.actions.unshift(action);
      this.countAll++;
    }
  }
}
