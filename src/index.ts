import { FrontExport, ExportOptions } from "./export"

const options : ExportOptions = {
    shouldIncludeMessages: true,
    shouldIncludeComments: true,
    shouldIncludeAttachments: true
}

// Export all conversations from all inboxes available to the API key
/*
FrontExport.listInboxes()
.then(inboxes => {
    for (const inbox of inboxes) {
        FrontExport.exportInboxConversations(inbox, options)
        .then(conversations => {
            console.log(conversations.length);
        });
    }
})
*/

// Open conversations, after September 13th, 2020, with the exact phrase 
FrontExport.exportSearchConversations('"cup of coffee"', {after: 1600000000}, ['open'], options)
.then(conversations => {
    console.log(conversations.length);
})



