import { IResult } from './../models/IResult';
import { ActionService } from './action.service';
import { ProjectService } from './project.service';
import { Injectable } from '@angular/core';
import { UserService } from "./user.service";
import { UserFilter } from "../filters/user-filter";
import { ProjectFilter } from "../filters/project-filter";
import { ActionFilter } from "../filters/action-filter";
import { TokenModel } from "../models/token-model";
import { FileFilter } from "../filters/file-filter";

@Injectable()
export class MainService {
  public currentUser: TokenModel;
  public users:Array<any> = [];
  public projects:Array<any> = [];
  public actions:Array<any> = [];
  public filterDocuments:any = {};
  public selectUser:any = {};
  public editUser:any = {};
  public editProject:any = {};
  public projectRaw:any = {};
  public files:Array<any> = [];
  public selected: string = 'active';
  public userFilter: UserFilter = new UserFilter();
  public projectFilter: ProjectFilter = new ProjectFilter();
  public actionFilter: ActionFilter = new ActionFilter();
  public fileFilter: FileFilter = new FileFilter();
  public title: string = 'All Actions';
  public viewDocument:boolean = false;
  public countAll: number = 0;

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private actionService: ActionService) {
    this.userFilter.enableCounters = true;
    this.projectFilter.enableCounters = true;
    this.actionFilter.status = 'active';
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

  public bindActions(call?:(enabled:boolean) => void): void {
    this.actionService.getAll(this.actionFilter).subscribe(resp => {
      let response: IResult = resp.json();
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
    })
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
    })
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
    }, err => { console.log(err); })
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

  changeColor(event, action, color) {

  }

  displayChangeColor(event, action) {

  }
}
