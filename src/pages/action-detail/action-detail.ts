import { Configuration } from './../../configuration/configuration';
import { IResult } from './../../models/IResult';
import { NavParams, Platform, Content, ActionSheetController, InfiniteScroll, Footer, ModalController, NavController } from 'ionic-angular';
import { Component, ViewChild, Renderer } from '@angular/core';
import { ActionModel } from "../../models/action-model";
import { ActionService, CommentService, MainService } from "../../services/index";
import { CommentModel } from "../../models/comment-model";
import { CommentFilter } from "../../filters/comment-filter";
import { Keyboard } from '@ionic-native/keyboard';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { BrowserTab } from "@ionic-native/browser-tab";
import { CommentCrudComponent } from "../comment-crud/comment-crud";
import { CameraHelper } from "../../helpers/camera-helper";
import { AlertHelper } from "../../helpers/alert-helper";
import { ActionCrudComponent } from "../action-crud/action-crud";
import { ActionSheetModel } from "../../models/action-sheet-model";
import { CustomActionSheetComponent } from "../../components/custom-action-sheet";

@Component({
    templateUrl: 'action-detail.html'
})
export class ActionDetailComponent {
    @ViewChild(Content) content: Content;
    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild(Footer) footer: Footer;
    public rootPath: string;
    public model: ActionModel = new ActionModel();
    public comments: Array<CommentModel> = new Array<CommentModel>();
    public comment: CommentModel = new CommentModel();
    public commentFilter: CommentFilter = new CommentFilter();
    public totalComments: number = 0;
    public keyboardHideSub: any;
    public keyboardShowSub: any;
    public showAnimate: boolean = false;
    constructor(
        public platform: Platform,
        public params: NavParams,
        private actionService: ActionService,
        private commentService: CommentService,
        private keyboard: Keyboard,
        public renderer: Renderer,
        public actionSheetCtrl: ActionSheetController,
        public photoViewer: PhotoViewer,
        private browserTab: BrowserTab,
        public modalCtrl: ModalController,
        private cameraHelper: CameraHelper,
        private alertHelper: AlertHelper,
        public mainService: MainService,
        private navCtrl: NavController) {
        this.rootPath = Configuration.Url;
        this.model = params.get('action');
        this.model.files = [];
        this.commentFilter.actionID = this.model.actionID;
        this.commentFilter.page = 0;
        this.actionService.get(this.model.actionID).subscribe(data => {
            this.model = data.json();
        }, error => {
            console.log(error);
        });
        this.bindComments(() => {
            setTimeout(() => {
                try {
                    this.content.scrollToBottom();
                    this.infiniteScroll.enable(true);
                } catch (error) {
                    console.log(error);
                }
            }, 200);
        });
    }

    public ionViewDidLoad(): void {
        if (this.platform.is('ios') && this.model.status == 0) {
            this.addKeyboardListeners();
            let scrollContentElelment = this.content.getScrollElement();

            scrollContentElelment.style.cssText = scrollContentElelment.style.cssText + "transition: all " + 200 + "ms; -webkit-transition: all " +
                200 + "ms; -webkit-transition-timing-function: ease-out; transition-timing-function: ease-out;"

            let inputSearch = this.footer.getNativeElement();

            inputSearch.style.cssText = scrollContentElelment.style.cssText + "transition: all " + 200 + "ms; -webkit-transition: all " +
                200 + "ms; -webkit-transition-timing-function: ease-out; transition-timing-function: ease-out;"
        }
    }

