import { mkdirSync, writeFileSync } from 'fs';
import { Conversation, Inbox, Message, Comment, Attachment } from './types';

// Customer-defined handlers for loading the exported resources into their system

export function exportInbox(path: string, inbox : Inbox) : boolean {
    try {
        mkdirSync(path, {recursive: true});
        return true;
    } catch {
        return false;
    }
}

export function exportConversation(path: string, conversation : Conversation) : boolean {
    try {
        // creates a directory for a conversation's messages
        mkdirSync(path, {recursive: true}); 

        // write the conversation details to a file in that same directory
        writeFileSync(`${path}/${conversation.id}.json`, JSON.stringify(conversation))
        return true;
    } catch {
        return false;
    }
}

export function exportMessage(path: string, message : Message) : boolean {
    try {
        writeFileSync(path, JSON.stringify(message));
        return true;
    } catch {
        return false;
    }
}

export function exportComment(path: string, comment : Comment) : boolean {
    try {
        writeFileSync(path, JSON.stringify(comment));
        return true;
    } catch {
        return false;
    }
}

export function exportAttachment(path: string, attachment : Attachment, buffer : Buffer) : boolean {
    try {
        // creates a directory for a messages's attachments
        mkdirSync(path, {recursive: true}); 

        writeFileSync(`${path}/${attachment.filename}`, buffer);
        return true;
    } catch {
        return false;
    }
}