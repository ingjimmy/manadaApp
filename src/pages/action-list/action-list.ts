import { Configuration } from './../../configuration/configuration';
import { IResult } from './../../models/IResult';
import { ActionService } from './../../services/action.service';
import { MainService } from './../../services/main.service';
import { Component, ViewChild } from '@angular/core';
import { ItemSliding } from 'ionic-angular';
import { ModalController, NavController, InfiniteScroll } from "ionic-angular";
import { ProjectListPage } from "../project-list/project-list";
import { FileService } from "../../services/index";
import { ActionCrudComponent } from "../action-crud/action-crud";
import { ActionDetailComponent } from "../action-detail/action-detail";
import { AlertHelper } from "../../helpers/alert-helper";
import { CustomActionSheetComponent } from "../../components/custom-action-sheet";
import { ActionSheetModel } from "../../models/action-sheet-model";
import { PhotoViewer } from "@ionic-native/photo-viewer";
import { BrowserTab } from "@ionic-native/browser-tab";
import { CacheService } from "../../services/cache.service";

@Component({
    templateUrl: 'action-list.html'
})
export class ActionListComponent {
    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    public rootPath: string;
    public enableSearch: boolean = false;
    public intervalSearch: any = null;
    constructor(
        public mainService: MainService,
        private actionService: ActionService,
        public modalCtrl: ModalController,
        public fileService: FileService,
        public navCtrl: NavController,
        private alertHelper: AlertHelper,
        public photoViewer: PhotoViewer,
        private browserTab: BrowserTab,
        private cache: CacheService) {
        this.rootPath = Configuration.Url;
    }

    public filter(value: string): void {
        this.infiniteScroll.complete();
        this.mainService.viewDocument = false;
        this.mainService.actionFilter.status = this.mainService.selected = value;
        this.mainService.files = [];
        this.mainService.actions = [];
        this.mainService.actionFilter.hasNextPage = false;
        this.mainService.fileFilter.hasNextPage = false;
        this.mainService.actionFilter.page = 0;
        this.mainService.bindActions();
    }

    public docs(): void {
        this.infiniteScroll.complete();
        this.mainService.viewDocument = true;
        this.mainService.actions = [];
        this.mainService.fileFilter.page = 0;
        this.mainService.fileFilter.projectID = this.mainService.actionFilter.projectID;
        this.bindDocuments();
    }

    public bindDocuments(call?: (hasNextPage: boolean) => void): void {
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
        }, error => {
            console.log(error);
        });
    }

    public newAction(): void {
        let modal = this.modalCtrl.create(ActionCrudComponent);
        modal.present();
    }

    public detail(action: any): void {
        this.navCtrl.push(ActionDetailComponent, { action: action });
    }

    public done(action: any): void {
        let model: any = {};
        model.actionID = action.actionID;
        model.status = action.status;
        model.status = model.status == 0 ? 1 : 0;

        action.remove = true;

        this.actionService.changeStatus(model).subscribe(data => {
            setTimeout(() => {
                let index = this.mainService.actions.indexOf(action);
                this.mainService.actions.splice(index, 1);
                
                action.status = model.status;
                action.remove = false;

                let statusRemove = action.status == 0 ? 'ended' : 'active';
                let statusAdd = action.status == 0 ? 'active' : 'ended';

                this.actionService.addLocalAction(action, statusAdd);
                this.actionService.removeLocalAction(action, statusRemove);                
            }, 500);

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

    public openmenu(action: any, slidingItem: ItemSliding): void {
        slidingItem.close();
        let options: Array<ActionSheetModel> = [
            {
                name: 'Color',
                handler: (data) => {
                    action.color = data;
                    this.actionService.updateLocalAction(action, false);
                    this.actionService.patch(action).subscribe(data => { }, error => { });
                },
                colors: true
            },
            {
                name: 'Edit',
                handler: () => {
                    let editPop = this.modalCtrl.create(ActionCrudComponent, { action: action });
                    editPop.present();
                },
                colors: false
            },
            {
                name: 'List',
                handler: this.openListProjects.bind(null, action, this.modalCtrl),
                colors: false
            },
            {
                name: 'Cancel',
                colors: false
            }
        ];

        let pop = this.modalCtrl.create(CustomActionSheetComponent, { options: options });
        pop.present();
    }

    public remove(action: any): void {
        this.alertHelper.confirm(
            '¿Are you sure to delete the action?',
            () => {
                action.remove = true;
                setTimeout(() => {
                    let index = this.mainService.actions.indexOf(action);
                    this.mainService.actions.splice(index, 1);

                    this.actionService.removeLocalAction(action, 'ended');
                }, 500);

                this.actionService.delete(action.actionID).subscribe(data => { }, error => {
                    console.log(error);
                });
            }
        );
    }

    public openListProjects(action: any, modalCtrl: ModalController): void {
        let modal = modalCtrl.create(ProjectListPage, { action: action });
        modal.present();
    }

    public getItems(event): void {
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

    public toggleSearch(): void {
        this.enableSearch = !this.enableSearch;
        this.mainService.actionFilter.searchCriteria = '';
        if (!this.enableSearch) {
            this.mainService.bindActions();
        }
    }

    public doInfinite(infiniteScroll): void {
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

    public doRefresh(refresher: any): void {
        this.cache.clearGroup(`${Configuration.UrlApi}/actions`).then(t => {
            this.mainService.bind(() => {
                this.mainService.syncUp();
                refresher.complete();
            });
        }).catch(error => { console.log(error) });
    }

    public openPicture(file: any): void {
        this.photoViewer.show(this.rootPath + file.path);
    }

    public openFile(file: any): void {
        this.browserTab.openUrl(this.rootPath + file.path);
    }

    public trackByFn(index, item): void {
        return item.actionID;
    }
}