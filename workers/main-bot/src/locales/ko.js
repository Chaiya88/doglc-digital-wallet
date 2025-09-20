/**
 * Korean Language Messages
 * 한국어 메시지 for DOGLC Digital Wallet Bot
 */

export const koMessages = {
  // Welcome and Main Menu
  welcomeMessage: `🏦 <b>DOGLC 디지털 지갑에 오신 것을 환영합니다</b>

안녕하세요 <b>{firstName}</b>님! 👋

🌟 <b>주요 기능:</b>
• 💰 USDT 디지털 지갑
• 🔐 고급 보안 시스템
• ⚡ 빠른 송금
• 📊 실시간 잔액 추적
• 🌐 다국어 지원

시작하려면 아래 메뉴에서 선택하세요:`,

  // Wallet Messages
  walletMain: `💰 <b>당신의 지갑</b>

💳 <b>현재 잔액:</b> {balance} {currency}
📅 <b>마지막 업데이트:</b> ${new Date().toLocaleString('ko-KR')}

원하는 작업을 선택하세요:`,

  balanceDetails: `💳 <b>잔액 상세 정보</b>

💰 <b>USDT:</b> {usdtBalance}
🇰🇷 <b>KRW:</b> {thbBalance}

📊 <b>통계:</b>
📈 오늘의 수입: +{dailyIncome} USDT
📉 오늘의 지출: -{dailyExpense} USDT

⏰ <b>마지막 업데이트:</b> {lastUpdate}`,

  sendMoneyGuide: `📤 <b>USDT 송금</b>

송금 방법을 선택하세요:

🔹 <b>전화번호로 송금:</b> 빠르고 편리
🔹 <b>사용자명으로 송금:</b> @사용자명 사용
🔹 <b>QR 코드로 송금:</b> 스캔하여 송금
🔹 <b>지갑 주소로 송금:</b> 지갑 주소

💡 <b>팁:</b> 송금 전에 받는 사람 정보를 다시 확인하세요`,

  receiveMoneyDetails: `📥 <b>USDT 받기</b>

📱 <b>당신의 정보:</b>
• 전화번호: {phoneNumber}
• 사용자명: @{username}
• 지갑 주소: <code>{address}</code>

🔗 <b>QR 코드:</b> 아래 버튼을 클릭하여 생성

💡 <b>이 정보를 송금자와 공유하세요</b>`,

  transactionHistoryHeader: `📊 <b>거래 내역</b>

최근 5개 거래:`,

  noTransactions: `아직 거래가 없습니다
디지털 지갑 사용을 시작해보세요! 💰`,

  // Help Messages
  helpMain: `❓ <b>도움말 및 지원</b>

👋 DOGLC 디지털 지갑 도움말 센터에 오신 것을 환영합니다

🔍 <b>도움이 필요한 주제를 선택하세요:</b>

📝 <b>모든 명령어</b> - 사용 가능한 명령어 목록
💰 <b>지갑 사용법</b> - 지갑 사용 방법
🔐 <b>보안</b> - 보안 팁 및 가이드라인
❓ <b>자주 묻는 질문</b> - 자주 묻는 질문

📞 <b>더 많은 도움이 필요하신가요?</b>
24시간 고객 지원팀에 문의하세요`,

  helpCommands: `📝 <b>모든 명령어</b>

🤖 <b>기본 명령어:</b>
• <code>/start</code> - 봇 사용 시작
• <code>/help</code> - 도움말 보기
• <code>/wallet</code> - 지갑 열기

💰 <b>지갑 명령어:</b>
• <code>/balance</code> - 잔액 확인
• <code>/send</code> - 송금
• <code>/receive</code> - 받기
• <code>/history</code> - 거래 내역

⚙️ <b>설정 명령어:</b>
• <code>/settings</code> - 계정 설정
• <code>/language</code> - 언어 변경
• <code>/notifications</code> - 알림 설정

💡 <b>팁:</b> 명령어를 입력하는 대신 버튼을 사용할 수 있습니다`,

  helpWallet: `💰 <b>지갑 사용 가이드</b>

🔍 <b>잔액 확인:</b>
• "💳 잔액" 탭 또는 <code>/balance</code> 사용
• USDT 및 KRW 금액 보기
• 수입/지출 통계 확인

📤 <b>송금:</b>
• 방법 선택: 전화번호, 사용자명, QR, 주소
• 금액 입력 및 확인
• 송금 성공 시 알림 받기

📥 <b>받기:</b>
• 송금자와 정보 공유
• 받기용 QR 코드 생성
• 실시간으로 돈 받기

📊 <b>거래 내역:</b>
• 모든 거래 보기
• 날짜 및 유형별 필터링
• 파일로 데이터 내보내기

💡 <b>권장사항:</b>
• 거래 전 세부사항 확인
• 거래 영수증 보관
• 문제 발생 시 지원팀 연락`,

  helpSecurity: `🔐 <b>보안 및 보호</b>

🛡️ <b>보안 조치:</b>
• 🔒 종단간 암호화
• 🔑 2단계 인증 시스템
• 📱 로그인 알림
• ⏰ 비활성 시 자동 잠금

🔐 <b>PIN 설정:</b>
• 6자리 PIN 생성
• 거래 확인에 PIN 사용
• 언제든지 PIN 변경

📷 <b>영수증 확인:</b>
• 은행 영수증 사진 촬영
• OCR 시스템 자동 확인
• 입금 전 정확성 확인

⚠️ <b>보안 팁:</b>
• PIN을 절대 공유하지 마세요
• URL 정확성 확인
• 앱을 최신 버전으로 업데이트
• 안전한 Wi-Fi 네트워크 사용

🚨 <b>문제 신고:</b>
의심스러운 활동을 발견하면 즉시 저희 팀에 연락하세요`,

  helpFAQ: `❓ <b>자주 묻는 질문</b>

💸 <b>수수료:</b>
• 송금: 0.1% (최소 1 USDT)
• KRW 입금: 무료
• USDT 출금: 2 USDT

⏱️ <b>거래 시간:</b>
• USDT에서 USDT로: 즉시
• KRW 입금: 1-5분 (영수증 확인 후)
• USDT 출금: 5-15분

🔢 <b>한도:</b>
• 일일 송금: 50,000 USDT
• 일일 받기: 무제한
• 거래당 최소 금액: 1 USDT

💱 <b>환율:</b>
• 1분마다 업데이트
• 글로벌 시장 기준
• 경쟁력 있는 스프레드

🌍 <b>지원 국가:</b>
• 태국 (완전 지원)
• 아세안 국가 (부분적)
• 웹사이트에서 자세한 정보

🔧 <b>문제 해결:</b>
• 텔레그램 앱 재시작
• 인터넷 연결 확인
• /start 명령어 다시 시도
• 문제가 지속되면 지원팀 연락`,

  helpContact: `📞 <b>문의하기</b>

🏢 <b>DOGLC 디지털 지갑 지원 센터</b>

📧 <b>이메일:</b> support@doglcdigital.com
📞 <b>핫라인:</b> +66-2-123-4567 (24/7)
💬 <b>텔레그램:</b> @doglcdigital
🌐 <b>웹사이트:</b> https://doglcdigital.com

📱 <b>소셜 미디어:</b>
• Facebook: facebook.com/doglcdigital
• Twitter: @doglcdigital
• YouTube: DOGLC Digital
• LINE: @doglcdigital

⏰ <b>운영 시간:</b>
• 핫라인: 24시간, 7일
• 이메일: 1시간 내 답변
• 채팅: 24/7 온라인

🎯 <b>지원 유형:</b>
• 기술적 문제
• 사용법 질문
• 보안 문제 신고
• 제안 및 피드백`,

  // Error Messages
  errorOccurred: `❌ 오류가 발생했습니다. 다시 시도해주세요`,
  unknownAction: `🤔 알 수 없는 명령어입니다`,
  unrecognizedMessage: `💬 메시지를 인식할 수 없습니다. 아래 메뉴를 사용해주세요`,
  processingImage: `📷 이미지 처리 중...`,
  ocrSuccess: `✅ 영수증 확인 성공!\n💰 금액: {amount}원\n🏦 은행: {bank}`,
  ocrError: `❌ 영수증을 읽을 수 없습니다. 더 선명한 사진을 찍어주세요`,

  // Currency formatting
  currency: {
    thb: 'THB',
    usdt: 'USDT',
    usd: 'USD',
    krw: 'KRW'
  }
};