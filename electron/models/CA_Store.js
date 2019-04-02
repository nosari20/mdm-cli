const Store = require('electron-store');
const store =  new Store();
module.exports =  {

    /*
    * Data format :
    *
    * {
    *   cert : string (PEM Format)
    *   name : string
    * }
    * 
    */

 
    name : 'CA',
    data : (Object.getOwnPropertyNames(store.get(this.name)).length > 0 ? store.get(this.name) : []), //

    add(ca){
        this.data.push(ca);
        return this.save();
    },

    remove(ca){
        this.data = this.data.filter(d => d !== ca);
        return this.save();
    },

    list(){
        return this.data;
    },

    findById(id){
        return this.data.filter(d => d.id == id);
    },

    save(){
        store.set(this.name, this.data);
        return true;
    },

    empty(){
        this.data = [];
        return this.save();
    }

}
