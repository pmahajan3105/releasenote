# Email & Slack Integration Guide

**Release Notes Generator - Based on Zeda's Production System**  
*Version: 1.0 | Last Updated: January 2025*

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Email Notification System](#email-notification-system)
3. [Slack Integration System](#slack-integration-system)
4. [Queue System for Background Processing](#queue-system-for-background-processing)
5. [User Preference Management](#user-preference-management)
6. [Implementation Guide](#implementation-guide)
7. [Production Considerations](#production-considerations)

---

## Architecture Overview

This guide details how to implement enterprise-grade email and Slack notifications based on **Zeda's production system**, which handles high-volume, multi-tenant notifications with sophisticated template management and user preferences.

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Release Note  │───▶│  Notification   │───▶│   RabbitMQ      │
│   Published     │    │   Controller    │    │    Queue        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Prefs     │◀───│  Event Router   │───▶│  Queue Workers  │
│   Database      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                              ┌────────────────────────┼────────────────────────┐
                              ▼                        ▼                        ▼
                    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                    │  Email Service  │    │  Slack Service  │    │  In-App Notifs │
                    │   (Resend)      │    │   (Webhooks)    │    │                 │
                    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

1. **Notification Controller** - Central orchestration
2. **Queue System** - RabbitMQ for reliable delivery
3. **Email Service** - Resend integration with templates
4. **Slack Service** - OAuth + webhook messaging
5. **User Preferences** - Granular notification settings
6. **Template Engine** - Dynamic content generation

---

## Email Notification System

### 1. Email Service Implementation

**Core Email Service** (`server/services/emailService.js`)
```javascript
const { Resend } = require('resend');
const config = require('../config');

class EmailService {
  constructor() {
    if (config.email?.resend?.apiKey) {
      this.resend = new Resend(config.email.resend.apiKey);
    } else {
      console.warn('Resend API key not configured');
    }
  }

  async sendEmail({ to, subject, html, text, attachments = [] }) {
    if (!this.resend) {
      throw new Error('Email service not configured');
    }

    try {
      const emailData = {
        from: config.email.resend.from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text
      };

      if (attachments.length > 0) {
        emailData.attachments = attachments;
      }

      const result = await this.resend.emails.send(emailData);
      console.log('Email sent successfully:', result.data?.id);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendReleaseNoteNotification(releaseNote, recipients, organization) {
    const subject = `New Release: ${releaseNote.title} - ${organization.name}`;
    
    const html = await this.generateReleaseNoteEmail(releaseNote, organization);
    const text = this.generatePlainTextVersion(releaseNote);

    const promises = recipients.map(recipient => 
      this.sendEmail({
        to: recipient.email,
        subject,
        html,
        text
      })
    );

    return Promise.allSettled(promises);
  }
}

module.exports = new EmailService();
```

### 2. Email Template System

**Professional HTML Templates** (`server/templates/emailTemplates.js`)
```javascript
class EmailTemplateEngine {
  getEmailTemplate(content, organization = {}) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Release Notes - ${organization.name || 'Release Notes Generator'}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f8f9fa;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background: linear-gradient(135deg, #7F56D9 0%, #6B46C1 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
          border-radius: 8px 8px 0 0; 
        }
        .content { 
          background: #fff; 
          padding: 30px 20px; 
          border: 1px solid #e1e5e9; 
          border-top: none;
        }
        .footer { 
          background: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          color: #6c757d; 
          font-size: 14px; 
          border-radius: 0 0 8px 8px; 
        }
        .button { 
          display: inline-block; 
          background: #7F56D9; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: 500; 
          margin: 20px 0;
        }
        .release-content { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 6px; 
          margin: 20px 0; 
          border-left: 4px solid #7F56D9;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .release-meta {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          border: 1px solid #bbdefb;
        }
        .category-badge {
          display: inline-block;
          background: #7F56D9;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin: 2px 4px 2px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${organization.name || 'Release Notes'}</div>
          <h1>🚀 New Release Published</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>You're receiving this because you're subscribed to ${organization.name || 'release'} updates.</p>
          <p>
            <a href="{{{unsubscribe_url}}}">Unsubscribe</a> | 
            <a href="{{{preferences_url}}}">Update Preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>`;
  }

  generateReleaseNoteEmail(releaseNote, organization) {
    const content = `
      <h2>${releaseNote.title}</h2>
      
      <div class="release-meta">
        <strong>Version:</strong> ${releaseNote.version || 'Latest'}<br>
        <strong>Release Date:</strong> ${new Date(releaseNote.publishedAt).toLocaleDateString()}<br>
        <strong>Categories:</strong> 
        ${releaseNote.categories?.map(cat => `<span class="category-badge">${cat}</span>`).join('') || 'General'}
      </div>
      
      <div class="release-content">
        ${releaseNote.content}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.clientHost}/notes/${organization.slug}/${releaseNote.slug}" class="button">
          View Full Release Notes
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
        <h3>What's Next?</h3>
        <ul>
          <li>Check out our <a href="${config.clientHost}/roadmap">roadmap</a> for upcoming features</li>
          <li>Share feedback on this release</li>
          <li>Join our community discussions</li>
        </ul>
      </div>`;

    return this.getEmailTemplate(content, organization);
  }

  generatePlainTextVersion(releaseNote) {
    return `
${releaseNote.title}

${releaseNote.content.replace(/<[^>]*>/g, '')}

View full release notes: ${config.clientHost}/notes/${releaseNote.organizationSlug}/${releaseNote.slug}

---
You're receiving this because you're subscribed to release updates.
    `.trim();
  }
}

module.exports = new EmailTemplateEngine();
```

### 3. Advanced Email Features

**Email Preferences & Segmentation**
```javascript
class EmailPreferenceManager {
  async getUserPreferences(userId) {
    return await db.EmailPreferences.findOne({
      where: { userId },
      defaults: {
        releaseNotes: true,
        majorUpdates: true,
        minorUpdates: false,
        securityUpdates: true,
        frequency: 'immediate', // immediate, daily, weekly
        format: 'html' // html, text
      }
    });
  }

  async updatePreferences(userId, preferences) {
    return await db.EmailPreferences.upsert({
      userId,
      ...preferences,
      updatedAt: new Date()
    });
  }

  async getEligibleRecipients(releaseNote, organizationId) {
    const query = `
      SELECT u.email, u.name, ep.* 
      FROM users u
      JOIN email_preferences ep ON u.id = ep.user_id
      WHERE u.organization_id = ? 
        AND ep.release_notes = true
        AND u.email_verified = true
    `;
    
    const recipients = await db.sequelize.query(query, {
      replacements: [organizationId],
      type: db.Sequelize.QueryTypes.SELECT
    });

    // Filter by release type preferences
    return recipients.filter(recipient => {
      if (releaseNote.type === 'major' && !recipient.majorUpdates) return false;
      if (releaseNote.type === 'minor' && !recipient.minorUpdates) return false;
      if (releaseNote.type === 'security' && !recipient.securityUpdates) return false;
      return true;
    });
  }
}
```

---

## Slack Integration System

### 1. Slack OAuth & Authentication

**OAuth Flow Implementation** (`server/integrations/slack/auth.js`)
```javascript
const { WebClient } = require('@slack/web-api');

class SlackAuthService {
  constructor() {
    this.clientId = process.env.SLACK_CLIENT_ID;
    this.clientSecret = process.env.SLACK_CLIENT_SECRET;
    this.redirectUri = process.env.SLACK_REDIRECT_URL;
  }

  getAuthUrl(state, organizationId) {
    const scopes = [
      'channels:read',
      'groups:read',
      'chat:write',
      'users:read',
      'team:read'
    ].join(',');

    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      state: `${state}:${organizationId}`,
      response_type: 'code'
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(`Slack OAuth error: ${data.error}`);
    }

    return {
      accessToken: data.access_token,
      teamId: data.team.id,
      teamName: data.team.name,
      botUserId: data.bot_user_id,
      scope: data.scope
    };
  }

  async storeSlackIntegration(organizationId, tokenData) {
    return await db.SlackIntegration.upsert({
      organizationId,
      teamId: tokenData.teamId,
      teamName: tokenData.teamName,
      accessToken: this.encryptToken(tokenData.accessToken),
      botUserId: tokenData.botUserId,
      scope: tokenData.scope,
      isActive: true,
      connectedAt: new Date()
    });
  }
}
```

### 2. Slack Messaging Service

**Message Sending & Channel Management** (`server/integrations/slack/messageService.js`)
```javascript
const { WebClient } = require('@slack/web-api');

class SlackMessageService {
  async sendReleaseNoteToSlack(releaseNote, organization, channels) {
    const integration = await this.getSlackIntegration(organization.id);
    
    if (!integration) {
      throw new Error('Slack integration not found');
    }

    const slack = new WebClient(this.decryptToken(integration.accessToken));
    
    const blocks = this.buildReleaseNoteBlocks(releaseNote, organization);
    
    const promises = channels.map(async (channelId) => {
      try {
        const result = await slack.chat.postMessage({
          channel: channelId,
          text: `New release: ${releaseNote.title}`, // fallback text
          blocks: blocks,
          unfurl_links: false,
          unfurl_media: false
        });

        await this.logSlackMessage(releaseNote.id, channelId, result.ts);
        return { success: true, channel: channelId, ts: result.ts };
      } catch (error) {
        console.error(`Failed to send to channel ${channelId}:`, error);
        return { success: false, channel: channelId, error: error.message };
      }
    });

    return Promise.allSettled(promises);
  }

  buildReleaseNoteBlocks(releaseNote, organization) {
    const releaseUrl = `${process.env.CLIENT_HOST}/notes/${organization.slug}/${releaseNote.slug}`;
    
    return [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🚀 New Release: ${releaseNote.title}`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Version:* ${releaseNote.version || 'Latest'}`
          },
          {
            type: "mrkdwn",
            text: `*Release Date:* ${new Date(releaseNote.publishedAt).toLocaleDateString()}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: this.formatContentForSlack(releaseNote.content)
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Full Release Notes"
            },
            url: releaseUrl,
            style: "primary"
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Share Feedback"
            },
            url: `${releaseUrl}#feedback`
          }
        ]
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Released by ${organization.name} | <${releaseUrl}|View online>`
          }
        ]
      }
    ];
  }

  formatContentForSlack(htmlContent) {
    // Convert HTML to Slack markdown
    let content = htmlContent
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '*$1*\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '*$1*')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1')
      .replace(/<[^>]+>/g, '') // Remove remaining HTML tags
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .trim();

    // Truncate if too long (Slack has limits)
    if (content.length > 2800) {
      content = content.substring(0, 2800) + '...\n\n*View full release notes for complete details.*';
    }

    return content;
  }

  async getChannelList(organizationId) {
    const integration = await this.getSlackIntegration(organizationId);
    
    if (!integration) {
      return [];
    }

    const slack = new WebClient(this.decryptToken(integration.accessToken));
    
    try {
      const [channels, groups] = await Promise.all([
        slack.conversations.list({ types: 'public_channel', limit: 200 }),
        slack.conversations.list({ types: 'private_channel', limit: 200 })
      ]);

      const allChannels = [
        ...channels.channels.map(ch => ({ ...ch, type: 'public' })),
        ...groups.channels.map(ch => ({ ...ch, type: 'private' }))
      ];

      return allChannels
        .filter(channel => !channel.is_archived)
        .map(channel => ({
          id: channel.id,
          name: channel.name,
          type: channel.type,
          memberCount: channel.num_members,
          isPrivate: channel.is_private
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching Slack channels:', error);
      return [];
    }
  }
}
```

### 3. Slack Channel Management

**Frontend Channel Selection** (`components/SlackChannelSelector.tsx`)
```tsx
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';

interface SlackChannel {
  id: string;
  name: string;
  type: 'public' | 'private';
  memberCount: number;
  isPrivate: boolean;
}

interface SlackChannelSelectorProps {
  organizationId: string;
  selectedChannels: string[];
  onChannelsChange: (channels: string[]) => void;
}

export const SlackChannelSelector: React.FC<SlackChannelSelectorProps> = ({
  organizationId,
  selectedChannels,
  onChannelsChange
}) => {
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChannels();
  }, [organizationId]);

  const fetchChannels = async () => {
    try {
      const response = await fetch(`/api/integrations/slack/channels?org=${organizationId}`);
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching Slack channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleChannel = (channelId: string) => {
    const newSelection = selectedChannels.includes(channelId)
      ? selectedChannels.filter(id => id !== channelId)
      : [...selectedChannels, channelId];
    
    onChannelsChange(newSelection);
  };

  if (loading) {
    return <div className="p-4">Loading Slack channels...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Search channels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {filteredChannels.map((channel) => (
          <div
            key={channel.id}
            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md"
          >
            <Checkbox
              id={channel.id}
              checked={selectedChannels.includes(channel.id)}
              onChange={() => toggleChannel(channel.id)}
            />
            <label htmlFor={channel.id} className="flex-1 cursor-pointer">
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {channel.isPrivate ? '🔒' : '#'} {channel.name}
                </span>
                <span className="text-sm text-gray-500">
                  ({channel.memberCount} members)
                </span>
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        {selectedChannels.length} channel(s) selected
      </div>
    </div>
  );
};
```

---

## Queue System for Background Processing

### 1. RabbitMQ Setup

**Queue Infrastructure** (`server/queues/publisher.js`)
```javascript
const amqp = require('amqplib');

class QueuePublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queues = {
      EMAIL_NOTIFICATIONS: 'email_notifications',
      SLACK_NOTIFICATIONS: 'slack_notifications',
      WEBHOOK_PROCESSING: 'webhook_processing'
    };
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Declare exchanges and queues
      await this.setupExchanges();
      await this.setupQueues();
      
      console.log('Queue publisher connected successfully');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async setupExchanges() {
    await this.channel.assertExchange('notifications', 'topic', { durable: true });
    await this.channel.assertExchange('webhooks', 'direct', { durable: true });
  }

  async setupQueues() {
    for (const [key, queueName] of Object.entries(this.queues)) {
      await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'dlx',
          'x-dead-letter-routing-key': `${queueName}.failed`
        }
      });
    }
  }

  async publishNotification(type, data, priority = 0) {
    const message = {
      id: generateId(),
      type,
      data,
      timestamp: new Date().toISOString(),
      attempts: 0
    };

    const routingKey = `notification.${type}`;
    
    await this.channel.publish(
      'notifications',
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        priority,
        messageId: message.id,
        timestamp: Date.now()
      }
    );

    console.log(`Published ${type} notification:`, message.id);
    return message.id;
  }

  async publishEmailNotification(emailData) {
    return this.publishNotification('email', emailData, 5);
  }

  async publishSlackNotification(slackData) {
    return this.publishNotification('slack', slackData, 3);
  }
}

module.exports = new QueuePublisher();
```

### 2. Queue Workers

**Email Worker** (`server/queues/workers/emailWorker.js`)
```javascript
const amqp = require('amqplib');
const emailService = require('../../services/emailService');

class EmailWorker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isProcessing = false;
  }

  async start() {
    await this.connect();
    await this.processEmailQueue();
  }

  async connect() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    await this.channel.prefetch(10); // Process 10 messages at a time
  }

  async processEmailQueue() {
    await this.channel.consume('email_notifications', async (msg) => {
      if (!msg) return;

      try {
        const notification = JSON.parse(msg.content.toString());
        console.log('Processing email notification:', notification.id);

        await this.processEmailNotification(notification);
        
        this.channel.ack(msg);
        console.log('Email notification processed successfully:', notification.id);
      } catch (error) {
        console.error('Failed to process email notification:', error);
        
        const notification = JSON.parse(msg.content.toString());
        notification.attempts = (notification.attempts || 0) + 1;

        if (notification.attempts < 3) {
          // Retry with exponential backoff
          setTimeout(() => {
            this.channel.publish(
              'notifications',
              'notification.email',
              Buffer.from(JSON.stringify(notification))
            );
          }, Math.pow(2, notification.attempts) * 1000);
        } else {
          // Send to dead letter queue
          console.error('Max retries exceeded for notification:', notification.id);
        }

        this.channel.nack(msg, false, false);
      }
    });
  }

  async processEmailNotification(notification) {
    const { type, data } = notification;

    switch (type) {
      case 'release_note_published':
        await this.handleReleaseNoteEmail(data);
        break;
      case 'user_welcome':
        await this.handleWelcomeEmail(data);
        break;
      case 'password_reset':
        await this.handlePasswordResetEmail(data);
        break;
      default:
        console.warn('Unknown email notification type:', type);
    }
  }

  async handleReleaseNoteEmail(data) {
    const { releaseNote, recipients, organization } = data;
    
    await emailService.sendReleaseNoteNotification(
      releaseNote,
      recipients,
      organization
    );
  }
}

// Start the worker
if (require.main === module) {
  const worker = new EmailWorker();
  worker.start().catch(console.error);
}

module.exports = EmailWorker;
```

### 3. Notification Orchestrator

**Central Notification Controller** (`server/events/notifications/controller.js`)
```javascript
const queuePublisher = require('../../queues/publisher');
const userPreferenceService = require('./userPreferenceService');

class NotificationController {
  async publishReleaseNote(releaseNote, organization) {
    console.log('Publishing release note notifications:', releaseNote.id);

    // Get all eligible recipients
    const recipients = await this.getEligibleRecipients(releaseNote, organization);
    
    // Group recipients by preference
    const emailRecipients = recipients.filter(r => r.preferences.email);
    const slackChannels = await this.getSlackChannels(organization.id);
    
    const promises = [];

    // Queue email notifications
    if (emailRecipients.length > 0) {
      promises.push(
        queuePublisher.publishEmailNotification({
          type: 'release_note_published',
          releaseNote,
          recipients: emailRecipients,
          organization
        })
      );
    }

    // Queue Slack notifications
    if (slackChannels.length > 0) {
      promises.push(
        queuePublisher.publishSlackNotification({
          type: 'release_note_published',
          releaseNote,
          channels: slackChannels,
          organization
        })
      );
    }

    // Execute all notifications
    const results = await Promise.allSettled(promises);
    
    // Log results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Notification ${index + 1} queued successfully`);
      } else {
        console.error(`Notification ${index + 1} failed:`, result.reason);
      }
    });

    return {
      emailsSent: emailRecipients.length,
      slackChannels: slackChannels.length,
      queuedAt: new Date().toISOString()
    };
  }

  async getEligibleRecipients(releaseNote, organization) {
    // Get all organization members
    const members = await db.User.findAll({
      where: { organizationId: organization.id },
      include: [{
        model: db.NotificationPreferences,
        as: 'notificationPreferences'
      }]
    });

    // Filter based on preferences
    return members.filter(member => {
      const prefs = member.notificationPreferences || {};
      
      // Check if user wants release note notifications
      if (!prefs.releaseNotes) return false;
      
      // Check release type preferences
      if (releaseNote.type === 'major' && !prefs.majorReleases) return false;
      if (releaseNote.type === 'minor' && !prefs.minorReleases) return false;
      
      return true;
    }).map(member => ({
      id: member.id,
      email: member.email,
      name: member.name,
      preferences: member.notificationPreferences
    }));
  }

  async getSlackChannels(organizationId) {
    const slackSettings = await db.SlackSettings.findOne({
      where: { organizationId }
    });

    if (!slackSettings || !slackSettings.selectedChannels) {
      return [];
    }

    return slackSettings.selectedChannels;
  }
}

