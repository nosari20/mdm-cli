import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from '../windows/main/main.component';
import { ManageCaComponent } from '../windows/manage-ca/manage-ca.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
    },
    {
        path: 'manage-ca',
        component: ManageCaComponent,
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {useHash: true})
    ],
    exports: [
        RouterModule
    ],
    declarations: []
})
export class AppRoutingModule { }