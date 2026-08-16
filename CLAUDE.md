# Loan Management System — Agent Team

## Guiding Principle

**Build Static and Simple Web App/Tool** Greenfield: in-memory only (no real database), pre-production — don't factor in data migration.

## Developer Tool Suite Constraints
1. **Look and Feel**: คงแนวทางการออกแบบสไตล์เดิม (Compact Light Theme) ที่เรียบง่าย สะอาดตา
2. **Compact & Space-Optimized**: เน้นความกะทัดรัด ประหยัดพื้นที่ แสดงผลได้กว้างและจุใจ เหมาะกับการใช้งานจริง
3. **Static Web & Local Web Cache**: ทุกฟีเจอร์รันแบบ Static Web บน GitHub Pages ได้ โดยมีระบบสลับเมนูแบบ Local Web Cache (In-Memory/DOM Switching) เพื่อให้สลับหน้าได้ทันทีโดยไม่ต้องรีโหลดหน้าเว็บใหม่ และช่วยเก็บสถานะข้อมูลของแต่ละเครื่องมือไว้ระหว่างการสลับใช้งาน

## Read This First, Every Time
- Interview me relentlessly about every aspect of this **plan until we reach a shared understanding**. Walk down each branch of the design tree, resolving dependencies between decisions one by one.