module.exports = new NotificationController();
```

---

## User Preference Management

### 1. Database Schema

**Notification Preferences Model** (`server/models/notificationPreferences.js`)
```javascript
module.exports = (sequelize, DataTypes) => {
  const NotificationPreferences = sequelize.define('NotificationPreferences', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    
    // Email preferences
    emailEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    releaseNotes: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    majorReleases: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    minorReleases: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    securityUpdates: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    
    // Frequency settings
    emailFrequency: {
      type: DataTypes.ENUM('immediate', 'daily', 'weekly'),
      defaultValue: 'immediate'
    },
    emailFormat: {
      type: DataTypes.ENUM('html', 'text'),
      defaultValue: 'html'
    },
    
    // Slack preferences
    slackEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    slackUserId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    // Timing preferences
    quietHoursStart: {
      type: DataTypes.TIME,
      allowNull: true
    },
    quietHoursEnd: {
      type: DataTypes.TIME,
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC'
    }
  }, {
    tableName: 'notification_preferences',
    timestamps: true
  });

  NotificationPreferences.associate = (models) => {
    NotificationPreferences.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return NotificationPreferences;
};
```

### 2. Preference Management API

**Preferences Controller** (`server/controllers/notificationPreferencesController.js`)
```javascript
class NotificationPreferencesController {
  async getPreferences(req, res) {
    try {
      const { userId } = req.user;
      
      const preferences = await db.NotificationPreferences.findOrCreate({
        where: { userId },
        defaults: {
          userId,
          emailEnabled: true,
          releaseNotes: true,
          majorReleases: true,
          minorReleases: false,
          securityUpdates: true,
          emailFrequency: 'immediate',
          emailFormat: 'html'
        }
      });

      res.json(preferences[0]);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({ error: 'Failed to fetch preferences' });
    }
  }

