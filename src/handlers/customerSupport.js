/**
 * Customer Support System for Digital Wallet
 * Live chat, ticket system, FAQ bot, and support automation
 */

import { generateSecureToken } from './encryption.js';
import { logSecurityEvent, SECURITY_EVENT_TYPES, SEVERITY_LEVELS } from './security-logger.js';
import { logUserActivity } from './helpers.js';

/**
 * Support System Configuration
 */
export const SUPPORT_CONFIG = {
  // Support Channels
  CHANNELS: {
    LIVE_CHAT: 'live_chat',
    TICKET: 'ticket',
    FAQ_BOT: 'faq_bot',
    EMAIL: 'email',
    PHONE: 'phone'
  },
  
  // Priority Levels
  PRIORITY: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
    CRITICAL: 'CRITICAL'
  },
  
  // Support Categories
  CATEGORIES: {
    ACCOUNT: 'account_issues',
    TRANSACTION: 'transaction_issues',
    DEPOSIT: 'deposit_issues',
    WITHDRAWAL: 'withdrawal_issues',
    SECURITY: 'security_issues',
    TECHNICAL: 'technical_issues',
    BILLING: 'billing_issues',
    GENERAL: 'general_inquiry'
  },
  
  // Response Time SLA (in minutes)
  SLA: {
    CRITICAL: 15,
    URGENT: 30,
    HIGH: 60,
    MEDIUM: 240,
    LOW: 480
  },
  
  // Languages
  LANGUAGES: ['th', 'en', 'zh', 'ko', 'id', 'km'],
  
  // Operating Hours
  OPERATING_HOURS: {
    start: 8,  // 8 AM
    end: 22,   // 10 PM
    timezone: 'Asia/Bangkok'
  }
};

/**
 * Support Ticket System
 */
export class SupportTicketSystem {
  
  static tickets = new Map(); // In production, use database
  static ticketCounter = 1000;
  
  /**
   * Create new support ticket
   */
  static async createTicket({
    userId,
    category,
    priority = SUPPORT_CONFIG.PRIORITY.MEDIUM,
    subject,
    description,
    language = 'th',
    attachments = [],
    metadata = {}
  }) {
    try {
      const ticketId = this.generateTicketId();
      
      const ticket = {
        ticketId,
        userId,
        category,
        priority,
        subject,
        description,
        language,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedTo: null,
        attachments,
        metadata,
        messages: [],
        tags: [],
        satisfaction: null,
        resolvedAt: null,
        responseTime: null,
        slaBreached: false
      };
      
      // Auto-assign based on category
      ticket.assignedTo = await this.autoAssignTicket(category, priority);
      
      // Calculate SLA deadline
      ticket.slaDeadline = this.calculateSLADeadline(priority);
      
      // Store ticket
      this.tickets.set(ticketId, ticket);
      
      // Log ticket creation
      await logSecurityEvent({
        type: 'SUPPORT_TICKET_CREATED',
        userId,
        severity: SEVERITY_LEVELS.LOW,
        description: `Support ticket created: ${subject}`,
        metadata: {
          ticketId,
          category,
          priority,
          subject
        }
      });
      
      // Send confirmation to user
      await this.sendTicketConfirmation(ticket);
      
      // Notify assigned agent
      if (ticket.assignedTo) {
        await this.notifyAgent(ticket.assignedTo, ticket);
      }
      
      console.log(`🎫 Ticket created: ${ticketId} (${category}/${priority})`);
      
      return ticket;
      
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error;
    }
  }
  
