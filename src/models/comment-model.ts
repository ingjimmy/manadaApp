export class CommentModel {
    content:string = '';
    actionID:number;
    commentID:number;
    color:string;
    countUpdates:number;
    creationDate:string;
    files:Array<any> = new Array<any>();
    modificationDate:string;
    parentID?:number;
    user:any;
    userID:number;
    comments:Array<CommentModel> = new Array<CommentModel>();
    index:number;
}