  async updatePreferences(req, res) {
    try {
      const { userId } = req.user;
      const updates = req.body;

      // Validate preferences
      const validatedUpdates = this.validatePreferences(updates);

      const [preferences] = await db.NotificationPreferences.upsert({
        userId,
        ...validatedUpdates,
        updatedAt: new Date()
      });

      res.json(preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  }

  async unsubscribeEmail(req, res) {
    try {
      const { token } = req.params;
      
      // Decode unsubscribe token
      const { userId, email } = this.decodeUnsubscribeToken(token);
      
      await db.NotificationPreferences.update(
        { 
          emailEnabled: false,
          releaseNotes: false 
        },
        { where: { userId } }
      );

      res.render('unsubscribe-success', { email });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      res.status(400).render('unsubscribe-error');
    }
  }

  validatePreferences(preferences) {
    const allowed = [
      'emailEnabled', 'releaseNotes', 'majorReleases', 
      'minorReleases', 'securityUpdates', 'emailFrequency',
      'emailFormat', 'slackEnabled', 'quietHoursStart',
      'quietHoursEnd', 'timezone'
    ];

    const validated = {};
    
    for (const [key, value] of Object.entries(preferences)) {
      if (allowed.includes(key)) {
        validated[key] = value;
      }
    }

    return validated;
  }

  generateUnsubscribeToken(userId, email) {
    const payload = { userId, email, type: 'unsubscribe' };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
  }

  decodeUnsubscribeToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

module.exports = new NotificationPreferencesController();
```

---

## Implementation Guide

### Phase 1: Basic Email Notifications

1. **Setup Resend Integration**
   ```bash
   npm install resend
   ```

2. **Create Email Service**
   - Copy `emailService.js` implementation
   - Add email templates
   - Configure Resend API key

3. **Test Basic Email Sending**
   ```javascript
   await emailService.sendEmail({
     to: 'test@example.com',
     subject: 'Test Release Note',
     html: '<h1>Test</h1>',
     text: 'Test'
   });
   ```

### Phase 2: Queue System

1. **Setup RabbitMQ**
   ```bash
   # Docker
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   
   # Or use cloud service like CloudAMQP
   ```

2. **Install Dependencies**
   ```bash
   npm install amqplib
   ```

3. **Implement Queue Publisher & Workers**
   - Copy queue implementation files
   - Start email worker process
   - Test message publishing

### Phase 3: Slack Integration

1. **Create Slack App**
   - Go to https://api.slack.com/apps
   - Create new app
   - Add OAuth scopes
   - Configure redirect URLs

2. **Implement OAuth Flow**
   - Copy Slack auth service
   - Add OAuth routes
   - Store integration credentials

3. **Test Message Sending**
   ```javascript
   await slackService.sendReleaseNoteToSlack(
     releaseNote,
     organization,
     ['C1234567890'] // channel IDs
   );
   ```

### Phase 4: User Preferences

1. **Create Database Tables**
   ```sql
   CREATE TABLE notification_preferences (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     email_enabled BOOLEAN DEFAULT true,
     release_notes BOOLEAN DEFAULT true,
     -- ... other columns
   );
   ```

2. **Add Preference Management UI**
   - Copy preference controller
   - Add frontend components
   - Implement unsubscribe flow

---

## Production Considerations

### Monitoring & Alerting

```javascript
// Queue monitoring
const queueMetrics = {
  emailQueue: {
    pending: 150,
    processing: 10,
    failed: 2,
    averageProcessingTime: 1200
  },
  slackQueue: {
    pending: 45,
    processing: 5,
    failed: 0,
    averageProcessingTime: 800
  }
};

// Health checks
app.get('/health/notifications', async (req, res) => {
  const health = {
    email: await emailService.healthCheck(),
    slack: await slackService.healthCheck(),
    queue: await queueService.healthCheck()
  };
  
  const allHealthy = Object.values(health).every(status => status.healthy);
  
  res.status(allHealthy ? 200 : 503).json(health);
});
```

### Error Handling & Recovery

```javascript
// Dead letter queue processing
class DeadLetterProcessor {
  async processFailedNotifications() {
    const failedMessages = await this.getDeadLetterMessages();
    
    for (const message of failedMessages) {
      try {
        // Attempt to analyze failure reason
        const errorAnalysis = this.analyzeFailure(message);
        
        if (errorAnalysis.retryable) {
          // Move back to main queue with reduced priority
          await this.requeueMessage(message);
        } else {
          // Log permanently failed message
          await this.logPermanentFailure(message);
        }
      } catch (error) {
        console.error('Failed to process dead letter:', error);
      }
    }
  }
}
```

### Scaling Considerations

1. **Queue Scaling**
   - Multiple worker processes
   - Auto-scaling based on queue depth
   - Load balancing across workers

2. **Email Rate Limiting**
   - Respect Resend rate limits
   - Implement backoff strategies
   - Batch email sending

3. **Slack Rate Limiting**
   - Slack API has strict rate limits
   - Implement token bucket algorithm
   - Queue Slack messages appropriately

4. **Database Optimization**
   - Index notification preferences
   - Archive old notification logs
   - Optimize recipient queries

### Security Best Practices

1. **Token Management**
   - Encrypt stored access tokens
   - Implement token rotation
   - Use environment variables for secrets

2. **Unsubscribe Security**
   - Use signed tokens for unsubscribe links
   - Implement rate limiting on unsubscribe endpoints
   - Log all unsubscribe actions

3. **Data Privacy**
   - Respect user preferences
   - Implement data retention policies
   - Provide preference export/import

This comprehensive system provides enterprise-grade email and Slack notifications with reliable delivery, user preference management, and scalable architecture based on Zeda's proven production implementation.