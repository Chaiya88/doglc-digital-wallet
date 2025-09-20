/**
 * Indonesian language messages for the bot
 */

export const messages = {
  // Welcome messages
  welcome: '🎉 Selamat datang di Doglc Digital Wallet!\n\n💰 Dompet digital yang aman dan mudah digunakan\n\nKetik /help untuk melihat semua perintah',
  
  // Help messages
  helpTitle: '📋 Perintah yang tersedia:',
  helpCommands: `
/start - Mulai menggunakan
/wallet - Lihat informasi dompet
/balance - Cek saldo
/send - Kirim uang
/receive - Terima uang
/history - Riwayat transaksi
/help - Lihat semua perintah
  `,
  
  // Wallet messages
  walletInfo: '💳 Informasi dompet Anda',
  noWallet: '❌ Anda belum memiliki dompet\nKetik /create untuk membuat dompet baru',
  createWallet: '✅ Dompet berhasil dibuat!\n🔐 Alamat dompet: {address}',
  
  // Balance messages
  currentBalance: '💰 Saldo saat ini: {amount} Baht',
  
  // Transaction messages
  sendMoney: '📤 Kirim uang',
  receiveMoney: '📥 Terima uang',
  transactionSuccess: '✅ Transaksi berhasil!',
  transactionFailed: '❌ Transaksi gagal',
  
  // Error messages
  unknownCommand: '❓ Tidak memahami perintah. Ketik /help untuk melihat perintah yang tersedia',
  errorOccurred: '⚠️ Terjadi kesalahan. Silakan coba lagi',
  
  // Security messages
  securityWarning: '🔐 Jangan pernah bagikan informasi pribadi atau Private Key kepada siapa pun!',
  
  // Loading messages
  processing: '⏳ Sedang memproses...',
  pleaseWait: '⏳ Mohon tunggu sebentar...'
};