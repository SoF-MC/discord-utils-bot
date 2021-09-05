const { APIMessage, Structures } = require("discord.js");

class ExtAPIMessage extends APIMessage {
    resolveData() {
        if (this.data) return this;
        super.resolveData();
        const allowedMentions = this.options.allowedMentions || this.target.client.options.allowedMentions || {};

        if (allowedMentions.repliedUser) {
            if (!this.data.allowed_mentions) this.data.allowed_mentions = {};
            Object.assign(this.data.allowed_mentions, { replied_user: allowedMentions.repliedUser });
        };
        if (this.options.replyTo) {
            Object.assign(this.data, { message_reference: { message_id: this.options.replyTo.id } });
        };
        return this;
    };
};

class Message extends Structures.get("Message") {
    reply(content, options) {
        return this.channel.send(ExtAPIMessage.create(this, content, options, { replyTo: this }).resolveData()).catch();
    };
    edit(content, options) {
        return super.edit(ExtAPIMessage.create(this, content, options).resolveData()).catch();
    };
};

Structures.extend("Message", () => Message);