import { Component, ViewChild, Renderer } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';
import { Platform, NavParams, ViewController, ModalController, Content, Footer } from "ionic-angular";

import { ActionModel, SyncModel } from "../../models";
import { MainService, ActionService, HelperService, CacheService } from "../../services/index";
import { CalendarComponent } from "../../pages";
import { Configuration } from "../../configuration/configuration";
import { CameraHelper } from "../../helpers/camera-helper";
import { AlertHelper } from "../../helpers/alert-helper";
import { SyncEnum } from "../../enums/sync-enum";
import * as moment from 'moment';

@Component({
    templateUrl: 'action-crud.html'
})
export class ActionCrudComponent {
    @ViewChild('inputname') myInput;
    @ViewChild('subject') subject;
    @ViewChild(Content) content: Content;
    @ViewChild(Footer) footer: Footer;
    public model: ActionModel = new ActionModel();
    public updateAction: any;
    public users: Array<any> = new Array<any>();
    public projects: Array<any> = new Array<any>();
    public username: string;
    public projectname: string;
    public keyboardHideSub: any;
    public keyboardShowSub: any;
    public rootPath: string;
    public showAnimate: boolean = false;
    public isBusy: boolean = false;
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public mainService: MainService,
        private alertHelper: AlertHelper,
        private actionService: ActionService,
        private keyboard: Keyboard,
        public renderer: Renderer,
        private cameraHelper: CameraHelper,
        private helperService: HelperService,
        private cacheService: CacheService) {
        this.rootPath = Configuration.Url;

        this.updateAction = params.get('action');
        if (this.updateAction != undefined) {
            this.actionService.get(this.updateAction.actionID).subscribe(data => {
                this.model = data.json();
                if (this.model.dueDate != null) {
                    this.model.dueDate = moment(this.model.dueDate, 'YYYY/MM/DD HH:mm:ss').format('YYYY/MM/DD');
                }
                this.subject.nativeElement.innerHTML = this.model.subject;
            }, error => {
                this.helperService.presentToastMessage(Configuration.ErrorMessage);
            });
        } else {
            if (this.mainService.actionFilter.projectID != null) {
                let project = this.mainService.projects.find(t => t.projectID == this.mainService.actionFilter.projectID);
                if (project != undefined) {
                    this.model.projects.push(project);
                }
            }

            if (this.mainService.actionFilter.userID != null) {
                let user = this.mainService.users.find(t => t.userID == this.mainService.actionFilter.userID);
                if (user != undefined) {
                    this.model.assignedUsers.push(user);
                }
            }
        }
    }

    public ionViewDidLoad(): void {
        if (this.platform.is('ios')) {
            this.addKeyboardListeners()

            let scrollContentElelment = this.content.getScrollElement();

            scrollContentElelment.style.cssText = scrollContentElelment.style.cssText + "transition: all " + 200 + "ms; -webkit-transition: all " +
                200 + "ms; -webkit-transition-timing-function: ease-out; transition-timing-function: ease-out;";
        }

        let div = document.querySelectorAll('[contenteditable]')[0];
        window.setTimeout(() => {
            var sel, range;            
            if (window.getSelection && document.createRange) {
                this.keyboard.show();
                range = document.createRange();
                range.selectNodeContents(div);
                range.collapse(true);
                sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);                
            }
        }, 750);        
    }

    public dismiss(): void {
        this.keyboard.close();
        this.viewCtrl.dismiss();
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

    public send(form: any): void {
        if (this.subject.nativeElement.innerHTML != '' && !this.isBusy) {
            this.model.subject = this.subject.nativeElement.innerHTML;
            this.isBusy = true;
            if (this.model.actionID != null) {
                this.actionService.update(this.model).subscribe(data => {
                    var result = data.json();

                    let call = this.params.get('call');
                    if (call != undefined) {
                        call.call(null, this.model);
                    }

                    let act = this.mainService.actions.find(t => t.actionID == this.model.actionID);
                    result.color = act.color;
                    this.actionService.updateLocalAction(result, true);
                    let index = this.mainService.actions.indexOf(act);
                    this.mainService.actions.splice(index, 1);
                    this.mainService.actions.splice(0, 0, result);

                    if (this.model.assignedUsers.length > 0) {
                        this.mainService.bindUsers();
                    }

                    if (this.model.projects.length > 0) {
                        this.mainService.bindProjects();
                    }

                    this.dismiss();
                    this.isBusy = false;
                }, error => {
                    this.dismiss();
                    this.isBusy = false;
                    this.helperService.presentToastMessage(Configuration.ErrorMessage);
                });
            } else {
                let item: SyncModel = new SyncModel();
                item.date = new Date();
                item.data = this.model;
                item.type = SyncEnum.creation;

                if (!this.cacheService.isOnline()) {
                    this.model.shortSubject = this.helperService.getShortSubject(this.model.subject);
                    this.model.actionID = parseInt(moment().format('YYYYMDHHmmss')) * -1;
                    this.cacheService.getItemOrSaveIfNotExist('sync-key').then(data => {
                        data.unshift(item);
                        this.mainService.syncArray = data.filter(t => t.type == SyncEnum.creation);
                        this.cacheService.saveItem('sync-key', data, null, Configuration.MinutesInMonth);
                        this.showAnimate = true;
                        this.keyboard.close();

                        setTimeout(() => {
                            this.dismiss();
                        }, 1700);
                    }).catch(error => { console.log(error); });                    
                    
                } else {
                    this.actionService.add(this.model).subscribe(data => {
                        this.isBusy = false;
                        let result = data.json();
                        this.model.actionID = result.actionID;
                        this.showAnimate = true;
                        this.keyboard.close();

                        this.mainService.updateMenuItems(result);
                        this.actionService.addLocalAction(result);

                        setTimeout(() => {
                            this.dismiss();
                        }, 1700);

                    }, error => {
                        this.isBusy = false;
                        this.helperService.presentToastMessage(Configuration.ErrorMessage);
                        this.dismiss();
                    });
                }
            }
        } else {
            this.alertHelper.alert('The action description is required');
        }
    }

    public calendar(): void {
        this.keyboard.close();
        let modal = this.modalCtrl.create(CalendarComponent, { action: this.model });
        modal.present();
    }

    public displayUsers(event): void {
        if (event.target.value != '') {
            this.users = this.mainService.users.filter(e => {
                return e.names.toLocaleLowerCase().indexOf(event.target.value.toLocaleLowerCase()) > -1;
            });
        } else {
            this.users = [];
        }
    }

    public displayProjects(event): void {
        if (event.target.value != '') {
            this.projects = this.mainService.projects.filter(e => {
                return e.name.toLocaleLowerCase().indexOf(event.target.value.toLocaleLowerCase()) > -1;
            });
        } else {
            this.projects = [];
        }
    }

    public addUser(event: Event, user: any): void {
        event.preventDefault();
        this.myInput.nativeElement.focus();
        if (this.model.assignedUsers.find(t => t.userID == user.userID) == null) {
            this.model.assignedUsers.push(user);
        }
        this.users = [];
        this.username = '';
    }

    public removeLast(event): void {
        if (event.keyCode == 8 && (this.username == '' || this.username == undefined) && this.model.assignedUsers.length > 0) {
            this.model.assignedUsers.splice(this.model.assignedUsers.length - 1, 1);
        }
    }

    public addProject(event: Event, project: any): void {
        event.preventDefault();
        this.model.projects = [];
        this.model.projects.push(project);
        this.projects = [];
        this.projectname = '';
    }

    public removeLastProject(event): void {
        if (event.keyCode == 8 && (this.projectname == '' || this.projectname == undefined) && this.model.projects.length > 0) {
            this.model.projects.splice(this.model.projects.length - 1, 1);
        }
    }

    public attach(event): void {
        if (this.cacheService.isOnline()) {
            let countFiles = this.model.files.filter(e => { return e.fileID == 0; }).length;
            if (countFiles < 4) {
                this.cameraHelper.takeFromDevice((file) => {
                    this.model.files.push(file);
                });
            } else {
                this.alertHelper.alert('The max number of files to upload is 4');
            }
        } else {
            this.helperService.presentToastMessage(Configuration.ErrorMessage);
        }
    }

    public removeFile(event: Event, file: any): void {
        event.preventDefault();
        let index = this.model.files.indexOf(file);
        this.model.files.splice(index, 1);
    }

    public footerTouchStart(event): void {
        if (event.target.localName !== "input" && event.target.localName !== "button") {
            event.preventDefault();
        }
    }

    public scrollUp(event): void {
        //this.content.scrollTo(0, 200);
    }
}