    public bindComments(call?: (hasNextPage: boolean) => void): void {
        this.commentService.getAll(this.commentFilter).subscribe(data => {
            let result: IResult = data.json();
            this.totalComments = result.totalCount;
            let length = this.comments.length;

            if (this.commentFilter.page == 0) {
                this.comments = [];
            }

            result.results.forEach((t, index) => {
                let comment: CommentModel = t;
                comment.index = (this.totalComments + 1) - length - index;
                this.comments.unshift(comment);
            });

            let countUpdates = this.comments.filter(e => { return e.countUpdates > 0; }).length;
            if (countUpdates > 0) {
                this.mainService.bindUsers();
                this.mainService.bindActions();
            }

            this.commentFilter.hasNextPage = result.hasNextPage;
            if (call != null) {
                call.call(null);
            }
        }, error => {
            console.log(error);
        })
    }

    private addKeyboardListeners(): void {
        let scrollContentElelment = this.content.getScrollElement();
        let footerElement = this.footer.getNativeElement();

        this.keyboardHideSub = this.keyboard.onKeyboardHide().subscribe((e) => {
            this.renderer.setElementStyle(scrollContentElelment, 'marginBottom', '44px');
            this.renderer.setElementStyle(footerElement, 'marginBottom', '0px');
        });

        this.keyboardShowSub = this.keyboard.onKeyboardShow().subscribe((e) => {
            let newHeight = (e['keyboardHeight']);
            let marginBottom = newHeight + 44 + 'px';
            this.renderer.setElementStyle(scrollContentElelment, 'marginBottom', marginBottom);
            this.renderer.setElementStyle(footerElement, 'marginBottom', newHeight + 'px');
            setTimeout(() => {
                this.content.scrollToBottom();
            }, 200);
        });
    }

    public files(event: Event): void {
        event.preventDefault();
        this.cameraHelper.takeFromDevice((file) => {
            this.comment.files.push(file);
        });
    }

    public send(event: Event): void {
        event.preventDefault();
        document.getElementById('commentinput').focus();
        if (this.comment.content != '' || this.comment.files.length > 0) {
            this.comment.actionID = this.model.actionID;
            this.commentService.add(this.comment).subscribe(data => {
                let result = data.json();
                this.totalComments += 1;
                result.index = this.totalComments + 1;
                result.comments = [];
                this.comments.push(result);
                this.comment = new CommentModel();
                let dimension = this.content.getContentDimensions();
                this.content.scrollTo(0, dimension.scrollHeight);

                let action = this.mainService.actions.find(t => t.actionID == this.model.actionID);
                if (action != undefined) {
                    let actionIndex = this.mainService.actions.indexOf(action);
                    this.mainService.actions.splice(actionIndex, 1);
                    this.mainService.actions.splice(0, 0, action);
                }
            }, error => {
                console.log(error);
            })
        }
    }

    public openPicture(file: any): void {
        this.photoViewer.show(this.rootPath + file.path);
    }

    public openFile(file: any): void {
        this.browserTab.openUrl(this.rootPath + file.path);
    }

    public footerTouchStart(event): void {
        if (event.target.localName !== "input" && event.target.localName !== "button") {
            event.preventDefault();
        }
    }

    public removeFile(event: Event, file: any): void {
        event.preventDefault();
        let index = this.comment.files.indexOf(file);
        this.comment.files.splice(index, 1);
    }

    public contentMouseDown(event): void {
        if (this.model.status == 0) {
            document.getElementById('commentinput').blur();
        }
    }

    public doInfinite(infiniteScroll): void {
        if (this.commentFilter.hasNextPage) {
            this.commentFilter.page++;
            this.bindComments(() => {
                infiniteScroll.complete();
            });
        } else {
            infiniteScroll.enable(false);
        }
    }

