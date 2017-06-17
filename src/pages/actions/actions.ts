import { AccountComponent } from './../account/account';
import { Component } from '@angular/core';
import { NavController, NavParams, MenuController, ModalController, AlertController, ItemSliding } from 'ionic-angular';
import { ActionListComponent } from "../action-list/action-list";
import { MainService, UserService, ProjectService } from './../../services/index';
import { UserCrudComponent } from "../user-crud/user-crud";
import { ProjectCrudComponent } from "../project-crud/project-crud";

@Component({
  selector: 'page-actions',
  templateUrl: 'actions.html',
})
export class ActionsPage {

  rootPage: any = ActionListComponent;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public mainService: MainService,
    public menuCtrl: MenuController,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private userSevice: UserService,
    private projectSevice: ProjectService) {
    this.mainService.bind();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ActionsPage');
  }

  allActions() {
    this.rootPage = ActionListComponent;
    this.menuCtrl.close();
    this.mainService.fileFilter.projectID = null;
    this.mainService.selected = 'active';
    this.mainService.files = [];
    this.mainService.actions = [];
    this.mainService.actionFilter.page = 0;
    this.mainService.actionFilter.projectID = null;
    this.mainService.actionFilter.userID = null;
    this.mainService.title = `All Actions`;
    this.mainService.bindActions();
  }

  filterUser(user: any) {
    this.rootPage = ActionListComponent;
    this.menuCtrl.close();
    this.mainService.fileFilter.projectID = null;
    this.mainService.selected = 'active';
    this.mainService.files = [];
    this.mainService.actions = [];
    this.mainService.actionFilter.page = 0;
    this.mainService.actionFilter.projectID = null;
    this.mainService.actionFilter.userID = user.userID;
    this.mainService.title = user.names;
    this.mainService.bindActions();
  }

  filterProject(project: any) {
    this.rootPage = ActionListComponent;
    this.menuCtrl.close();
    this.mainService.fileFilter.projectID = null;
    this.mainService.selected = 'active';
    this.mainService.files = [];
    this.mainService.actions = [];
    this.mainService.actionFilter.page = 0;
    this.mainService.actionFilter.projectID = project.projectID;
    this.mainService.actionFilter.userID = null;
    this.mainService.title = project.name;
    this.mainService.bindActions();
  }

  account() {
    this.rootPage = AccountComponent;
    this.menuCtrl.close();
  }

  newAction() {

  }

  addUser() {
    this.menuCtrl.close();
    let modal = this.modalCtrl.create(UserCrudComponent);
    modal.present();
  }

  addProject() {
    this.menuCtrl.close();
    let model = this.modalCtrl.create(ProjectCrudComponent);
    model.present()
  }

  removeUser(user: any, item: ItemSliding) {
    item.close();
    let alert = this.alertCtrl.create({
      title: '¿Are you sure to delete the action?',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          cssClass: 'custom-remove-confirm',
          handler: () => {
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
          }
        }
      ]
    });

    alert.present();
  }

  removeProject(project: any, item: ItemSliding) {
    item.close();
    let alert = this.alertCtrl.create({
      title: '¿Are you sure to delete the project?',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          cssClass: 'custom-remove-confirm',
          handler: () => {
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
          }
        }
      ]
    });

    alert.present();
  }

  editUser(user: any, item: ItemSliding) {
    item.close();
    let modal = this.modalCtrl.create(UserCrudComponent, { user: user });
    modal.present();
  }

  editProject(project: any, item: ItemSliding) {
    item.close();
    let model = this.modalCtrl.create(ProjectCrudComponent, { project: project });
    model.present()
  }
}