  /**
   * Add message to ticket
   */
  static async addMessage(ticketId, senderId, senderType, message, attachments = []) {
    try {
      const ticket = this.tickets.get(ticketId);
      if (!ticket) {
        throw new Error('ไม่พบตั๋วสนับสนุน');
      }
      
      const messageId = generateSecureToken(8);
      const messageObj = {
        messageId,
        senderId,
        senderType, // 'USER' or 'AGENT'
        message,
        attachments,
        timestamp: new Date().toISOString(),
        edited: false
      };
      
      ticket.messages.push(messageObj);
      ticket.updatedAt = new Date().toISOString();
      
      // If first agent response, calculate response time
      if (senderType === 'AGENT' && !ticket.responseTime) {
        const responseTime = Date.now() - new Date(ticket.createdAt).getTime();
        ticket.responseTime = responseTime;
        
        // Check if SLA was breached
        const slaLimit = SUPPORT_CONFIG.SLA[ticket.priority] * 60 * 1000;
        if (responseTime > slaLimit) {
          ticket.slaBreached = true;
          await this.handleSLABreach(ticket);
        }
      }
      
      // Update ticket status if user responds to resolved ticket
      if (senderType === 'USER' && ticket.status === 'RESOLVED') {
        ticket.status = 'REOPENED';
        await this.notifyAgent(ticket.assignedTo, ticket, 'REOPENED');
      }
      
      this.tickets.set(ticketId, ticket);
      
      // Notify other party
      if (senderType === 'USER' && ticket.assignedTo) {
        await this.notifyAgent(ticket.assignedTo, ticket, 'NEW_MESSAGE');
      } else if (senderType === 'AGENT') {
        await this.notifyUser(ticket.userId, ticket, 'NEW_MESSAGE');
      }
      
      return messageObj;
      
    } catch (error) {
      console.error('Add message error:', error);
      throw error;
    }
  }
  
  /**
   * Update ticket status
   */
  static async updateTicketStatus(ticketId, status, agentId = null, resolution = null) {
    try {
      const ticket = this.tickets.get(ticketId);
      if (!ticket) {
        throw new Error('ไม่พบตั๋วสนับสนุน');
      }
      
      const oldStatus = ticket.status;
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      
      if (status === 'RESOLVED' || status === 'CLOSED') {
        ticket.resolvedAt = new Date().toISOString();
        ticket.resolvedBy = agentId;
        ticket.resolution = resolution;
        
        // Send satisfaction survey
        await this.sendSatisfactionSurvey(ticket);
      }
      
      this.tickets.set(ticketId, ticket);
      
      // Log status change
      await logSecurityEvent({
        type: 'SUPPORT_TICKET_UPDATED',
        userId: ticket.userId,
        severity: SEVERITY_LEVELS.LOW,
        description: `Ticket ${ticketId} status changed: ${oldStatus} → ${status}`,
        metadata: {
          ticketId,
          oldStatus,
          newStatus: status,
          agentId
        }
      });
      
      // Notify user
      await this.notifyUser(ticket.userId, ticket, 'STATUS_UPDATED');
      
      return ticket;
      
    } catch (error) {
      console.error('Update ticket status error:', error);
      throw error;
    }
  }
  
  /**
   * Get user tickets
   */
  static async getUserTickets(userId, status = null, limit = 10) {
    try {
      let userTickets = Array.from(this.tickets.values())
        .filter(ticket => ticket.userId === userId);
      
      if (status) {
        userTickets = userTickets.filter(ticket => ticket.status === status);
      }
      
      // Sort by creation date (newest first)
      userTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Limit results
      return userTickets.slice(0, limit);
      
    } catch (error) {
      console.error('Get user tickets error:', error);
      return [];
    }
  }
  
  /**
   * Generate ticket ID
   */
  static generateTicketId() {
    return `TK${String(this.ticketCounter++).padStart(6, '0')}`;
  }
  
  /**
   * Calculate SLA deadline
   */
  static calculateSLADeadline(priority) {
    const slaMinutes = SUPPORT_CONFIG.SLA[priority];
    return new Date(Date.now() + slaMinutes * 60 * 1000).toISOString();
  }
  
  /**
   * Auto-assign ticket to agent
   */
  static async autoAssignTicket(category, priority) {
    // Implement agent assignment logic
    // For now, return mock agent based on category
    const agents = {
      [SUPPORT_CONFIG.CATEGORIES.SECURITY]: 'agent_security_001',
      [SUPPORT_CONFIG.CATEGORIES.TRANSACTION]: 'agent_finance_001',
      [SUPPORT_CONFIG.CATEGORIES.TECHNICAL]: 'agent_tech_001'
    };
    
    return agents[category] || 'agent_general_001';
  }
  
