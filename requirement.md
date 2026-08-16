# Specification & Design: JSON Viewer & Formatter (Compact Light Version)

เอกสารนี้ระบุความต้องการ (Specification) และรายละเอียดการออกแบบ (Design) สำหรับระบบ **JSON Viewer & Formatter Web Application** โดยปรับปรุงการออกแบบให้มีขนาดกระทัดรัด (Compact) เน้นการแสดงผลข้อมูลปริมาณมากในหน้าจอเดียว ใช้โทนสีขาว/สว่าง เรียบง่าย และสบายตา

---

## 1. จุดประสงค์ของระบบ (Project Goal)
พัฒนาเครื่องมือตรวจสอบและจัดรูปแบบข้อมูล JSON (JSON Viewer & Formatter) ที่ทำงานแบบ Client-side 100% โดยผู้ใช้สามารถวางโค้ด JSON เพื่อวิเคราะห์โครงสร้างในรูปแบบ Tree View, จัดรูปแบบให้อ่านง่าย (Format), หรือบีบอัดข้อมูลโดยลบช่องว่าง (Compress) โดยเน้นความเร็ว ความเรียบง่าย และรองรับการแสดงตัวอักษรปริมาณมากในหนึ่งหน้าจอ

---

## 2. ความสามารถหลักของระบบ (Key Features)

### 2.1 Format (จัดรูปแบบ JSON)
* **Beautify JSON**: จัดเรียงโครงสร้าง JSON ให้มีระเบียบ สวยงาม ย่อหน้าถูกต้อง
* **Custom Indent**: สามารถเลือกขนาดการย่อหน้าได้ (2 Spaces หรือ 4 Spaces) เพื่อประหยัดพื้นที่แนวตั้ง
* **Syntax Validation**: ตรวจสอบไวยากรณ์ JSON ทันที หากมีจุดผิดพลาดจะไฮไลต์แถบสีแดงที่เลขบรรทัด พร้อมระบุข้อความแจ้งเตือนความผิดพลาด

### 2.2 Remove Whitespace (บีบอัดข้อมูล)
* **Compress (Minify)**: ลบช่องว่างที่ไม่มีความจำเป็นออกทั้งหมดเพื่อให้ JSON บีบอัดเหลือพื้นที่น้อยที่สุด
* **Whitespace Types to Remove**:
  * อักขระขึ้นบรรทัดใหม่ (`\n`, `\r`)
  * อักขระย่อหน้า (`\t`)
  * ช่องว่างระหว่างคีย์และค่า (Spaces/Blank) นอกขอบเขตของข้อความสตริง (String Value)

### 2.3 Interactive Tree Viewer
* **Compact Nested Tree Grid**: แสดงผลโครงสร้าง JSON แบบต้นไม้ที่มีระยะห่าง (Padding) และขนาดตัวอักษรที่ค่อนข้างกระชับ (High density) เพื่อแสดงข้อมูลได้เยอะที่สุดในหน้าจอเดียว
* **Toggle Nodes**: ดับเบิ้ลคลิกหรือคลิกไอคอนลูกศรเพื่อยุบ (Collapse) หรือขยาย (Expand) โครงสร้าง Object / Array
* **Color Schemes (Simple Contrast)**: ใช้สีตัวอักษรที่เรียบง่ายแต่แยกประเภทชัดเจนบนพื้นขาว เช่น:
  * Key: สีดำ/เทาเข้ม
  * String: สีเขียวเข้ม (Dark Green)
  * Number/Boolean/Null: สีน้ำเงินเข้ม (Dark Blue)

### 2.4 Quick Toolbar Actions
* **Format**: ปุ่มสั่งจัดรูปแบบ JSON ทันที
* **Compress (Remove Whitespace)**: ปุ่มสั่งบีบอัดลบช่องว่างทั้งหมดทันที
* **Clear**: ล้างข้อมูลทั้งหมดในหน้าจอ
* **Copy**: คัดลอกผลลัพธ์ทั้งหมดไปยังคลิปบอร์ด

---

## 3. การออกแบบส่วนติดต่อผู้ใช้ (UI/UX Design Concept)

### 3.1 แนวคิดการออกแบบ (Design Theme)
* **Minimalist & Clean**: ใช้พื้นหลังหลักเป็นสีขาวปนเทาอ่อน (#FFFFFF และ #F5F5F5) เส้นขอบบางๆ สีเทา (#E0E0E0)
* **Compact Typography**: ใช้ฟอนต์แบบ Monospace (เช่น SF Mono, Consolas หรือ Fira Code) ขนาดค่อนข้างเล็ก (ประมาณ 12px - 13px) เพื่อให้แสดงตัวอักษรและบรรทัดได้มากที่สุด
* **No Placeholders / Low Visual Noise**: ไม่มีเอฟเฟกต์แสงเงาหรือการเบลอ เน้นสไตล์ Flat UI เพื่อความรวดเร็วและใช้พื้นที่อย่างมีประสิทธิภาพสูงสุด

### 3.2 เค้าโครงหน้าจอ (Layout)
โครงสร้างหน้าจอจะจัดวางแบบแบ่งครึ่งซ้ายขวา (Side-by-side Layout) ที่สมดุลและกระชับ:
1. **Header Bar (ขวาบน)**: แถบเครื่องมือขนาดเล็ก (Compact Toolbar) ประกอบด้วยปุ่ม Format, Compress, Clear และ Copy
2. **Left Panel (JSON Editor)**: พื้นที่สำหรับกรอกและแก้ไขโค้ดดิบ มีเลขบรรทัด (Line Numbers) อยู่ด้านซ้ายสุด ย่อหน้าและขยายโค้ดในตัวได้ (Code Folding)
3. **Right Panel (Tree Viewer)**: แสดงโครงสร้างข้อมูล JSON ในรูปแบบต้นไม้ที่กระชับ และมีแถบแสดงขนาดไฟล์และฟอนต์กำกับ

---

## 4. ตัวอย่างการออกแบบอินเตอร์เฟส (Compact UI Mockup)

ภาพตัวอย่างการออกแบบหน้าจอแบบเรียบง่าย โทนสีขาว และเน้นการแสดงข้อมูลที่หนาแน่น (High Density):

![JSON Viewer Compact Light Design Mockup](/Users/kitti/.gemini/antigravity/brain/5fc37540-e5be-4d36-8e58-3f0f26b76ad9/json_viewer_compact_light_1786865380442.jpg)

---

## 5. การวิเคราะห์ทางเทคนิค (Technical Stack)

* **Frontend**: HTML5, Vanilla CSS3 (เน้น CSS Grid และ Flexbox เพื่อจัดระเบียบพาเนลซ้ายขวาให้ยืดหยุ่นตามหน้าจอ), และ Vanilla JavaScript (ES6+)
* **State Management**: เก็บข้อมูล JSON ในหน่วยความจำชั่วคราว (In-Memory) เพื่อตอบสนองการเปลี่ยนแปลงและการแสดงผลที่รวดเร็ว
* **Optimization**: การขยาย/ยุบโหนดและการประมวลผลขนาดไฟล์ทำในฝั่งเบราว์เซอร์ทั้งหมด เพื่อประสิทธิภาพและความเป็นส่วนตัวสูงสุด