    public displayMenuAction(): void {
        let options: Array<ActionSheetModel> = [
            {
                name: 'Color',
                handler: (data) => {
                    this.model.color = data;
                    let action = this.mainService.actions.find(t => t.actionID == this.model.actionID);
                    if (action != undefined) {
                        action.color = data;
                    }

                    this.actionService.updateLocalAction(this.model, false);
                    this.actionService.patch(this.model).subscribe(data => { }, error => { });
                },
                colors: true
            },
            {
                name: 'Edit',
                handler: () => {
                    let pop = this.modalCtrl.create(ActionCrudComponent, {
                        action: this.model,
                        call: (mod: ActionModel) => {
                            this.model = mod;
                        }
                    });
                    pop.present();
                },
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

    public displayMenuComment(comment: CommentModel): void {
        let options: Array<ActionSheetModel> = [
            {
                name: 'Edit',
                handler: () => {
                    let pop = this.modalCtrl.create(CommentCrudComponent, { comment: comment, comments: this.comments });
                    pop.present();
                },
                colors: false
            },
            {
                name: 'Delete',
                handler: () => {
                    this.alertHelper.confirm(
                        '¿Are you sure to delete the comment?',
                        () => {
                            this.commentService.delete(comment).subscribe(data => {
                                if (comment.parentID != null) {
                                    let parent = this.comments.find(t => t.commentID == comment.parentID);
                                    let localIndex = parent.comments.indexOf(comment);
                                    parent.comments.splice(localIndex, 1);
                                } else {
                                    let index = this.comments.indexOf(comment);
                                    this.comments.splice(index, 1);
                                    this.totalComments -= 1;

                                    for (let i = index; i < this.comments.length; i++) {
                                        this.comments[i].index -= 1;
                                    }
                                }
                            }, error => {
                                console.log(error);
                            });
                        }
                    )
                },
                colors: false
            },
            {
                name: 'Cancel',
                colors: false
            }
        ];

        if (comment.parentID == null) {
            options.unshift({
                name: 'Color',
                handler: (data) => {
                    comment.color = data;
                    this.commentService.patch(comment).subscribe(data => { }, error => { });
                },
                colors: true
            });
        }

        let pop = this.modalCtrl.create(CustomActionSheetComponent, { options: options });
        pop.present();
    }

    public newSubcomment(comment: CommentModel): void {
        let pop = this.modalCtrl.create(CommentCrudComponent, { parent: comment, comments: this.comments });
        pop.present();
    }

    public changeStatus(): void {
        this.model.status = this.model.status == 0 ? 1 : 0;
        this.showAnimate = this.model.status == 1;

        let statusRemove = this.model.status == 0 ? 'ended' : 'active';
        let statusAdd = this.model.status == 0 ? 'active' : 'ended';

        this.actionService.addLocalAction(this.model, statusAdd);
        this.actionService.removeLocalAction(this.model, statusRemove);

        this.actionService.changeStatus(this.model).subscribe(data => {
            let add = this.model.status === 1 ? -1 : 1;
            this.mainService.countAll += add;

            if (this.model.assignedUsers.length > 0) {
                for (let i = 0; i < this.model.assignedUsers.length; i++) {
                    let user = this.mainService.users.find(t => t.userID == this.model.assignedUsers[i].userID);
                    if (user != null) {
                        user.countActiveActions += add;
                    }
                }
            } else {
                this.mainService.users[0].countActiveActions += add;
            }

            if (this.model.projects.length > 0) {
                for (var i = 0; i < this.model.projects.length; i++) {
                    let project = this.mainService.projects.find(t => t.projectID == this.model.projects[i].projectID);
                    if (project) {
                        project.countActions += add;
                    }
                }
            }

            let countByProject = 0;
            for (let i = 0; i < this.mainService.projects.length; i++) {
                countByProject += this.mainService.projects[i].countActions;
            }

            let action = this.mainService.actions.find(t => t.actionID == this.model.actionID);
            if (action != undefined) {
                let index = this.mainService.actions.indexOf(action);
                this.mainService.actions.splice(index, 1);
            }

            this.mainService.projectRaw.countActions = this.mainService.countAll - countByProject;
            if (this.showAnimate) {
                setTimeout(() => {
                    this.navCtrl.pop();
                }, 1200);
            } else {
                this.navCtrl.pop();
            }
        }, error => {
            console.log(error);
        });
    }
}