  /**
   * Handle SLA breach
   */
  static async handleSLABreach(ticket) {
    console.warn(`⚠️ SLA breached for ticket ${ticket.ticketId}`);
    
    await logSecurityEvent({
      type: 'SUPPORT_SLA_BREACHED',
      userId: ticket.userId,
      severity: SEVERITY_LEVELS.MEDIUM,
      description: `SLA breached for ticket ${ticket.ticketId}`,
      metadata: {
        ticketId: ticket.ticketId,
        priority: ticket.priority,
        responseTime: ticket.responseTime,
        slaLimit: SUPPORT_CONFIG.SLA[ticket.priority] * 60 * 1000
      }
    });
    
    // Escalate to supervisor
    await this.escalateTicket(ticket.ticketId, 'SLA_BREACH');
  }
  
  /**
   * Escalate ticket
   */
  static async escalateTicket(ticketId, reason) {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return;
    
    // Increase priority
    const priorities = Object.values(SUPPORT_CONFIG.PRIORITY);
    const currentIndex = priorities.indexOf(ticket.priority);
    if (currentIndex < priorities.length - 1) {
      ticket.priority = priorities[currentIndex + 1];
    }
    
    // Reassign to supervisor
    ticket.assignedTo = 'supervisor_001';
    ticket.tags.push('ESCALATED');
    
    this.tickets.set(ticketId, ticket);
    
    console.log(`📈 Ticket ${ticketId} escalated (${reason})`);
  }
  
  /**
   * Send notifications (implement with your notification system)
   */
  static async sendTicketConfirmation(ticket) {
    // Send confirmation message to user
    console.log(`📧 Ticket confirmation sent to user ${ticket.userId}`);
  }
  
  static async notifyAgent(agentId, ticket, type = 'NEW_TICKET') {
    // Notify agent of new/updated ticket
    console.log(`🔔 Agent ${agentId} notified: ${type} - ${ticket.ticketId}`);
  }
  
  static async notifyUser(userId, ticket, type = 'UPDATE') {
    // Notify user of ticket update
    console.log(`📱 User ${userId} notified: ${type} - ${ticket.ticketId}`);
  }
  
  static async sendSatisfactionSurvey(ticket) {
    // Send satisfaction survey to user
    console.log(`📊 Satisfaction survey sent for ticket ${ticket.ticketId}`);
  }
}

/**
 * Live Chat System
 */
export class LiveChatSystem {
  
  static chatSessions = new Map();
  static agents = new Map();
  static waitingQueue = [];
  
  /**
   * Start live chat session
   */
  static async startChatSession(userId, language = 'th', category = 'general') {
    try {
      // Check if user already has active session
      const existingSession = this.getActiveSession(userId);
      if (existingSession) {
        return existingSession;
      }
      
      const sessionId = generateSecureToken(12);
      
      const session = {
        sessionId,
        userId,
        language,
        category,
        status: 'WAITING',
        createdAt: new Date().toISOString(),
        connectedAt: null,
        endedAt: null,
        agentId: null,
        messages: [],
        waitTime: null,
        satisfaction: null
      };
      
      // Find available agent
      const availableAgent = await this.findAvailableAgent(category, language);
      
      if (availableAgent) {
        session.agentId = availableAgent.agentId;
        session.status = 'CONNECTED';
        session.connectedAt = new Date().toISOString();
        session.waitTime = 0;
        
        // Mark agent as busy
        availableAgent.status = 'BUSY';
        availableAgent.currentSession = sessionId;
        this.agents.set(availableAgent.agentId, availableAgent);
        
      } else {
        // Add to waiting queue
        this.waitingQueue.push(sessionId);
        await this.notifyUserInQueue(userId, this.waitingQueue.length);
      }
      
      this.chatSessions.set(sessionId, session);
      
      await logSecurityEvent({
        type: 'LIVE_CHAT_STARTED',
        userId,
        severity: SEVERITY_LEVELS.LOW,
        description: 'Live chat session started',
        metadata: {
          sessionId,
          category,
          language,
          agentId: session.agentId
        }
      });
      
      return session;
      
    } catch (error) {
      console.error('Start chat session error:', error);
      throw error;
    }
  }
  
