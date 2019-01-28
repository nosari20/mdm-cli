import { Component, OnInit } from '@angular/core';
import {ElectronService} from 'ngx-electron';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {

  constructor(private _electronService: ElectronService) { }

  maximized: boolean

  ngOnInit() {
    let remote : Electron.Remote = this._electronService.remote;
    if(remote == null) return
    this.maximized = remote.getCurrentWindow().isMaximized()
  }

  close(): void {
    let remote : Electron.Remote = this._electronService.remote;
    if(remote == null) return
    remote.getCurrentWindow().close();
  }

  minimize(): void {
    let remote : Electron.Remote = this._electronService.remote;
    if(remote == null) return
    remote.getCurrentWindow().minimize();
  }

  maximize(): void {
    let remote : Electron.Remote = this._electronService.remote;
    if(remote == null) return
    this.maximized = true;
    remote.getCurrentWindow().maximize(); 
  }

  unmaximize(): void {
    let remote : Electron.Remote = this._electronService.remote;
    if(remote == null) return
    this.maximized = false;
    remote.getCurrentWindow().unmaximize()
  }

}
