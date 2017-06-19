import { Configuration } from './../../configuration/configuration';
import { IResult } from './../../models/IResult';
import { ActionService } from './../../services/action.service';
import { MainService } from './../../services/main.service';
import { Component } from '@angular/core';
import { ItemSliding } from 'ionic-angular';
import { ActionSheetController, Platform, AlertController, ModalController, NavController } from "ionic-angular";
import { ProjectListPage } from "../project-list/project-list";
import { FileService } from "../../services/index";
import { ActionCrudComponent } from "../action-crud/action-crud";
import { ActionDetailComponent } from "../action-detail/action-detail";

@Component({
    templateUrl: 'action-list.html'
})
export class ActionListComponent {
    enableSearch: boolean = false;
    intervalSearch: any = null;
    constructor(
        public mainService: MainService,
        public actionsheetCtrl: ActionSheetController,
        public platform: Platform,
        private actionService: ActionService,
        private alertCtrl: AlertController,
        public modalCtrl: ModalController,
        public fileService: FileService,
        public navCtrl: NavController) { }

    filter() {
        this.mainService.files = [];
        this.mainService.actions = [];
        this.mainService.actionFilter.hasNextPage = false;
        this.mainService.fileFilter.hasNextPage = false;
        this.mainService.actionFilter.page = 0;
        this.mainService.actionFilter.status = this.mainService.selected;
        this.mainService.bindActions();
    }

    docs() {
        this.mainService.actions = [];
        this.mainService.fileFilter.page = 0;
        this.mainService.fileFilter.projectID = this.mainService.actionFilter.projectID;
        this.bindDocuments();
    }

    bindDocuments(call?: (hasNextPage: boolean) => void) {
        this.fileService.getAll(this.mainService.fileFilter).subscribe(resp => {
            let response: IResult = resp.json();
            response.results.forEach(element => {
                element.img = `${Configuration.Url}${element.path}`;
                this.mainService.files.push(element);
                this.mainService.fileFilter.hasNextPage = response.hasNextPage;

                if (call != null) {
                    call.call(null, response.hasNextPage);
                }
            });
        });
    }

    newAction() {
        let modal = this.modalCtrl.create(ActionCrudComponent);
        modal.present();
    }

    detail(action: any) {
        this.navCtrl.push(ActionDetailComponent, { action: action });
    }

    done(action: any) {
        let model: any = {};
        model.actionID = action.actionID;
        model.status = action.status;
        model.status = model.status == 0 ? 1 : 0;

        action.remove = true;
        setTimeout(() => {
            let index = this.mainService.actions.indexOf(action);
            this.mainService.actions.splice(index, 1);
        }, 500);

        this.actionService.changeStatus(model).subscribe(data => {
            let add = action.status === 0 ? -1 : 1;

            this.mainService.countAll += add;

            if (action.assignedUsers.length > 0) {
                for (let i = 0; i < action.assignedUsers.length; i++) {
                    let user = this.mainService.users.find(t => t.userID == action.assignedUsers[i].userID);
                    if (user != null) {
                        user.countActiveActions += add;
                    }
                }
            } else {
                this.mainService.users[0].countActiveActions += add;
            }

            if (action.projects.length > 0) {
                for (var i = 0; i < action.projects.length; i++) {
                    let project = this.mainService.projects.find(t => t.projectID == action.projects[i].projectID);
                    if (project) {
                        project.countActions += add;
                    }
                }
            }

            let countByProject = 0;
            for (let i = 0; i < this.mainService.projects.length; i++) {
                countByProject += this.mainService.projects[i].countActions;
            }

            this.mainService.projectRaw.countActions = this.mainService.countAll - countByProject;
        }, error => {
            console.log(error);
        });
    }

    openmenu(action: any, slidingItem: ItemSliding) {
        slidingItem.close();
        let actionSheet = this.actionsheetCtrl.create({
            title: 'Manada',
            cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: 'Edit',
                    icon: !this.platform.is('ios') ? 'edit' : null,
                    handler: () => {
                        let editPop = this.modalCtrl.create(ActionCrudComponent, { action: action });
                        editPop.present();
                    }
                },
                {
                    text: 'List',
                    icon: !this.platform.is('ios') ? 'list' : null,
                    handler: this.openListProjects.bind(null, action, this.modalCtrl)
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    icon: !this.platform.is('ios') ? 'close' : null,
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

    remove(action: any) {
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
                        action.remove = true;
                        setTimeout(() => {
                            let index = this.mainService.actions.indexOf(action);
                            this.mainService.actions.splice(index, 1);
                        }, 500);

                        this.actionService.delete(action.actionID).subscribe(data => {

                        }, error => {
                            console.log(error);
                        });
                    }
                }
            ]
        });

        alert.present();
    }

    openListProjects(action: any, modalCtrl: ModalController) {
        let modal = modalCtrl.create(ProjectListPage, { action: action });
        modal.present();
    }

    getItems(event) {
        this.mainService.actionFilter.searchCriteria = event.target.value;

        if (this.intervalSearch != null) {
            clearTimeout(this.intervalSearch);
        }

        if (this.mainService.actionFilter.searchCriteria != '') {
            this.intervalSearch = setTimeout(() => {
                this.mainService.actionFilter.page = 0;
                this.mainService.bindActions();
            }, 300);
        } else {
            this.mainService.bindActions();
        }
    }

    toggleSearch() {
        this.enableSearch = !this.enableSearch;
        this.mainService.actionFilter.searchCriteria = '';
        if (!this.enableSearch) {
            this.mainService.bindActions();
        }
    }

    doInfinite(infiniteScroll) {
        if (this.mainService.actionFilter.hasNextPage || this.mainService.fileFilter.hasNextPage) {
            if (this.mainService.fileFilter.projectID != null) {
                this.mainService.fileFilter.page++;
                this.bindDocuments(enabled => {
                    infiniteScroll.complete();
                });
            } else {
                this.mainService.actionFilter.page++;
                this.mainService.bindActions(enabled => {
                    infiniteScroll.complete();
                });
            } 
        } else {
            infiniteScroll.complete();
        }
    }
}