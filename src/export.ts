import { Conversation, ConversationStatus, Inbox, Message, Comment, Attachment } from './types'
import { exportInbox, exportConversation, exportMessage, exportComment, exportAttachment } from './helpers';
import { FrontConnector } from './connector';

// Testing logs: https://hq.frontapp.com/logs/goto/e371ec184570a54211ed7118325c4452

export type ExportOptions = {
    shouldIncludeMessages: boolean, 
    shouldIncludeComments: boolean,
    shouldIncludeAttachments: boolean
}

// Unix epoch seconds timestamps
export type DateRange = {
    before?: number,
    after?: number,
    during?: number, // List conversations from the same day
}

// The "is:" search filter includes additional searchable statuses beyond those stored on the Conversation resource
export type SearchStatus = ConversationStatus | "open" | "snoozed" | "unreplied"

export class FrontExport {
    // Lists all inboxes for the company
    public static async listInboxes(): Promise<Inbox[]> {
        return FrontConnector.makePaginatedAPIRequest<Inbox>(`https://api2.frontapp.com/inboxes`);
    }

    // Export all conversations for an inbox
    public static async exportInboxConversations(inbox : Inbox, options?: ExportOptions): Promise<Conversation[]> {
            const inboxPath = `./export/${inbox.name}`;
            const inboxConversationsUrl = `https://api2.frontapp.com/inboxes/${inbox.id}/conversations`;

            const inboxConversations = await FrontConnector.makePaginatedAPIRequest<Conversation>(inboxConversationsUrl);

            if (exportInbox(inboxPath, inbox)) {
                return this._exportConversationsWithOptions(inboxConversations, inboxPath, options)
            }     
            return inboxConversations;
    }

    // Export all conversations returned from a search query
    public static async exportSearchConversations(searchText : string, range?: DateRange, statuses?: SearchStatus[], options?: ExportOptions): Promise<Conversation[]> {
        const searchQuery = this._buildSearchQuery(searchText, range, statuses);
        const searchUrl = `https://api2.frontapp.com/conversations/search/${searchQuery}`;    
        const searchConversations = await FrontConnector.makePaginatedAPIRequest<Conversation>(searchUrl);      
        return this._exportConversationsWithOptions(searchConversations, './export/search', options);
    }

    // Although the export helpers determine how each resource exports, this implementation
    // focuses on nesting the related resources as files in directories.  The paths don't need to be
    // used by the helpers but reflect the structure of conversations' data.
    private static async _exportConversationsWithOptions(conversations: Conversation[], exportPath: string, options?: ExportOptions): Promise<Conversation[]> {
        for (const conversation of conversations) {
            // Everything past this point nests in conversation's path
            const conversationPath = `${exportPath}/${conversation.id}`;
            exportConversation(conversationPath, conversation);
    
            if (options?.shouldIncludeMessages) {
                const messages = await this._exportConversationMessages(conversationPath, conversation);
    
                // Attachments get a directory matching the 
                if (options?.shouldIncludeAttachments) {
                    for (const message of messages) {
                        await this._exportMessageAttachments(conversationPath, message);
                    }     
                }
            }         
            if (options?.shouldIncludeComments) {
                await this._exportConversationComments(conversationPath, conversation);
            }
        }
        return conversations;
    }

    private static async _exportConversationMessages(path: string, conversation: Conversation): Promise<Message[]> {
        const messages = await this._listConversationMessages(conversation);
        for (const message of messages) {
            const messagePath = `${path}/${message.created_at}-message-${message.id}.json`;
            exportMessage(messagePath, message);
        }
        return messages;
    }

    private static async _exportConversationComments(path: string, conversation: Conversation): Promise<Comment[]> {
        const comments = await this._listConversationComments(conversation);
        for (const comment of comments) {
            const commentPath = `${path}/${comment.posted_at}-comment-${comment.id}.json`;
            exportComment(commentPath, comment);
        }
        return comments;
    }

    private static async _exportMessageAttachments(path: string, message: Message): Promise<Attachment[]> {
        for (const attachment of message.attachments) {
            const attachmentPath = `${path}/attachments/${message.id}`;
            const attachmentBuffer = await FrontConnector.getAttachmentFromURL(attachment.url);
            exportAttachment(attachmentPath, attachment, attachmentBuffer);
        }
        return message.attachments;
    }

    private static async _listConversationMessages(conversation: Conversation): Promise<Message[]> {
        const url = `https://api2.frontapp.com/conversations/${conversation.id}/messages`;
        return FrontConnector.makePaginatedAPIRequest<Message>(url);
    }

    private static async _listConversationComments(conversation: Conversation): Promise<Comment[]> {
        const url = `https://api2.frontapp.com/conversations/${conversation.id}/comments`;
        return FrontConnector.makePaginatedAPIRequest<Comment>(url);
    }
    private static _buildSearchQuery(text: string, range?: DateRange, statuses?: SearchStatus[]): string {
        let query = '';
        if (range) {
            query += this._buildRangeQuery(range);
        }
        if (statuses) {
            query += this._buildStatusQuery(statuses);
        }
        query += text;

        return encodeURIComponent(query);
    }
    private static _buildRangeQuery(range: DateRange): string {
        let query = '';
        // during is used separately of before and after
        if (range.during) {
            query += `during:${range.during} `;
        }
        // before and after can be used together
        else {
            if (range.before) {
                query += `before:${range.before} `;
            }
            if (range.after) {
                query += `after:${range.after} `;
            }
        }
        return query;
    }

    private static _buildStatusQuery(statuses: SearchStatus[]): string {
        let query = '';
        for (const status of statuses) {
            query += `is:${status} `;
        }
        return query;
    }
}