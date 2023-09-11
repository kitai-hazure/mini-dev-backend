import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';
import { IChatType } from 'types/chat.type';

@Injectable()
export class UserService {
  constructor(private jwtService: JwtService) {}
  async create(idtoken: string) {
    const res = await admin.auth().verifyIdToken(idtoken);
    const uidOfUser = res.uid;
    const user = await admin.auth().getUser(uidOfUser);
    const payload = {
      email: user.email,
      uid: user.uid,
    };

    const jwt = await this.jwtService.sign(payload);
    return jwt;
  }

  async getChats(user) {
    // I have a collection with the name chats now i want to extract all the chats with the userUID field as user.uid
    const db = admin.firestore();
    const chatsRef = db.collection('chats');

    // now get the chats with userUID as user.uid
    const snapshot = await chatsRef
      .where('userUID', '==', user.uid)
      .orderBy('timestamp', 'desc')
      .get();

    // now return the chats
    const chats = [];
    snapshot.forEach((doc) => {
      chats.push(doc.data());
    });
    return chats;
  }

  async addChat(chat: IChatType, user: any) {
    const db = admin.firestore();
    const chatRef = db.collection('chats').doc();

    const chatToSave = {
      userUID: user.uid,
      chatBody: chat.chatBody,
      timestamp: new Date().toISOString(),
    };

    await chatRef.set(chatToSave);
    return chatRef.id;
  }
}
