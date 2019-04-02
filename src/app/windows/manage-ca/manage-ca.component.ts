import { Component, OnInit } from '@angular/core';
import {ElectronService} from 'ngx-electron';


@Component({
  selector: 'app-manage-ca',
  templateUrl: './manage-ca.component.html',
  styleUrls: ['./manage-ca.component.scss']
})
export class ManageCaComponent implements OnInit {

  token : string = '';
  ipc : Electron.IpcRenderer;

  list = [{name: 'hello', cert: 'gjkj'}];



  constructor(private _electronService: ElectronService) { }

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
    }
    console.log(this.list);
  }


  btoa(str: string): string {
    return btoa(str);
  }
}