  /**
   * Send chat message
   */
  static async sendChatMessage(sessionId, senderId, senderType, message) {
    try {
      const session = this.chatSessions.get(sessionId);
      if (!session) {
        throw new Error('ไม่พบเซสชันแชท');
      }
      
      if (session.status !== 'CONNECTED') {
        throw new Error('เซสชันแชทไม่ได้เชื่อมต่อ');
      }
      
      const messageObj = {
        messageId: generateSecureToken(8),
        senderId,
        senderType,
        message,
        timestamp: new Date().toISOString()
      };
      
      session.messages.push(messageObj);
      this.chatSessions.set(sessionId, session);
      
      // Notify other party in real-time
      if (senderType === 'USER') {
        await this.notifyAgent(session.agentId, messageObj);
      } else {
        await this.notifyUser(session.userId, messageObj);
      }
      
      return messageObj;
      
    } catch (error) {
      console.error('Send chat message error:', error);
      throw error;
    }
  }
  
  /**
   * End chat session
   */
  static async endChatSession(sessionId, endedBy, reason = 'USER_REQUEST') {
    try {
      const session = this.chatSessions.get(sessionId);
      if (!session) {
        throw new Error('ไม่พบเซสชันแชท');
      }
      
      session.status = 'ENDED';
      session.endedAt = new Date().toISOString();
      session.endedBy = endedBy;
      session.endReason = reason;
      
      // Free up agent
      if (session.agentId) {
        const agent = this.agents.get(session.agentId);
        if (agent) {
          agent.status = 'AVAILABLE';
          agent.currentSession = null;
          this.agents.set(session.agentId, agent);
          
          // Assign next waiting user
          await this.processWaitingQueue(session.agentId);
        }
      }
      
      this.chatSessions.set(sessionId, session);
      
      // Send satisfaction survey
      await this.sendChatSatisfactionSurvey(session);
      
      await logSecurityEvent({
        type: 'LIVE_CHAT_ENDED',
        userId: session.userId,
        severity: SEVERITY_LEVELS.LOW,
        description: 'Live chat session ended',
        metadata: {
          sessionId,
          duration: Date.now() - new Date(session.createdAt).getTime(),
          messageCount: session.messages.length,
          endedBy,
          reason
        }
      });
      
      return session;
      
    } catch (error) {
      console.error('End chat session error:', error);
      throw error;
    }
  }
  
  /**
   * Helper methods
   */
  static getActiveSession(userId) {
    return Array.from(this.chatSessions.values())
      .find(session => session.userId === userId && ['WAITING', 'CONNECTED'].includes(session.status));
  }
  
  static async findAvailableAgent(category, language) {
    return Array.from(this.agents.values())
      .find(agent => 
        agent.status === 'AVAILABLE' && 
        agent.categories.includes(category) && 
        agent.languages.includes(language)
      );
  }
  
  static async processWaitingQueue(availableAgentId) {
    if (this.waitingQueue.length === 0) return;
    
    const nextSessionId = this.waitingQueue.shift();
    const session = this.chatSessions.get(nextSessionId);
    
    if (session && session.status === 'WAITING') {
      const agent = this.agents.get(availableAgentId);
      
      session.agentId = availableAgentId;
      session.status = 'CONNECTED';
      session.connectedAt = new Date().toISOString();
      session.waitTime = Date.now() - new Date(session.createdAt).getTime();
      
      agent.status = 'BUSY';
      agent.currentSession = nextSessionId;
      
      this.chatSessions.set(nextSessionId, session);
      this.agents.set(availableAgentId, agent);
      
      // Notify user they're connected
      await this.notifyUserConnected(session.userId, session.agentId);
    }
  }
  
  static async notifyUserInQueue(userId, position) {
    console.log(`📞 User ${userId} in queue position ${position}`);
  }
  
  static async notifyUserConnected(userId, agentId) {
    console.log(`✅ User ${userId} connected to agent ${agentId}`);
  }
  
  static async notifyAgent(agentId, message) {
    console.log(`💬 Agent ${agentId} received message`);
  }
  
  static async notifyUser(userId, message) {
    console.log(`💬 User ${userId} received message`);
  }
  
  static async sendChatSatisfactionSurvey(session) {
    console.log(`📊 Chat satisfaction survey sent for session ${session.sessionId}`);
  }
}

