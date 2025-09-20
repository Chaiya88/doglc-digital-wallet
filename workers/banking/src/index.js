/**
 * DOGLC Banking Worker - No KYC Version
 * Enhanced banking operations without KYC requirements
 * Features: Advanced account selection, OCR slip verification, real-time processing
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Health check endpoint
    if (path === '/banking/health' || path === '/health') {
      return Response.json({ 
        status: 'ok', 
        service: 'doglc-banking-worker',
        version: '2.0-no-kyc',
        features: [
          'advanced_account_selection',
          'ocr_slip_verification', 
          'gmail_webhook_integration',
          'real_time_processing',
          'vip_system',
          'no_kyc_required'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // Security validation
    const internalApiKey = request.headers.get('X-Internal-API');
    const isCron = request.headers.get('CF-Cron') === 'true';
    
    if (!isCron && internalApiKey !== env.INTERNAL_API_KEY) {
      return Response.json({
        error: 'Unauthorized',
        message: 'Invalid internal API key'
      }, { status: 401 });
    }

    try {
      // Enhanced routing system
      switch (path) {
        // Deposit Operations
        case '/fiat/deposit/initiate':
          return method === 'POST' ? await initiateDeposit(request, env) : methodNotAllowed();
        
        case '/fiat/deposit/verify-slip':
          return method === 'POST' ? await verifyDepositSlip(request, env) : methodNotAllowed();
        
        case '/fiat/deposit/confirm':
          return method === 'POST' ? await confirmDeposit(request, env) : methodNotAllowed();

        // Withdrawal Operations  
        case '/crypto/withdraw/initiate':
          return method === 'POST' ? await initiateWithdrawal(request, env) : methodNotAllowed();
        
        case '/crypto/withdraw/process':
          return method === 'POST' ? await processWithdrawal(request, env) : methodNotAllowed();

        // Account Management
        case '/accounts/select-optimal':
          return method === 'POST' ? await selectOptimalAccount(request, env) : methodNotAllowed();
        
        case '/accounts/status':
          return method === 'GET' ? await getAccountsStatus(request, env) : methodNotAllowed();

        // VIP System
        case '/vip/upgrade':
          return method === 'POST' ? await upgradeVipLevel(request, env) : methodNotAllowed();
        
        case '/vip/levels':
          return method === 'GET' ? await getVipLevels(request, env) : methodNotAllowed();

        // Webhooks & Notifications
        case '/webhook/gmail':
          return method === 'POST' ? await handleGmailWebhook(request, env) : methodNotAllowed();
        
        case '/webhook/bank-notification':
          return method === 'POST' ? await handleBankNotification(request, env) : methodNotAllowed();

        // Analytics
        case '/analytics/performance':
          return method === 'GET' ? await getPerformanceAnalytics(request, env) : methodNotAllowed();
        
        case '/analytics/accounts':
          return method === 'GET' ? await getAccountAnalytics(request, env) : methodNotAllowed();

        default:
          return Response.json({
            error: 'Not Found',
            message: 'Banking endpoint not found',
            available_endpoints: [
              '/fiat/deposit/initiate',
              '/fiat/deposit/verify-slip', 
              '/fiat/deposit/confirm',
              '/crypto/withdraw/initiate',
              '/crypto/withdraw/process',
              '/accounts/select-optimal',
              '/accounts/status',
              '/vip/upgrade',
              '/vip/levels',
              '/analytics/performance',
              '/analytics/accounts'
            ]
          }, { status: 404 });
      }
    } catch (error) {
      console.error('Banking worker error:', error);
      return Response.json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  }
};

// ===========================
// DEPOSIT OPERATIONS
// ===========================

async function initiateDeposit(request, env) {
  const data = await request.json();
  const { user_id, amount, currency = 'THB' } = data;

  if (!user_id || !amount || amount < 100) {
    return Response.json({
      error: 'Invalid Request',
      message: 'user_id and amount (min 100 THB) are required'
    }, { status: 400 });
  }

  try {
    // Get user info (no KYC check needed)
    const user = await env.MAIN_WALLET_DB.prepare(`
      SELECT id, telegram_id, vip_level, account_status 
      FROM users 
      WHERE id = ? AND account_status = 'active'
    `).bind(user_id).first();

    if (!user) {
      return Response.json({
        error: 'User Not Found',
        message: 'User not found or account inactive'
      }, { status: 404 });
    }

    // Select optimal bank account using advanced algorithm
    const selectedAccount = await selectOptimalBankAccount(env, amount, user.vip_level);
    
    if (!selectedAccount) {
      return Response.json({
        error: 'No Available Account',
        message: 'No bank account available for this amount at the moment'
      }, { status: 503 });
    }

    // Generate deposit request
    const depositId = generateId('DEP');
    const reference = generateDepositReference();
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Calculate fees based on VIP level
    const vipBenefits = await getVipBenefits(user.vip_level, env);
    const baseFee = amount * 0.02; // 2% base fee
    const fee = baseFee * (1 - vipBenefits.deposit_fee_discount);
    const netAmount = amount - fee;

    // Create deposit request in database
    await env.MAIN_WALLET_DB.prepare(`
      INSERT INTO deposit_requests (
        id, user_id, amount, currency, assigned_bank_account_id,
        payment_reference, expiry_timestamp, status, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      depositId,
      user_id,
      amount,
      currency,
      selectedAccount.id,
      reference,
      expiry.toISOString(),
      JSON.stringify({
        fee_amount: fee,
        net_amount: netAmount,
        vip_level: user.vip_level,
        vip_discount: vipBenefits.deposit_fee_discount
      })
    ).run();

    // Update account utilization
    await updateAccountUtilization(env, selectedAccount.id, amount);

    return Response.json({
      success: true,
      deposit_id: depositId,
      bank_account: {
        bank_name: selectedAccount.bank_name,
        account_number: selectedAccount.account_number,
        account_name: selectedAccount.account_name
      },
      payment_details: {
        amount: amount,
        fee: fee,
        net_amount: netAmount,
        currency: currency,
        reference: reference,
        expires_at: expiry.toISOString()
      },
      instructions: [
        `โอนเงิน ${amount.toLocaleString()} บาท`,
        `ไปยังบัญชี: ${selectedAccount.account_number}`,
        `ชื่อบัญชี: ${selectedAccount.account_name}`,
        `ธนาคาร: ${selectedAccount.bank_name}`,
        `อ้างอิง: ${reference}`,
        `หมดอายุ: ${expiry.toLocaleString('th-TH')}`
      ]
    });

  } catch (error) {
    console.error('Deposit initiation error:', error);
    return Response.json({
      error: 'Processing Error',
      message: 'Failed to initiate deposit'
    }, { status: 500 });
  }
}

async function verifyDepositSlip(request, env) {
  const data = await request.json();
  const { deposit_id, slip_image_url } = data;

  if (!deposit_id || !slip_image_url) {
    return Response.json({
      error: 'Invalid Request',
      message: 'deposit_id and slip_image_url are required'
    }, { status: 400 });
  }

  try {
    // Get deposit request
    const depositRequest = await env.MAIN_WALLET_DB.prepare(`
      SELECT dr.*, ba.bank_name, ba.account_number
      FROM deposit_requests dr
      JOIN bank_accounts ba ON dr.assigned_bank_account_id = ba.id
      WHERE dr.id = ? AND dr.status = 'pending'
    `).bind(deposit_id).first();

    if (!depositRequest) {
      return Response.json({
        error: 'Deposit Not Found',
        message: 'Deposit request not found or already processed'
      }, { status: 404 });
    }

    // Check if expired
    if (new Date() > new Date(depositRequest.expiry_timestamp)) {
      await env.MAIN_WALLET_DB.prepare(`
        UPDATE deposit_requests 
        SET status = 'expired', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(deposit_id).run();

      return Response.json({
        error: 'Deposit Expired',
        message: 'Deposit request has expired'
      }, { status: 410 });
    }

    // Process OCR slip verification
    const ocrResult = await processSlipOCR(slip_image_url, env);
    
    if (!ocrResult.success) {
      return Response.json({
        error: 'OCR Processing Failed',
        message: 'Could not process slip image',
        details: ocrResult.error
      }, { status: 400 });
    }

    // Verify slip details match deposit request
    const verification = {
      amount_match: Math.abs(ocrResult.amount - depositRequest.amount) < 1,
      account_match: ocrResult.account_number === depositRequest.account_number,
      reference_match: ocrResult.reference === depositRequest.payment_reference
    };

    const isVerified = verification.amount_match && verification.account_match;

    // Update deposit request with verification result
    await env.MAIN_WALLET_DB.prepare(`
      UPDATE deposit_requests 
      SET slip_image_url = ?, 
          verification_result = ?,
          ocr_data = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      slip_image_url,
      JSON.stringify(verification),
      JSON.stringify(ocrResult),
      isVerified ? 'verified' : 'verification_failed',
      deposit_id
    ).run();

    return Response.json({
      success: true,
      verified: isVerified,
      verification_details: verification,
      ocr_result: ocrResult,
      next_step: isVerified ? 'auto_process' : 'manual_review'
    });

  } catch (error) {
    console.error('Slip verification error:', error);
    return Response.json({
      error: 'Verification Error',
      message: 'Failed to verify slip'
    }, { status: 500 });
  }
}

async function confirmDeposit(request, env) {
  const data = await request.json();
  const { deposit_id, confirmation_method = 'manual' } = data;

  try {
    // Get deposit request
    const depositRequest = await env.MAIN_WALLET_DB.prepare(`
      SELECT * FROM deposit_requests WHERE id = ? AND status IN ('verified', 'pending')
    `).bind(deposit_id).first();

    if (!depositRequest) {
      return Response.json({
        error: 'Deposit Not Found',
        message: 'Deposit request not found or cannot be confirmed'
      }, { status: 404 });
    }

    // Parse metadata
    const metadata = JSON.parse(depositRequest.metadata_json || '{}');
    
    // Calculate DOGLC amount
    const exchangeRate = await getCurrentExchangeRate('THB', 'DOGLC', env);
    const doglcAmount = metadata.net_amount / exchangeRate;

    // Start transaction
    await env.MAIN_WALLET_DB.prepare('BEGIN TRANSACTION').run();

    try {
      // Update user balance
      await env.MAIN_WALLET_DB.prepare(`
        INSERT INTO user_balances (user_id, currency, balance, updated_at)
        VALUES (?, 'DOGLC', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, currency) DO UPDATE SET
          balance = balance + ?,
          updated_at = CURRENT_TIMESTAMP
      `).bind(depositRequest.user_id, doglcAmount, doglcAmount).run();

      // Record transaction
      const transactionId = generateId('TXN');
      await env.MAIN_WALLET_DB.prepare(`
        INSERT INTO transactions (
          id, user_id, type, amount, currency, 
          related_deposit_id, status, metadata_json, created_at
        ) VALUES (?, ?, 'deposit', ?, 'DOGLC', ?, 'completed', ?, CURRENT_TIMESTAMP)
      `).bind(
        transactionId,
        depositRequest.user_id,
        doglcAmount,
        deposit_id,
        JSON.stringify({
          thb_amount: depositRequest.amount,
          exchange_rate: exchangeRate,
          fee_amount: metadata.fee_amount,
          vip_level: metadata.vip_level,
          confirmation_method: confirmation_method
        })
      ).run();

      // Update deposit request status
      await env.MAIN_WALLET_DB.prepare(`
        UPDATE deposit_requests 
        SET status = 'completed', 
            processed_at = CURRENT_TIMESTAMP,
            transaction_id = ?
        WHERE id = ?
      `).bind(transactionId, deposit_id).run();

      // Update user statistics
      await env.MAIN_WALLET_DB.prepare(`
        UPDATE users 
        SET total_deposits = total_deposits + ?,
            total_volume = total_volume + ?,
            last_activity = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(depositRequest.amount, depositRequest.amount, depositRequest.user_id).run();

      // Check for VIP upgrade
      const vipUpgrade = await checkVipUpgrade(depositRequest.user_id, env);

      await env.MAIN_WALLET_DB.prepare('COMMIT').run();

      return Response.json({
        success: true,
        transaction_id: transactionId,
        doglc_received: doglcAmount,
        exchange_rate: exchangeRate,
        vip_upgrade: vipUpgrade,
        confirmation_method: confirmation_method
      });

    } catch (dbError) {
      await env.MAIN_WALLET_DB.prepare('ROLLBACK').run();
      throw dbError;
    }

  } catch (error) {
    console.error('Deposit confirmation error:', error);
    return Response.json({
      error: 'Confirmation Error', 
      message: 'Failed to confirm deposit'
    }, { status: 500 });
  }
}

// ===========================
// ACCOUNT SELECTION ALGORITHM
// ===========================

async function selectOptimalBankAccount(env, amount, userVipLevel = 'BRONZE') {
  try {
    // Get available bank accounts
    const accounts = await env.MAIN_WALLET_DB.prepare(`
      SELECT ba.*, b.name as bank_name, b.bank_code,
             COALESCE(bau.total_amount, 0) as current_daily_total
      FROM bank_accounts ba
      JOIN banks b ON ba.bank_id = b.id
      LEFT JOIN bank_account_utilization bau ON ba.id = bau.bank_account_id
        AND bau.date = date('now')
      WHERE ba.status = 'active'
        AND ba.auto_switch_enabled = 1
        AND (ba.daily_limit - COALESCE(bau.total_amount, 0)) >= ?
      ORDER BY ba.priority DESC, ba.reliability_score DESC
    `).bind(amount).all();

    if (!accounts.results || accounts.results.length === 0) {
      return null;
    }

    // Advanced scoring algorithm
    const scoredAccounts = [];
    
    for (const account of accounts.results) {
      let score = 100; // Base score

      // Capacity factor (30% weight)
      const remainingCapacity = account.daily_limit - account.current_daily_total;
      const capacityRatio = remainingCapacity / account.daily_limit;
      score += capacityRatio * 30;

      // Priority factor (25% weight)
      score += (account.priority || 0) * 25;

      // Reliability factor (20% weight)
      score += (account.reliability_score || 0.8) * 20;

      // VIP bonus (10% weight)
      if (userVipLevel !== 'BRONZE') {
        score += 10;
      }

      // Recent usage penalty (avoid overused accounts)
      const utilizationRatio = account.current_daily_total / account.daily_limit;
      if (utilizationRatio > 0.8) {
        score -= 15; // Heavy penalty for high utilization
      } else if (utilizationRatio > 0.6) {
        score -= 5; // Light penalty for medium utilization
      }

      // SCB Bank penalty (avoid SCB unless emergency)
      const bankName = (account.bank_name || '').toLowerCase();
      const bankCode = (account.bank_code || '').toUpperCase();
      if (bankName.includes('scb') || bankName.includes('siam commercial') || bankCode === 'SCB') {
        score -= 40; // Heavy penalty for SCB
      }

      scoredAccounts.push({
        ...account,
        selection_score: score,
        capacity_utilization: utilizationRatio
      });
    }

    // Sort by score (highest first)
    scoredAccounts.sort((a, b) => b.selection_score - a.selection_score);

    // Return the best account
    return scoredAccounts[0];

  } catch (error) {
    console.error('Account selection error:', error);
    return null;
  }
}

// ===========================
// OCR SLIP PROCESSING
// ===========================

async function processSlipOCR(imageUrl, env) {
  try {
    // Call OCR service
    const ocrResponse = await fetch(env.OCR_API_ENDPOINT || 'https://api.ocr-service.com/v1/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OCR_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: imageUrl,
        extract_fields: ['amount', 'account_number', 'reference', 'timestamp', 'bank_name']
      })
    });

    if (!ocrResponse.ok) {
      throw new Error(`OCR API error: ${ocrResponse.status}`);
    }

    const ocrData = await ocrResponse.json();

    return {
      success: true,
      amount: parseFloat(ocrData.amount || 0),
      account_number: ocrData.account_number || '',
      reference: ocrData.reference || '',
      timestamp: ocrData.timestamp || '',
      bank_name: ocrData.bank_name || '',
      confidence: ocrData.confidence || 0,
      raw_data: ocrData
    };

  } catch (error) {
    console.error('OCR processing error:', error);
    return {
      success: false,
      error: error.message,
      amount: 0,
      account_number: '',
      reference: '',
      confidence: 0
    };
  }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

async function updateAccountUtilization(env, accountId, amount) {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const hour = now.getHours();

  await env.MAIN_WALLET_DB.prepare(`
    INSERT INTO bank_account_utilization (
      id, bank_account_id, date, hour, transaction_count, total_amount
    ) VALUES (?, ?, ?, ?, 1, ?)
    ON CONFLICT(bank_account_id, date, hour) DO UPDATE SET
      transaction_count = transaction_count + 1,
      total_amount = total_amount + ?,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    generateId('UTL'),
    accountId,
    date,
    hour,
    amount,
    amount
  ).run();

  // Update daily total
  await env.MAIN_WALLET_DB.prepare(`
    UPDATE bank_accounts 
    SET current_daily_total = current_daily_total + ?,
        last_used_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(amount, accountId).run();
}

async function getVipBenefits(vipLevel, env) {
  const benefits = await env.MAIN_WALLET_DB.prepare(`
    SELECT * FROM user_vip_levels WHERE level_name = ?
  `).bind(vipLevel).first();

  return benefits || {
    deposit_fee_discount: 0,
    withdrawal_fee_discount: 0,
    daily_limit_multiplier: 1
  };
}

async function getCurrentExchangeRate(fromCurrency, toCurrency, env) {
  const rate = await env.MAIN_WALLET_DB.prepare(`
    SELECT rate FROM exchange_rates 
    WHERE from_currency = ? AND to_currency = ? 
      AND status = 'active' 
      AND (valid_until IS NULL OR datetime(valid_until) > datetime('now'))
    ORDER BY valid_from DESC LIMIT 1
  `).bind(fromCurrency, toCurrency).first();

  return rate?.rate || 36.36; // Default USDT rate
}

async function checkVipUpgrade(userId, env) {
  const user = await env.MAIN_WALLET_DB.prepare(`
    SELECT total_volume, vip_level FROM users WHERE id = ?
  `).bind(userId).first();

  if (!user) return null;

  const eligibleLevel = await env.MAIN_WALLET_DB.prepare(`
    SELECT level_name FROM user_vip_levels 
    WHERE minimum_volume <= ? 
    ORDER BY minimum_volume DESC LIMIT 1
  `).bind(user.total_volume).first();

  if (eligibleLevel && eligibleLevel.level_name !== user.vip_level) {
    await env.MAIN_WALLET_DB.prepare(`
      UPDATE users SET vip_level = ? WHERE id = ?
    `).bind(eligibleLevel.level_name, userId).run();

    return eligibleLevel.level_name;
  }

  return null;
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateDepositReference() {
  return `DG${Date.now().toString().slice(-8)}`;
}

function methodNotAllowed() {
  return Response.json({
    error: 'Method Not Allowed',
    message: 'HTTP method not supported for this endpoint'
  }, { status: 405 });
}

// Placeholder implementations for remaining endpoints
async function initiateWithdrawal(request, env) {
  return Response.json({ message: 'Withdrawal system - Coming soon' });
}

async function processWithdrawal(request, env) {
  return Response.json({ message: 'Withdrawal processing - Coming soon' });
}

async function selectOptimalAccount(request, env) {
  const data = await request.json();
  const account = await selectOptimalBankAccount(env, data.amount, data.vip_level);
  return Response.json({ selected_account: account });
}

async function getAccountsStatus(request, env) {
  const accounts = await env.MAIN_WALLET_DB.prepare(`
    SELECT ba.*, b.name as bank_name 
    FROM bank_accounts ba 
    JOIN banks b ON ba.bank_id = b.id 
    WHERE ba.status = 'active'
  `).all();
  
  return Response.json({ accounts });
}

async function upgradeVipLevel(request, env) {
  return Response.json({ message: 'VIP upgrade - Coming soon' });
}

async function getVipLevels(request, env) {
  const levels = await env.MAIN_WALLET_DB.prepare(`
    SELECT * FROM user_vip_levels ORDER BY minimum_volume
  `).all();
  
  return Response.json({ vip_levels: levels });
}

async function handleGmailWebhook(request, env) {
  return Response.json({ message: 'Gmail webhook - Coming soon' });
}

async function handleBankNotification(request, env) {
  return Response.json({ message: 'Bank notification - Coming soon' });
}

async function getPerformanceAnalytics(request, env) {
  return Response.json({ message: 'Performance analytics - Coming soon' });
}

async function getAccountAnalytics(request, env) {
  return Response.json({ message: 'Account analytics - Coming soon' });
}