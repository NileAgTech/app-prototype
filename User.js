module.exports = class User {
    constructor(email, cookie) {
        this.email = email;
        this.cookie = cookie
    }

    updateCookie(newcookie){
        this.cookie = newcookie
    }
    
    deleteCookie(){
        this.cookie = null
    }

};