/**
 * FAQ Bot System
 */
export class FAQBotSystem {
  
  static faqDatabase = {
    // Account Related
    'account_login': {
      question: 'ไม่สามารถเข้าสู่ระบบได้',
      answer: 'กรุณาตรวจสอบ:\n1. ยูสเซอร์เนมและรหัสผ่านถูกต้อง\n2. อินเทอร์เน็ตเชื่อมต่อปกติ\n3. ลองล้างแคชในแอป\n\nหากยังไม่ได้ กรุณาติดต่อฝ่ายสนับสนุน',
      category: 'account',
      keywords: ['เข้าสู่ระบบ', 'login', 'ลงชื่อเข้าใช้', 'รหัสผ่าน']
    },
    'account_2fa': {
      question: 'การตั้งค่า 2FA',
      answer: 'วิธีตั้งค่า 2FA:\n1. ไปที่ตั้งค่าบัญชี\n2. เลือกความปลอดภัย\n3. เปิดใช้งาน 2FA\n4. สแกน QR Code หรือใส่ข้อมูลด้วยตนเอง\n5. ยืนยันด้วยรหัส OTP',
      category: 'security',
      keywords: ['2fa', 'two factor', 'ความปลอดภัย', 'otp']
    },
    
    // Transaction Related
    'deposit_thb': {
      question: 'วิธีฝากเงินบาท',
      answer: 'การฝากเงินบาท:\n1. เลือกเมนูฝากเงิน\n2. เลือกธนาคารที่ต้องการ\n3. โอนเงินตามรายละเอียด\n4. ถ่ายภาพสลิป\n5. รอการยืนยันอัตโนมัติ 1-5 นาที',
      category: 'deposit',
      keywords: ['ฝากเงิน', 'deposit', 'บาท', 'thb', 'โอนเงิน']
    },
    'withdraw_usdt': {
      question: 'วิธีถอน USDT',
      answer: 'การถอน USDT:\n1. เลือกเมนูถอนเงิน\n2. เลือก USDT\n3. ใส่ Wallet Address\n4. ระบุจำนวนที่ต้องการถอน\n5. ยืนยันด้วย 2FA\n6. รอการประมวลผล 10-30 นาที',
      category: 'withdrawal',
      keywords: ['ถอนเงิน', 'withdraw', 'usdt', 'wallet', 'address']
    },
    
    // Fees and Limits
    'fees_commission': {
      question: 'ค่าธรรมเนียมและค่าคอมมิชชั่น',
      answer: 'ค่าธรรมเนียม:\n• ฝากเงิน: ฟรี\n• ถอน USDT: 1 USDT\n• แลกเปลี่ยน: 0.1%\n• VIP ลดค่าธรรมเนียม 10-50%\n\nดูรายละเอียดเพิ่มเติมที่เมนูค่าธรรมเนียม',
      category: 'billing',
      keywords: ['ค่าธรรมเนียม', 'fee', 'commission', 'คอมมิชชั่น', 'ราคา']
    },
    
    // Technical Issues
    'app_slow': {
      question: 'แอปทำงานช้า',
      answer: 'แก้ไขแอปช้า:\n1. ปิดแอปแล้วเปิดใหม่\n2. ตรวจสอบอินเทอร์เน็ต\n3. อัพเดทแอปเป็นเวอร์ชันล่าสุด\n4. เคลียร์แคชแอป\n5. รีสตาร์ทโทรศัพท์',
      category: 'technical',
      keywords: ['ช้า', 'slow', 'lag', 'ค้าง', 'แอป', 'app']
    }
  };
  
  /**
   * Search FAQ
   */
  static searchFAQ(query, language = 'th') {
    const normalizedQuery = query.toLowerCase();
    const results = [];
    
    for (const [id, faq] of Object.entries(this.faqDatabase)) {
      // Check keywords match
      const keywordMatch = faq.keywords.some(keyword => 
        normalizedQuery.includes(keyword.toLowerCase())
      );
      
      // Check question content match
      const questionMatch = faq.question.toLowerCase().includes(normalizedQuery);
      
      if (keywordMatch || questionMatch) {
        results.push({
          id,
          ...faq,
          relevance: keywordMatch ? 1 : 0.5
        });
      }
    }
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results.slice(0, 5); // Return top 5 results
  }
  
