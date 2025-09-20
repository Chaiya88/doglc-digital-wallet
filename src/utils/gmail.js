/**
 * Gmail API Integration for Banking Notifications
 * Processes bank email notifications and automatic transaction confirmations
 */

export class GmailBankingIntegration {
  constructor(env) {
    this.env = env;
    this.supportedBanks = this.initializeBankPatterns();
  }

  /**
   * Verify Gmail webhook signature
   */
  async verifyWebhookSignature(request) {
    try {
      const signature = request.headers.get('x-goog-resource-state');
      const timestamp = request.headers.get('x-goog-resource-id');
      const body = await request.text();

      if (!signature || !timestamp) {
        return { valid: false, error: 'Missing signature headers' };
      }

      // Verify webhook authenticity with Google's signature
      const expectedSignature = await this.calculateWebhookSignature(body, timestamp);
      
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      return { valid: true };
      
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return { valid: false, error: 'Verification failed' };
    }
  }

  /**
   * Process bank email notification
   */
  async processBankEmail(emailData) {
    try {
      // Extract and clean email content
      const emailContent = await this.extractEmailContent(emailData);
      
      // Identify which bank sent the email
      const bankInfo = await this.identifyBank(emailContent);
      
      if (!bankInfo.identified) {
        await this.logEmailProcessing(emailData.id, {
          status: 'bank_not_identified',
          sender: emailContent.sender,
          subject: emailContent.subject
        });
        return { processed: false, reason: 'Bank not identified' };
      }

      // Extract transaction information
      const transactionInfo = await this.extractTransactionInfo(emailContent);
      
      if (!transactionInfo.valid) {
        await this.logEmailProcessing(emailData.id, {
          status: 'transaction_info_invalid',
          bank: bankInfo.bank_name,
          reason: transactionInfo.error
        });
        return { processed: false, reason: 'Invalid transaction info' };
      }

      // Find matching deposit request
      const matchingDeposit = await this.findMatchingDeposit(transactionInfo);
      
      if (!matchingDeposit) {
        await this.logEmailProcessing(emailData.id, {
          status: 'no_matching_deposit',
          transaction_info: transactionInfo,
          bank: bankInfo.bank_name
        });
        return { processed: false, reason: 'No matching deposit found' };
      }

      // Process automatic confirmation
      const confirmationResult = await this.processAutomaticConfirmation(
        matchingDeposit,
        transactionInfo,
        emailContent
      );

      await this.logEmailProcessing(emailData.id, {
        status: 'processed',
        bank: bankInfo.bank_name,
        deposit_id: matchingDeposit.id,
        transaction_info: transactionInfo,
        confirmation_result: confirmationResult
      });

      return {
        processed: true,
        deposit_id: matchingDeposit.id,
        confirmation_result: confirmationResult
      };

    } catch (error) {
      console.error('Bank email processing error:', error);
      
      await this.logEmailProcessing(emailData.id, {
        status: 'error',
        error: error.message,
        stack: error.stack
      });
      
      return { processed: false, error: error.message };
    }
  }

  /**
   * Extract and clean email content
   */
  async extractEmailContent(emailData) {
    // Handle different email formats
    let bodyText = '';
    
    if (emailData.payload?.parts) {
      // Multi-part email
      for (const part of emailData.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          bodyText += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          const htmlContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
          bodyText += this.htmlToText(htmlContent);
        }
      }
    } else if (emailData.payload?.body?.data) {
      // Single part email
      bodyText = Buffer.from(emailData.payload.body.data, 'base64').toString('utf-8');
    }

