import { Injectable } from '@angular/core';
import {ElectronService} from 'ngx-electron';

@Injectable({
  providedIn: 'root'
})
export class WindowManagerService {

  constructor() { }

  open(window : string, options: any = {height: 600, width: 800, resizable: true, title: 'Window'},  ) :void {
    const _electronService  = new ElectronService();
    const remote = _electronService.remote;
    const BrowserWindow = remote.BrowserWindow;
    const win = new BrowserWindow({
      width: options.width,
      height: options.height,
      resizable: options.resizable,
      title: options.title,
      frame: false,
      transparent: false
    });
    win.webContents.openDevTools();
    win.loadURL('file://' + __dirname + '/index.html#'+window);
  }
}
