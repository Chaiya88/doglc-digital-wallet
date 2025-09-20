/**
 * Korean language messages for the bot
 */

export const messages = {
  // Welcome messages
  welcome: '🎉 Doglc Digital Wallet에 오신 것을 환영합니다!\n\n💰 안전하고 사용하기 쉬운 디지털 지갑\n\n/help를 입력하여 모든 명령을 확인하세요',
  
  // Help messages
  helpTitle: '📋 사용 가능한 명령:',
  helpCommands: `
/start - 시작하기
/wallet - 지갑 정보 보기
/balance - 잔액 확인
/send - 돈 보내기
/receive - 돈 받기
/history - 거래 내역
/help - 모든 명령 보기
  `,
  
  // Wallet messages
  walletInfo: '💳 지갑 정보',
  noWallet: '❌ 아직 지갑이 없습니다\n/create를 입력하여 새 지갑을 만드세요',
  createWallet: '✅ 지갑이 성공적으로 생성되었습니다!\n🔐 지갑 주소: {address}',
  
  // Balance messages
  currentBalance: '💰 현재 잔액: {amount} 바트',
  
  // Transaction messages
  sendMoney: '📤 돈 보내기',
  receiveMoney: '📥 돈 받기',
  transactionSuccess: '✅ 거래가 성공했습니다!',
  transactionFailed: '❌ 거래에 실패했습니다',
  
  // Error messages
  unknownCommand: '❓ 명령을 이해할 수 없습니다. /help를 입력하여 사용 가능한 명령을 확인하세요',
  errorOccurred: '⚠️ 오류가 발생했습니다. 다시 시도해 주세요',
  
  // Security messages
  securityWarning: '🔐 개인 정보나 개인 키를 절대 누구와도 공유하지 마세요!',
  
  // Loading messages
  processing: '⏳ 처리 중...',
  pleaseWait: '⏳ 잠시만 기다려 주세요...'
};