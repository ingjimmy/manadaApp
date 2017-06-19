import { Component, ViewChild, Renderer } from '@angular/core';
import { Platform, NavParams, ViewController, ModalController, Content, ActionSheetController, LoadingController } from "ionic-angular";
import { ActionModel } from "../../models/action-model";
import { MainService, HelperService, ActionService } from "../../services/index";
import { CalendarComponent } from "../calendar/calendar";
import { Keyboard } from '@ionic-native/keyboard';
import { Camera } from '@ionic-native/camera';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { Configuration } from "../../configuration/configuration";

@Component({
    templateUrl: 'action-crud.html'
})
export class ActionCrudComponent {
    @ViewChild('inputname') myInput;
    @ViewChild('subject') subject;
    @ViewChild(Content) content: Content;
    public model: ActionModel = new ActionModel();
    public updateAction: any;
    public users: Array<any> = new Array<any>();
    public projects: Array<any> = new Array<any>();
    public username: string;
    public projectname: string;
    public keyboardHideSub: any;
    public keyboardShowSub: any;
    public rootPath: string;
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public mainService: MainService,
        private helperService: HelperService,
        private actionService: ActionService,
        private keyboard: Keyboard,
        public renderer: Renderer,
        private camera: Camera,
        private transfer: Transfer,
        public actionSheetCtrl: ActionSheetController,
        public loadingCtrl: LoadingController) {
        this.rootPath = Configuration.Url;

        this.updateAction = params.get('action');
        if (this.updateAction != undefined) {
            this.actionService.get(this.updateAction.actionID).subscribe(data => {
                this.model = data.json();
                this.subject.nativeElement.innerHTML = this.model.subject;
            }, error => {
                console.log(error);
            });
        }
    }

    ionViewDidLoad(): void {
        if (this.platform.is('ios')) {
            this.addKeyboardListeners()

            let scrollContentElelment = this.content.getScrollElement();

            scrollContentElelment.style.cssText = scrollContentElelment.style.cssText + "transition: all " + 200 + "ms; -webkit-transition: all " +
                200 + "ms; -webkit-transition-timing-function: ease-out; transition-timing-function: ease-out;"
        }
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    addKeyboardListeners(): void {
        let scrollContentElelment = this.content.getScrollElement();

        this.keyboardHideSub = this.keyboard.onKeyboardHide().subscribe(() => {
            let newHeight = 44;
            let marginBottom = newHeight + 'px';
            this.renderer.setElementStyle(scrollContentElelment, 'marginBottom', marginBottom);
        });

        this.keyboardShowSub = this.keyboard.onKeyboardShow().subscribe((e) => {
            let newHeight = (e['keyboardHeight']);
            let marginBottom = newHeight + 44 + 'px';
            this.renderer.setElementStyle(scrollContentElelment, 'marginBottom', marginBottom);
        });
    }

    send(form: any): void {
        if (this.subject.nativeElement.innerHTML != '') {
            this.model.subject = this.subject.nativeElement.innerHTML;

            if (this.model.actionID != null) {
                this.actionService.update(this.model).subscribe(data => {
                    let act = this.mainService.actions.find(t => t.actionID == this.model.actionID);
                    let index = this.mainService.actions.indexOf(act);
                    this.mainService.actions.splice(index, 1);
                    this.mainService.actions.splice(0, 0, data.json());
                    this.dismiss();
                }, error => {
                    console.log(error);
                })
            } else {
                this.actionService.add(this.model).subscribe(data => {
                    let result = data.json();
                    let push: boolean = false;

                    if (result.assignedUsers.length > 0) {
                        for (let index = 0; index < result.assignedUsers.length; index++) {
                            let user = this.mainService.users.find(t => t.userID == result.assignedUsers[index].userID);
                            user.countActiveActions++;

                            if (user.userID == this.mainService.actionFilter.userID) {
                                push = true;
                            }
                        }
                    }

                    if (result.projects.length > 0) {
                        let project = this.mainService.projects.find(t => t.projectID == result.projects[0].projectID);
                        project.countActions++;

                        if (project.projectID == this.mainService.actionFilter.projectID) {
                            push = true;
                        }
                    }

                    if (this.mainService.actionFilter.userID == null && this.mainService.actionFilter.projectID == null) {
                        push = true;
                    }

                    if (push) {
                        this.mainService.actions.unshift(result);
                        this.mainService.countAll++;
                    }

                    this.dismiss();
                }, error => {
                    console.log(error);
                })
            }
        } else {
            this.helperService.alert('The action description is required');
        }
    }

    calendar(): void {
        let modal = this.modalCtrl.create(CalendarComponent, { action: this.model });
        modal.present();
    }

    displayUsers(event): void {
        if (event.target.value != '') {
            this.users = this.mainService.users.filter(e => {
                return e.names.toLocaleLowerCase().indexOf(event.target.value.toLocaleLowerCase()) > -1;
            });
        } else {
            this.users = [];
        }
    }

    displayProjects(event): void {
        if (event.target.value != '') {
            this.projects = this.mainService.projects.filter(e => {
                return e.name.toLocaleLowerCase().indexOf(event.target.value.toLocaleLowerCase()) > -1;
            });
        } else {
            this.projects = [];
        }
    }

    addUser(event: Event, user: any): void {
        event.preventDefault();
        this.myInput.nativeElement.focus();
        if (this.model.assignedUsers.find(t => t.userID == user.userID) == null) {
            this.model.assignedUsers.push(user);
        }
        this.users = [];
        this.username = '';
    }

    removeLast(event): void {
        if (event.keyCode == 8 && this.username == '' && this.model.assignedUsers.length > 0) {
            this.model.assignedUsers.splice(this.model.assignedUsers.length - 1, 1);
        }
    }

    addProject(event: Event, project: any): void {
        event.preventDefault();
        this.model.projects = [];
        this.model.projects.push(project);
        this.projects = [];
        this.projectname = '';
    }

    removeLastProject(event): void {
        if (event.keyCode == 8 && this.username == '' && this.model.assignedUsers.length > 0) {
            this.model.assignedUsers.splice(this.model.assignedUsers.length - 1, 1);
        }
    }

    attach(event): void {
        event.preventDefault();
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Select Image Source',
            buttons: [
                {
                    text: 'Load from Library',
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
                    }
                },
                {
                    text: 'Use Camera',
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.CAMERA);
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        });
        actionSheet.present();
    }

    public removeFile(event: Event, file: any): any {
        event.preventDefault();
        let index = this.model.files.indexOf(file);
        this.model.files.splice(index, 1);
    }

    private takePicture(sourceType): void {
        let options = {
            quality: 100,
            sourceType: sourceType,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };

        this.camera.getPicture(options).then((imagePath) => {
            this.uploadImage(imagePath);
        }, (err) => {
            console.log(err)
        });
    }

    private uploadImage(pat: string): void {
        var url = `${this.rootPath}/api/v2/files/upload`;
        var options = {
            fileKey: "file",
            fileName: 'file.jpg',
            chunkedMode: false,
            headers: {
                'Authorization': 'bearer ' + localStorage.getItem('accessToken')
            },
            mimeType: "multipart/form-data"
        };

        const fileTransfer: TransferObject = this.transfer.create();

        let loading = this.loadingCtrl.create({
            content: 'Uploading...',
        });
        loading.present();

        fileTransfer.upload(pat, url, options).then(data => {
            let file = JSON.parse(data.response);
            this.model.files.push(file);
            loading.dismissAll();
        }, error => {
            console.log(error.http_status);
            loading.dismissAll();
        });
    }
}