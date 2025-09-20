/**
 * Indonesian Language Messages
 * Pesan Bahasa Indonesia untuk DOGLC Digital Wallet Bot
 */

export const idMessages = {
  // Welcome and Main Menu
  welcomeMessage: `🏦 <b>Selamat datang di DOGLC Digital Wallet</b>

Halo <b>{firstName}</b>! 👋

🌟 <b>Fitur Utama:</b>
• 💰 Dompet Digital USDT
• 🔐 Sistem Keamanan Tinggi
• ⚡ Transfer Uang Cepat
• 📊 Pelacakan Saldo Real-time
• 🌐 Dukungan Multi-bahasa

Pilih dari menu di bawah untuk memulai:`,

  // Wallet Messages
  walletMain: `💰 <b>Dompet Anda</b>

💳 <b>Saldo Saat Ini:</b> {balance} {currency}
📅 <b>Terakhir Diperbarui:</b> ${new Date().toLocaleString('id-ID')}

Pilih tindakan yang diinginkan:`,

  balanceDetails: `💳 <b>Detail Saldo</b>

💰 <b>USDT:</b> {usdtBalance}
🇮🇩 <b>IDR:</b> {thbBalance}

📊 <b>Statistik:</b>
📈 Pendapatan Hari Ini: +{dailyIncome} USDT
📉 Pengeluaran Hari Ini: -{dailyExpense} USDT

⏰ <b>Terakhir Diperbarui:</b> {lastUpdate}`,

  sendMoneyGuide: `📤 <b>Kirim USDT</b>

Pilih metode pengiriman Anda:

🔹 <b>Kirim dengan Nomor Telepon:</b> Cepat & mudah
🔹 <b>Kirim dengan Username:</b> Gunakan @username
🔹 <b>Kirim dengan QR Code:</b> Scan untuk kirim
🔹 <b>Kirim dengan Alamat Dompet:</b> Alamat dompet

💡 <b>Tips:</b> Periksa kembali detail penerima sebelum mengirim`,

  receiveMoneyDetails: `📥 <b>Terima USDT</b>

📱 <b>Informasi Anda:</b>
• Telepon: {phoneNumber}
• Username: @{username}
• Alamat Dompet: <code>{address}</code>

🔗 <b>QR Code:</b> Klik tombol di bawah untuk membuat

💡 <b>Bagikan informasi ini dengan pengirim</b>`,

  transactionHistoryHeader: `📊 <b>Riwayat Transaksi</b>

5 transaksi terakhir:`,

  noTransactions: `Belum ada transaksi
Mulai gunakan dompet digital Anda! 💰`,

  // Help Messages
  helpMain: `❓ <b>Bantuan & Dukungan</b>

👋 Selamat datang di Pusat Bantuan DOGLC Digital Wallet

🔍 <b>Pilih topik untuk mendapatkan bantuan:</b>

📝 <b>Semua Perintah</b> - Daftar perintah yang tersedia
💰 <b>Penggunaan Dompet</b> - Cara menggunakan dompet
🔐 <b>Keamanan</b> - Tips keamanan dan panduan
❓ <b>FAQ</b> - Pertanyaan yang sering diajukan

📞 <b>Butuh bantuan lebih lanjut?</b>
Hubungi tim dukungan pelanggan 24/7 kami`,

  helpCommands: `📝 <b>Semua Perintah</b>

🤖 <b>Perintah Dasar:</b>
• <code>/start</code> - Mulai menggunakan bot
• <code>/help</code> - Lihat bantuan
• <code>/wallet</code> - Buka dompet

💰 <b>Perintah Dompet:</b>
• <code>/balance</code> - Cek saldo
• <code>/send</code> - Kirim uang
• <code>/receive</code> - Terima uang
• <code>/history</code> - Riwayat transaksi

⚙️ <b>Perintah Pengaturan:</b>
• <code>/settings</code> - Pengaturan akun
• <code>/language</code> - Ubah bahasa
• <code>/notifications</code> - Pengaturan notifikasi

💡 <b>Tips:</b> Anda bisa menggunakan tombol daripada mengetik perintah`,

  helpWallet: `💰 <b>Panduan Penggunaan Dompet</b>

🔍 <b>Mengecek Saldo:</b>
• Tap "💳 Saldo" atau gunakan <code>/balance</code>
• Lihat jumlah USDT dan IDR
• Periksa statistik pemasukan/pengeluaran

📤 <b>Mengirim Uang:</b>
• Pilih metode: Telepon, Username, QR, Alamat
• Masukkan jumlah dan konfirmasi
• Dapatkan notifikasi saat berhasil terkirim

📥 <b>Menerima Uang:</b>
• Bagikan informasi Anda dengan pengirim
• Buat QR Code untuk menerima
• Terima uang secara real-time

📊 <b>Riwayat Transaksi:</b>
• Lihat semua transaksi
• Filter berdasarkan tanggal dan jenis
• Ekspor data ke file

💡 <b>Rekomendasi:</b>
• Verifikasi detail sebelum transaksi
• Simpan bukti transaksi
• Hubungi dukungan jika ada masalah`,

  helpSecurity: `🔐 <b>Keamanan & Perlindungan</b>

🛡️ <b>Langkah Keamanan:</b>
• 🔒 Enkripsi End-to-End
• 🔑 Sistem Autentikasi 2FA
• 📱 Notifikasi Login
• ⏰ Kunci otomatis saat tidak aktif

🔐 <b>Mengatur PIN:</b>
• Buat PIN 6 digit
• Gunakan PIN untuk konfirmasi transaksi
• Ubah PIN kapan saja

📷 <b>Verifikasi Bukti:</b>
• Foto bukti transfer bank
• Sistem OCR verifikasi otomatis
• Konfirmasi akurasi sebelum deposit

⚠️ <b>Tips Keamanan:</b>
• Jangan bagikan PIN Anda
• Verifikasi akurasi URL
• Update aplikasi ke versi terbaru
• Gunakan jaringan Wi-Fi yang aman

🚨 <b>Laporkan Masalah:</b>
Hubungi tim kami segera jika Anda melihat aktivitas mencurigakan`,

  helpFAQ: `❓ <b>Pertanyaan yang Sering Diajukan</b>

💸 <b>Biaya:</b>
• Transfer Uang: 0.1% (minimum 1 USDT)
• Deposit IDR: Gratis
• Penarikan USDT: 2 USDT

⏱️ <b>Waktu Transaksi:</b>
• USDT ke USDT: Instan
• Deposit IDR: 1-5 menit (setelah verifikasi bukti)
• Penarikan USDT: 5-15 menit

🔢 <b>Batas:</b>
• Pengiriman Harian: 50,000 USDT
• Penerimaan Harian: Tidak terbatas
• Minimum per transaksi: 1 USDT

💱 <b>Nilai Tukar:</b>
• Diperbarui setiap 1 menit
• Berdasarkan pasar global
• Spread yang kompetitif

🌍 <b>Negara yang Didukung:</b>
• Thailand (Dukungan penuh)
• Negara ASEAN (Sebagian)
• Detail lebih lanjut di website

🔧 <b>Pemecahan Masalah:</b>
• Restart aplikasi Telegram
• Periksa koneksi internet
• Coba perintah /start lagi
• Hubungi dukungan jika masalah berlanjut`,

  helpContact: `📞 <b>Hubungi Kami</b>

🏢 <b>Pusat Dukungan DOGLC Digital Wallet</b>

📧 <b>Email:</b> support@doglcdigital.com
📞 <b>Hotline:</b> +66-2-123-4567 (24/7)
💬 <b>Telegram:</b> @doglcdigital
🌐 <b>Website:</b> https://doglcdigital.com

📱 <b>Media Sosial:</b>
• Facebook: facebook.com/doglcdigital
• Twitter: @doglcdigital
• YouTube: DOGLC Digital
• LINE: @doglcdigital

⏰ <b>Jam Operasional:</b>
• Hotline: 24 jam, 7 hari
• Email: Balasan dalam 1 jam
• Chat: Online 24/7

🎯 <b>Jenis Dukungan:</b>
• Masalah teknis
• Pertanyaan penggunaan
• Laporan masalah keamanan
• Saran dan umpan balik`,

  // Error Messages
  errorOccurred: `❌ Terjadi kesalahan. Silakan coba lagi`,
  unknownAction: `🤔 Perintah tidak dikenal`,
  unrecognizedMessage: `💬 Pesan tidak dikenal. Silakan gunakan menu di bawah`,
  processingImage: `📷 Memproses gambar...`,
  ocrSuccess: `✅ Bukti berhasil diverifikasi!\n💰 Jumlah: {amount} Rupiah\n🏦 Bank: {bank}`,
  ocrError: `❌ Tidak dapat membaca bukti. Silakan ambil foto yang lebih jelas`,

  // Currency formatting
  currency: {
    thb: 'THB',
    usdt: 'USDT',
    usd: 'USD',
    idr: 'IDR'
  }
};