  /**
   * Get FAQ by category
   */
  static getFAQByCategory(category) {
    return Object.entries(this.faqDatabase)
      .filter(([id, faq]) => faq.category === category)
      .map(([id, faq]) => ({ id, ...faq }));
  }
  
  /**
   * Process user query with NLP-like matching
   */
  static async processQuery(query, userId) {
    try {
      // Log query for analytics
      await logUserActivity(userId, {
        action: 'faq_query',
        query,
        timestamp: new Date().toISOString()
      });
      
      // Search FAQ
      const results = this.searchFAQ(query);
      
      if (results.length === 0) {
        return {
          type: 'NO_MATCH',
          message: 'ไม่พบคำตอบที่ตรงกับคำถามของคุณ กรุณาติดต่อฝ่ายสนับสนุนหรือลองใช้คำค้นหาอื่น',
          suggestions: [
            'ติดต่อฝ่ายสนับสนุน',
            'ดูคำถามยอดนิยม',
            'ค้นหาใหม่'
          ]
        };
      }
      
      return {
        type: 'FAQ_RESULTS',
        results,
        message: results.length === 1 ? 
          'พบคำตอบที่ตรงกับคำถามของคุณ:' : 
          `พบ ${results.length} คำตอบที่เกี่ยวข้อง:`
      };
      
    } catch (error) {
      console.error('Process FAQ query error:', error);
      return {
        type: 'ERROR',
        message: 'เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง'
      };
    }
  }
}

/**
 * Support handler for Telegram bot
 */
export async function handleSupport(ctx, env) {
  try {
    const userId = ctx.from.id.toString();
    
    const supportMessage = `
🆘 <b>ฝ่ายสนับสนุนลูกค้า - Customer Support</b>

📞 <b>เลือกช่องทางการติดต่อ:</b>

💬 <b>แชทสด</b> - รับคำตอบทันที
⏰ เวลาทำการ: 08:00 - 22:00 น.
🕐 เวลาตอบรับเฉลี่ย: 2-5 นาที

🎫 <b>ตั๋วสนับสนุน</b> - สำหรับปัญหาซับซ้อน
📝 ได้รับการติดตาม 24/7
⏱️ ตอบกลับภายใน 1-4 ชั่วโมง

🤖 <b>FAQ อัตโนมัติ</b> - ค้นหาคำตอบด่วน
⚡ ตอบทันที 24/7
📚 คำถามยอดนิยม + การค้นหา

📧 <b>อีเมล</b> - support@doglc-wallet.com
☎️ <b>โทรศัพท์</b> - 02-XXX-XXXX

🌐 <b>ภาษาที่รองรับ:</b>
🇹🇭 ไทย | 🇺🇸 English | 🇨🇳 中文 | 🇰🇷 한국어 | 🇮🇩 Indonesia | 🇰🇭 ខ្មែរ
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💬 เริ่มแชทสด', callback_data: 'start_live_chat' },
          { text: '🎫 สร้างตั๋วสนับสนุน', callback_data: 'create_support_ticket' }
        ],
        [
          { text: '🤖 FAQ อัตโนมัติ', callback_data: 'faq_bot' },
          { text: '📚 คำถามยอดนิยม', callback_data: 'popular_faq' }
        ],
        [
          { text: '📋 ตั๋วของฉัน', callback_data: 'my_tickets' },
          { text: '💬 แชทของฉัน', callback_data: 'my_chats' }
        ],
        [
          { text: '📞 ข้อมูลติดต่อ', callback_data: 'contact_info' },
          { text: '🔙 กลับเมนูหลัก', callback_data: 'main_menu' }
        ]
      ]
    };

    await ctx.reply(supportMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

    await logUserActivity(userId, {
      action: 'support_menu_accessed',
      timestamp: new Date().toISOString()
    }, env);

  } catch (error) {
    console.error('Support handler error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในการเข้าถึงฝ่ายสนับสนุน');
  }
}

export default {
  SUPPORT_CONFIG,
  SupportTicketSystem,
  LiveChatSystem,
  FAQBotSystem,
  handleSupport
};