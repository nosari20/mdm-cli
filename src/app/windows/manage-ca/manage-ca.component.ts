import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {ElectronService} from 'ngx-electron';
import { OpenDialogOptions } from 'electron';


@Component({
  selector: 'app-manage-ca',
  templateUrl: './manage-ca.component.html',
  styleUrls: ['./manage-ca.component.scss']
})
export class ManageCaComponent implements OnInit {

  token : string = '';
  ipc : Electron.IpcRenderer;

  list = [];



  constructor(private _electronService: ElectronService, private changeDetector: ChangeDetectorRef,) { }

  ngOnInit() {
    this.ipc = this._electronService.ipcRenderer;
    this.load_send();
  }

  load_send(){
    this.token = (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16)
    this.ipc.on(`storage#${this.token}`, this.load_receive.bind(this));
    this.ipc.send(`storage`, JSON.stringify({
      token : this.token,
      file : 'ca',
      method: 'list',  
    }));
  }

  load_receive(e,resString: string){

    this.ipc.removeListener(`storage#${this.token}`,this.load_receive.bind(this));
    let res = JSON.parse(resString);
    if(res.result){
      this.list = res.result;
      this.changeDetector.detectChanges();       
    }    
  }

  addCAClick(){
        const remote = this._electronService.remote;
        const ipc = this._electronService.ipcRenderer;
        const dialogOptions : OpenDialogOptions = {
          filters: [
            { name: 'X.509', extensions: ['pem','cer'] },          
          ],
          properties: ["openFile"]
        };

        remote.dialog.showOpenDialog( dialogOptions,function(fileNames) {
          if (fileNames === undefined) return;
          let fileName = fileNames[0];
          ipc.on(`import-ca`, this.addCAReceive.bind(this));    
          ipc.send(`import-ca`, JSON.stringify({
              fileName: fileName,
          }));
      
                
            
        }.bind(this));
  }

  addCAReceive(event, resJSON){
    const ipc = this._electronService.ipcRenderer;
    ipc.removeListener(`import-ca`,this.addCAReceive);
    let res = JSON.parse(resJSON);
    if(res.imported){
      this.load_send();
    }      

  }

  deleteCAClick(id){
    const ipc = this._electronService.ipcRenderer;
      ipc.send(`delete-ca`, JSON.stringify({
        id: id,
    }));
    ipc.on(`delete-ca`, this.deleteCAReceive.bind(this)); 
  }
  deleteCAReceive(event, resJSON){
    const ipc = this._electronService.ipcRenderer;
    ipc.removeListener(`delete-ca`,this.deleteCAReceive);
    let res = JSON.parse(resJSON);
    if(res.deleted){
      this.load_send();
    } 
  }


  btoa(str: string): string {
    return btoa(str);
  }
}
