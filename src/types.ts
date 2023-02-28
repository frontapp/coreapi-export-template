// Front API types, not an exhaustive list

export type FrontAPIResponse = {
    _links: ResponseLinks;
    _pagination?: PageLinks;
    _results: [Resource];
}

export type ResponseLinks = {
    self: string;
    related?: {
        teammates?: string;
        conversations?: string;
        channels?: string;
        owner?: string;
        contact?: string;
        inboxes?: string;
    }   
}

export type PageLinks = {
    next: string;
}

export type Resource = {
    _links: ResponseLinks;
    id: string;
}

export interface Inbox extends Resource {
    name: string;
    is_private: boolean;
}

export type ConversationStatus = 
    | 'archived' 
    | 'unassigned' 
    | 'deleted' 
    | 'assigned';

export interface Conversation extends Resource {
    subject: string;
    status: ConversationStatus;
    assignee: Teammate;
    recipient: Recipient;
    tags: [Tag];
    links: [TopicLink];
    created_at: number;
    is_private: boolean;
    scheduled_reminders: [Reminder];
    metadata: ConversationMetadata;
}

export interface Teammate extends Resource {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
    is_available: boolean;
    is_blocked: boolean;
}

export type RecipientRole = 
    | 'from' 
    | 'to' 
    | 'cc' 
    | 'bcc';

export interface Recipient extends Resource {
    name: string;
    handle: string;
    role: RecipientRole;
}

export type TagHighlight = 
    | 'grey' 
    | 'pink' 
    | 'red' 
    | 'orange' 
    | 'yellow' 
    | 'green' 
    | 'light-blue' 
    | 'blue' 
    | 'purple';

export interface Tag extends Resource {
    name: string;
    highlight: TagHighlight;
    is_private: boolean;
    is_visible_in_conversation_lists: boolean;
    created_at: number;
    updated_at: number;
}

export interface TopicLink extends Resource {
    name: string;
    type: string;
    external_url: string;
}

export type Reminder = {
    _links: ResponseLinks;
    created_at: number;
    scheduled_at: number;
    updated_at: number;
}

export type ConversationMetadata = {
    external_conversation_ids: [string];
}

export type MessageType = 
    | 'custom'
    | 'email' 
    | 'googleplay' 
    | 'intercom'
    | 'internal' 
    | 'smooch' 
    | 'phone-call' 
    | 'call' 
    | 'sms' 
    | 'tweet' 
    | 'tweet_dm' 
    | 'whatsapp' 
    | 'yalo_wha' 
    | 'front_chat'

export interface Message extends Resource {
    type: MessageType;
    is_inbound: boolean;
    draft_mode?: 'shared' | 'private';
    error_type?: string;
    version: string;
    created_at: number;
    subject: string;
    blurb: string;
    author?: Teammate;
    recipients: [Recipient];
    body: string;
    text: string;
    attachments: [Attachment];
    signature: object;
    metadata: object;
}

export type Attachment = {
    id: string;
    filename: string;
    url: string;
    content_type: string;
    size: number;
    metadata: {
        is_inline: boolean;
        cid: string;
    }

}

export interface Comment extends Resource {
    author: Teammate;
    body: string;
    posted_at: number;
    attachments: [Attachment];
}