    return {
      id: emailData.id,
      sender: this.getHeaderValue(emailData.payload.headers, 'From'),
      subject: this.getHeaderValue(emailData.payload.headers, 'Subject'),
      date: this.getHeaderValue(emailData.payload.headers, 'Date'),
      body: this.cleanText(bodyText),
      timestamp: new Date(parseInt(emailData.internalDate))
    };
  }

  /**
   * Identify bank from email sender and content
   */
  async identifyBank(emailContent) {
    const bankPatterns = {
      kasikorn: {
        name: 'Kasikorn Bank',
        email_domains: ['kasikornbank.com', 'kbank.co.th'],
        content_keywords: ['กสิกรไทย', 'kasikorn', 'kbank', 'k-mobile'],
        subject_keywords: ['แจ้งรายการ', 'transaction', 'transfer']
      },
      scb: {
        name: 'Siam Commercial Bank',
        email_domains: ['scb.co.th', 'scbeasy.com'],
        content_keywords: ['ไทยพาณิชย์', 'scb', 'siam commercial'],
        subject_keywords: ['แจ้งรายการ', 'transaction', 'scb easy']
      },
      bangkok: {
        name: 'Bangkok Bank',
        email_domains: ['bangkokbank.com', 'bbl.co.th'],
        content_keywords: ['กรุงเทพ', 'bangkok bank', 'bbl'],
        subject_keywords: ['แจ้งรายการ', 'transaction', 'mobile banking']
      },
      krungthai: {
        name: 'Krung Thai Bank',
        email_domains: ['ktb.co.th', 'krungthai.com'],
        content_keywords: ['กรุงไทย', 'krung thai', 'ktb'],
        subject_keywords: ['แจ้งรายการ', 'transaction', 'krungthai next']
      },
      tmb: {
        name: 'TMB Thanachart Bank',
        email_domains: ['tmbbank.com', 'thanachart.co.th'],
        content_keywords: ['ทหารไทย', 'ธนชาต', 'tmb', 'thanachart'],
        subject_keywords: ['แจ้งรายการ', 'transaction', 'all free']
      }
    };

    const sender = emailContent.sender.toLowerCase();
    const subject = emailContent.subject.toLowerCase();
    const body = emailContent.body.toLowerCase();

    for (const [bankCode, bankInfo] of Object.entries(bankPatterns)) {
      // Check email domain
      const domainMatch = bankInfo.email_domains.some(domain => 
        sender.includes(domain)
      );

      // Check content keywords
      const contentMatch = bankInfo.content_keywords.some(keyword =>
        body.includes(keyword.toLowerCase()) || subject.includes(keyword.toLowerCase())
      );

      // Check subject keywords
      const subjectMatch = bankInfo.subject_keywords.some(keyword =>
        subject.includes(keyword.toLowerCase())
      );

      if (domainMatch || (contentMatch && subjectMatch)) {
        return {
          identified: true,
          bank_code: bankCode,
          bank_name: bankInfo.name,
          confidence: domainMatch ? 0.9 : (contentMatch && subjectMatch ? 0.7 : 0.5)
        };
      }
    }

    return { identified: false };
  }

  /**
   * Extract transaction information from email
   */
  async extractTransactionInfo(emailContent) {
    const body = emailContent.body;
    const result = {
      valid: false,
      amount: null,
      account_number: null,
      transaction_date: null,
      transaction_time: null,
      reference_number: null,
      transaction_type: null
    };

    try {
      // Extract amount
      result.amount = this.extractAmountFromEmail(body);
      
      // Extract account number
      result.account_number = this.extractAccountFromEmail(body);
      
      // Extract date and time
      const dateTime = this.extractDateFromEmail(body);
      result.transaction_date = dateTime.date;
      result.transaction_time = dateTime.time;
      
      // Extract reference/transaction ID
      result.reference_number = this.extractTransactionIdFromEmail(body);
      
      // Identify transaction type
      result.transaction_type = this.identifyTransactionType(body);

      // Validate required fields
      result.valid = !!(result.amount && result.account_number && result.transaction_date);

      if (!result.valid) {
        return {
          ...result,
          error: 'Missing required transaction information'
        };
      }

      return result;

    } catch (error) {
      return {
        ...result,
        error: `Transaction extraction failed: ${error.message}`
      };
    }
  }

  /**
   * Find matching deposit request
   */
  async findMatchingDeposit(transactionInfo) {
    if (!this.env.DEPOSIT_REQUESTS_KV) return null;

    try {
      // Search for pending deposits with matching criteria
      const searchKey = `pending_deposits_${transactionInfo.account_number}`;
      const pendingDepositsData = await this.env.DEPOSIT_REQUESTS_KV.get(searchKey);
      
      if (!pendingDepositsData) return null;
      
      const pendingDeposits = JSON.parse(pendingDepositsData);
      
      // Find matching deposit by amount and timing
      const amountTolerance = 0.01; // 1 cent tolerance
      const timeTolerance = 60 * 60 * 1000; // 1 hour tolerance
      
      for (const deposit of pendingDeposits) {
        // Check amount match
        const amountMatch = Math.abs(deposit.amount - transactionInfo.amount) <= amountTolerance;
        
        // Check timing (transaction should be after deposit request)
        const depositTime = new Date(deposit.created_at).getTime();
        const transactionTime = new Date(transactionInfo.transaction_date).getTime();
        const timingMatch = transactionTime >= depositTime && 
                          (transactionTime - depositTime) <= timeTolerance;
        
        if (amountMatch && timingMatch) {
          return deposit;
        }
      }

      return null;

    } catch (error) {
      console.error('Error finding matching deposit:', error);
      return null;
    }
  }

  /**
   * Process automatic confirmation
   */
  async processAutomaticConfirmation(deposit, transactionInfo, emailContent) {
    try {
      // Update deposit status to confirmed
      const confirmationData = {
        deposit_id: deposit.id,
        user_id: deposit.user_id,
        amount: transactionInfo.amount,
        confirmed_at: new Date().toISOString(),
        confirmation_method: 'gmail_webhook',
        bank_transaction_id: transactionInfo.reference_number,
        email_id: emailContent.id,
        auto_confirmed: true
      };

      // Store confirmation in KV
      if (this.env.CONFIRMED_DEPOSITS_KV) {
        await this.env.CONFIRMED_DEPOSITS_KV.put(
          `confirmed_${deposit.id}`,
          JSON.stringify(confirmationData),
          { expirationTtl: 86400 * 30 } // Keep for 30 days
        );
      }

      // Update user balance (this would typically call the banking worker)
      await this.updateUserBalance(deposit.user_id, transactionInfo.amount);

      // Send notification to user
      await this.sendConfirmationNotification(deposit.user_id, confirmationData);

      return {
        success: true,
        confirmation_id: `conf_${Date.now()}`,
        amount: transactionInfo.amount,
        method: 'auto_gmail'
      };

    } catch (error) {
      console.error('Auto confirmation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Helper methods for email processing
   */
  cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  extractAmountFromEmail(text) {
    const amountPatterns = [
      /จำนวนเงิน[:\s]*([0-9,]+\.?\d*)[:\s]*บาท/i,
      /amount[:\s]*([0-9,]+\.?\d*)/i,
      /(\d{1,3}(?:,\d{3})*\.\d{2})[:\s]*(?:บาท|baht|thb)/i,
      /THB[:\s]*([0-9,]+\.?\d*)/i
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }

    return null;
  }

  extractAccountFromEmail(text) {
    const accountPatterns = [
      /บัญชี[:\s]*([0-9\-\s]{8,20})/i,
      /account[:\s]*([0-9\-\s]{8,20})/i,
      /(\d{3}-?\d{1}-?\d{5}-?\d{1})/g,
      /(\d{10,15})/g
    ];

    for (const pattern of accountPatterns) {
      const match = text.match(pattern);
      if (match) {
        const account = match[1].replace(/[\s-]/g, '');
        if (account.length >= 8) {
          return account;
        }
      }
    }

    return null;
  }

  extractDateFromEmail(text) {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})[:\s]*(\d{1,2}:\d{2}(?::\d{2})?)/,
      /(\d{4}-\d{1,2}-\d{1,2})[:\s]*(\d{1,2}:\d{2}(?::\d{2})?)/,
      /(\d{1,2}-\d{1,2}-\d{4})[:\s]*(\d{1,2}:\d{2}(?::\d{2})?)/
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          date: match[1],
          time: match[2]
        };
      }
    }

    return { date: null, time: null };
  }

  extractTransactionIdFromEmail(text) {
    const refPatterns = [
      /อ้างอิง[:\s]*([A-Z0-9]+)/i,
      /ref[:\s]*([A-Z0-9]+)/i,
      /transaction[:\s]*id[:\s]*([A-Z0-9]+)/i,
      /txn[:\s]*([A-Z0-9]+)/i
    ];

    for (const pattern of refPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  identifyTransactionType(text) {
    if (text.includes('โอนเข้า') || text.includes('received') || text.includes('credit')) {
      return 'credit';
    }
    if (text.includes('โอนออก') || text.includes('sent') || text.includes('debit')) {
      return 'debit';
    }
    return 'unknown';
  }

  htmlToText(html) {
    // Basic HTML to text conversion
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getHeaderValue(headers, name) {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  }

  async calculateWebhookSignature(body, timestamp) {
    // Implementation would depend on Google's webhook signature algorithm
    // This is a placeholder implementation
    const encoder = new TextEncoder();
    const data = encoder.encode(body + timestamp + this.env.GMAIL_WEBHOOK_SECRET);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async updateUserBalance(userId, amount) {
    // This would typically call the banking worker API
    if (this.env.BANKING_WORKER_URL) {
      try {
        await fetch(`${this.env.BANKING_WORKER_URL}/fiat/deposit/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-API': this.env.INTERNAL_API_KEY
          },
          body: JSON.stringify({
            user_id: userId,
            amount: amount,
            confirmation_method: 'gmail_webhook'
          })
        });
      } catch (error) {
        console.error('Error updating user balance:', error);
      }
    }
  }

  async sendConfirmationNotification(userId, confirmationData) {
    // Send notification via Telegram bot
    if (this.env.TELEGRAM_BOT_TOKEN) {
      try {
        await fetch(`https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: userId,
            text: `✅ ยืนยันการฝากเงินอัตโนมัติ!\n\n💰 จำนวน: ${confirmationData.amount} บาท\n🏦 ยืนยันผ่าน: Gmail\n⏰ เวลา: ${new Date(confirmationData.confirmed_at).toLocaleString('th-TH')}`,
            parse_mode: 'HTML'
          })
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }

  async logEmailProcessing(emailId, data) {
    if (!this.env.GMAIL_LOG_KV) return;

    const logEntry = {
      email_id: emailId,
      timestamp: new Date().toISOString(),
      ...data
    };

    const key = `gmail_processing_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    try {
      await this.env.GMAIL_LOG_KV.put(key, JSON.stringify(logEntry), {
        expirationTtl: 86400 * 30 // Keep for 30 days
      });
    } catch (error) {
      console.error('Failed to log Gmail processing:', error);
    }
  }

  initializeBankPatterns() {
    return {
      kasikorn: ['กสิกรไทย', 'kasikorn', 'kbank'],
      scb: ['ไทยพาณิชย์', 'scb', 'siam commercial'],
      bangkok: ['กรุงเทพ', 'bangkok bank', 'bbl'],
      krungthai: ['กรุงไทย', 'krung thai', 'ktb'],
      tmb: ['ทหารไทย', 'tmb', 'thanachart']
    };
  }
}

/**
 * Export convenience function for handling Gmail webhooks
 */
export async function handleGmailWebhook(request, env) {
  const integration = new GmailBankingIntegration(env);
  
  // Verify webhook signature
  const signatureVerification = await integration.verifyWebhookSignature(request);
  if (!signatureVerification.valid) {
    return Response.json({
      error: 'Invalid webhook signature',
      details: signatureVerification.error
    }, { status: 401 });
  }

  try {
    const webhookData = await request.json();
    
    // Process the Gmail notification
    const result = await integration.processBankEmail(webhookData);
    
    return Response.json({
      success: true,
      processed: result.processed,
      deposit_id: result.deposit_id,
      details: result
    });

  } catch (error) {
    console.error('Gmail webhook processing error:', error);
    return Response.json({
      error: 'Webhook processing failed',
      message: error.message
    }, { status: 500 });
  }
}