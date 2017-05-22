import { Injectable } from '@angular/core';
import *as io from 'socket.io-client';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


@Injectable()
export class MessageSocketService {
    socket;
    constructor(private http: Http) { }


    connect() {
        this.socket = io.connect('https://chat93.herokuapp.com');
        this.socket.on('connect', () => {
            this.socket.emit('authenticate', { token: localStorage['token'] });
        })
        this.socket.on('leave', msg => console.log(msg));
        // this.socket.on('typing', user => console.log(user.username))
        // this.socket.on('stop typing', user => console.log(user.username))
    }

    disconnect() {
        this.socket.disconnect();
    }

    getAllMessages() {
        return this.http.get('https://chat93.herokuapp.com/messages')
            .map((res: Response) => {
                return res.json()
            })
    }

    sendMessage(msg): void {
        this.socket.emit('message', msg);
    }

    getMessages() {
        if (!this.socket) {
            this.connect();
        }
        let observable = new Observable(observer =>
            this.socket.on('message', msg => observer.next(msg))
        );
        return observable
    }

    joinUser() {
        let observable = new Observable(observer =>
            this.socket.on('join', msg => observer.next(msg))
        );
        return observable
    }

    // typing events
    isTyping() {
        this.socket.emit('is typing')
    }

    stopTyping() {
        this.socket.emit('stop typing')
    }

    typing() {
        let observable = new Observable(observer => {
            this.socket.on('typing', user => observer.next(user.username))
        })
        return observable
    }

    notTyping(){
        let observable = new Observable(observer => {
            this.socket.on('stop typing', user => {
                observer.next(user.username)
            })
        })
        return observable
    }
}

