import { AccountComponent } from './../account/account';
import { Component } from '@angular/core';
import { MenuController, ModalController, ItemSliding } from 'ionic-angular';
import { ActionListComponent } from "../action-list/action-list";
import { MainService, UserService, ProjectService } from './../../services/index';
import { UserCrudComponent } from "../user-crud/user-crud";
import { ProjectCrudComponent } from "../project-crud/project-crud";
import { AlertHelper } from "../../helpers/alert-helper";

@Component({
  selector: 'page-actions',
  templateUrl: 'actions.html',
})
export class ActionsPage {

  public rootPage: any = ActionListComponent;
  constructor(
    public mainService: MainService,
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private userSevice: UserService,
    private projectSevice: ProjectService,
    private alertHelper: AlertHelper) {
    this.mainService.bind();
  }

  public allActions(): void {
    this.mainService.viewDocument = false;
    this.rootPage = ActionListComponent;
    this.menuCtrl.close();
    this.mainService.fileFilter.projectID = null;
    this.mainService.selected = 'active';
    this.mainService.files = [];
    this.mainService.actions = [];
    this.mainService.actionFilter.status = 'active';
    this.mainService.actionFilter.page = 0;
    this.mainService.actionFilter.projectID = null;
    this.mainService.actionFilter.userID = null;
    this.mainService.title = 'All Actions';
    this.mainService.bindActions();
  }

  public filterUser(user: any): void {
    this.mainService.viewDocument = false;
    this.rootPage = ActionListComponent;
    this.menuCtrl.close();
    this.mainService.fileFilter.projectID = null;
    this.mainService.selected = 'active';
    this.mainService.actionFilter.status = 'active';
    this.mainService.files = [];
    this.mainService.actions = [];
    this.mainService.actionFilter.page = 0;
    this.mainService.actionFilter.projectID = null;
    this.mainService.actionFilter.userID = user.userID;
    this.mainService.title = user.names;
    this.mainService.bindActions();
  }

  public filterProject(project: any): void {
    this.mainService.viewDocument = false;
    this.rootPage = ActionListComponent;
    this.menuCtrl.close();
    this.mainService.fileFilter.projectID = null;
    this.mainService.selected = 'active';
    this.mainService.actionFilter.status = 'active';
    this.mainService.files = [];
    this.mainService.actions = [];
    this.mainService.actionFilter.page = 0;
    this.mainService.actionFilter.projectID = project.projectID;
    this.mainService.actionFilter.userID = null;
    this.mainService.title = project.name;
    this.mainService.bindActions();
  }

  public account(): void {
    this.rootPage = AccountComponent;
    this.menuCtrl.close();
  }

  newAction() {

  }

  public addUser(): void {
    this.menuCtrl.close();
    let modal = this.modalCtrl.create(UserCrudComponent);
    modal.present();
  }

  public addProject(): void {
    this.menuCtrl.close();
    let model = this.modalCtrl.create(ProjectCrudComponent);
    model.present()
  }

  public removeUser(user: any, item: ItemSliding): void {
    item.close();
    this.alertHelper.confirm(
      '¿Are you sure to delete the action?',
      () => {
        this.userSevice.delete(user.userID).subscribe(data => {
          if (this.mainService.actionFilter.userID == user.userID) {
            this.mainService.actionFilter.userID = null;
            this.mainService.actionFilter.page = 0;
            this.mainService.title = 'All Actions';
            this.mainService.bindActions();
          }

          let index = this.mainService.users.indexOf(user);
          this.mainService.users.splice(index, 1);
        })
      });
  }

  public removeProject(project: any, item: ItemSliding): void {
    item.close();
    this.alertHelper.confirm(
      '¿Are you sure to delete the project?',
      () => {
        this.projectSevice.delete(project.projectID).subscribe(data => {
          if (this.mainService.actionFilter.projectID == project.projectID) {
            this.mainService.actionFilter.projectID = null;
            this.mainService.actionFilter.page = 0;
            this.mainService.title = 'All Actions';
            this.mainService.bindActions();
          }

          this.mainService.projectRaw.countActions += project.countActions;

          let index = this.mainService.projects.indexOf(project);
          this.mainService.projects.splice(index, 1);
        });
      });
  }

  public editUser(user: any, item: ItemSliding): void {
    item.close();
    let modal = this.modalCtrl.create(UserCrudComponent, { user: user });
    modal.present();
  }

  public editProject(project: any, item: ItemSliding): void {
    item.close();
    let model = this.modalCtrl.create(ProjectCrudComponent, { project: project });
    model.present()
  }
}
