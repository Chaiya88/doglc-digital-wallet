# Masteradmin Command Summary

## เมนูหลัก
- ทุกคำสั่งของ admin
- จัดการ admin (เพิ่ม/ลบ/แก้ไข) (`/adminadd`, `/adminedit`, `/admindel`)
- กำหนด/เปลี่ยนสิทธิ์ admin (`/setrole [admin_id] [permission]`)
- ปรับค่าบริการ รายบุคคล/กลุ่ม (`/setfee [user_id/group]`)
- จัดการกลุ่ม VIP/VVIP (`/vipadd`, `/vipedit`, `/vipdel`, `/vvipadd`, `/vvipedit`, `/vvipdel`)
- ดู/แก้ไข policy ระบบ (`/policy`, `/policyedit`)
- Dashboard สรุปภาพรวม (`/dashboard`)
- ตรวจสอบ log การเปลี่ยนแปลง (`/auditlog`)
- ส่ง broadcast ถึง admin หรือทุก user (`/broadcast [group] [message]`)
- สำรอง/กู้คืนข้อมูล (`/backup`, `/restore`)
- ออกจากระบบ (`/logout`)

## คำอธิบายเพิ่มเติม
- Masteradmin เป็นระดับสูงสุด สามารถจัดการทุกอย่างในระบบ
- ทุก action สำคัญ (เช่น ปรับสิทธิ์/ค่าบริการ/backup) ควรมียืนยัน 2 ชั้น (OTP/Google Authenticator)
- ทุกคำสั่งจะถูก log พร้อมระบุผู้ดำเนินการและเวลา

## หมายเหตุ
- ต้องตรวจสอบสิทธิ์ admin ทุกครั้งก่อนเปลี่ยนแปลง
- ทุกการเปลี่ยนแปลงสำคัญควรแจ้งเตือน Doglc Shareholder group
- ใช้สิทธิ์ masteradmin อย่างระมัดระวัง