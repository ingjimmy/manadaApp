import { Component, ViewChild } from '@angular/core';
import { PhotoViewer } from "@ionic-native/photo-viewer";
import { BrowserTab } from "@ionic-native/browser-tab";
import { Keyboard } from '@ionic-native/keyboard';
import { ModalController, NavController, InfiniteScroll, Content, ItemSliding } from "ionic-angular";

import { Configuration } from './../../configuration/configuration';
import { IResult, ActionSheetModel } from './../../models';
import { ActionService, MainService, FileService, HelperService, CacheService } from './../../services';
import { ProjectListPage, ActionCrudComponent, ActionDetailComponent } from "./../../pages";
import { AlertHelper } from "../../helpers/alert-helper";
import { CustomActionSheetComponent } from "../../components/custom-action-sheet";

@Component({
    templateUrl: 'action-list.html'
})
export class ActionListComponent {
    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild(Content) content: Content;
    public isEnableClick: boolean = true;
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
        private cacheService: CacheService,
        private helperService: HelperService,
        private keyboard: Keyboard) {
        this.rootPath = Configuration.Url;
    }

    public ngAfterViewInit(): void {
        this.content.ionScroll.subscribe(data => {
            this.isEnableClick = false;
        })

        this.content.ionScrollEnd.subscribe(data => {
            setTimeout(() => {
                this.isEnableClick = true;
            }, 200);
        })
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
        if (this.cacheService.isOnline()) {
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
        } else {
            this.helperService.presentToastMessage(Configuration.ErrorMessage);
        }
    }

    public newAction(): void {
        let modal = this.modalCtrl.create(ActionCrudComponent);
        modal.present();
    }

    public detail(action: any): void {
        if (this.isEnableClick) {
            this.navCtrl.push(ActionDetailComponent, { action: action });
        }
    }

    public done(action: any): void {
        if (this.cacheService.isOnline()) {
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

                    if (action.status == 1) {
                        this.actionService.removeLocalAction(action);
                    } else {
                        this.actionService.addLocalAction(action);
                    }
                }, 500);

                let add = action.status === 0 ? -1 : 1;
                
                let refreshUser:boolean = false;
                let refreshProjects:boolean = false;

                this.mainService.countAll += add;

                if (action.assignedUsers.length > 0) {
                    for (let i = 0; i < action.assignedUsers.length; i++) {
                        let user = this.mainService.users.find(t => t.userID == action.assignedUsers[i].userID);
                        if (user != null) {
                            user.countActiveActions += add;

                            if (user.countUpdates > 0) {
                                refreshUser = true;
                            }
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

                            if (project.countUpdates > 0) {
                                refreshProjects = true;
                            }
                        }
                    }
                }

                let countByProject = 0;
                for (let i = 0; i < this.mainService.projects.length; i++) {
                    countByProject += this.mainService.projects[i].countActions;
                }

                this.mainService.projectRaw.countActions = this.mainService.countAll - countByProject;

                if (refreshUser) {
                    this.mainService.bindUsers();
                }

                if (refreshProjects) {
                    this.mainService.bindProjects();
                }
            }, error => {
                console.log(error);
            });
        } else {
            this.helperService.presentToastMessage(Configuration.ErrorMessage);
        }
    }

    public openmenu(action: any, slidingItem: ItemSliding): void {
        slidingItem.close();
        let options: Array<ActionSheetModel> = [
            {
                name: 'Edit',
                icon: 'icon-edit',
                handler: () => {
                    let editPop = this.modalCtrl.create(ActionCrudComponent, { action: action });
                    editPop.present();
                },
                colors: false
            },
            {
                name: 'Move to list',
                icon: 'icon-more',
                handler: this.openListProjects.bind(null, action, this.modalCtrl),
                colors: false
            },
            {
                name: 'Cancel',
                icon: 'icon-close',
                colors: false
            }
        ];

        let pop = this.modalCtrl.create(CustomActionSheetComponent, { options: options });
        pop.present();
    }

    public remove(action: any): void {
        if (this.cacheService.isOnline()) {
            this.alertHelper.confirm(
                '¿Are you sure to delete the action?',
                () => {
                    action.remove = true;
                    setTimeout(() => {
                        let index = this.mainService.actions.indexOf(action);
                        this.mainService.actions.splice(index, 1);
                    }, 500);

                    this.actionService.delete(action.actionID).subscribe(data => { }, error => {
                        console.log(error);
                    });
                }
            );
        } else {
            this.helperService.presentToastMessage(Configuration.ErrorMessage);
        }
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
            this.keyboard.close();
            this.mainService.bindActions();
        } else {
            setTimeout(() => {
                document.getElementById('txt-search').focus();
                this.keyboard.show();
            }, 10);
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
        this.cacheService.removeItem('active-actions').then(t => {
            this.mainService.bind(() => {
                refresher.complete();
                this.mainService.syncUp();
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

    public toogleMenu(): void {
        this.mainService.isOpenMenu = !this.mainService.isOpenMenu;
    }
}