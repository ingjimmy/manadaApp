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
  currentUser: TokenModel;
  users = [];
  projects = [];
  actions = [];
  filterDocuments: {};
  selectUser = {};
  editUser = {};
  editProject = {};
  projectRaw:any = {};
  files = [];
  selected: string = 'active';
  userFilter: UserFilter = new UserFilter();
  projectFilter: ProjectFilter = new ProjectFilter();
  actionFilter: ActionFilter = new ActionFilter();
  fileFilter: FileFilter = new FileFilter();
  title: string = 'All Actions';
  countAll: number = 0;

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private actionService: ActionService) {
    this.userFilter.enableCounters = true;
    this.projectFilter.enableCounters = true;
    this.actionFilter.status = 'active';
  }

  bindUsers() {
    this.userService.getAll(this.userFilter).subscribe(resp => {
      let response: IResult = resp.json();
      this.users = response.results;
    }, err => { console.log(err); })
  }

  bindProjects() {
    this.projectService.getAll(this.projectFilter).subscribe(resp => {
      let response: IResult = resp.json();
      this.projects = response.results;
    }, err => { console.log(err); })
  }

  bindActions(call?:(enabled:boolean) => void) {
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

  bindCountActions() {
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

  bind() {
    this.actionFilter.page = 0;
    this.bindUsers();
    this.bindActions();
    this.projectService.getAll(this.projectFilter).subscribe(resp => {
      let response: IResult = resp.json();
      this.projects = response.results;

      this.bindCountActions();
    }, err => { console.log(err); })
  }

  displayUserOption(event, user: any) {
    event.stopPropagation();
    this.editUser = user;
  }

  displayProjectOption(event, project: any) {
    event.stopPropagation();
    this.editProject = project;
  }

  deleteUser(user: any) {
    this.clean();
    let index = this.users.indexOf(user);
    this.users.splice(index, 1);
  }

  deleteProject(project: any) {
    this.clean();
    let index = this.projects.indexOf(project);
    this.projects.splice(index, 1);
  }

  clean() {
    this.editProject = {};
    this.editUser = {};
  }

  navigate(path: string) {

  }

  changeColor(event, action, color) {

  }

  displayChangeColor(event, action) {

  }
}
