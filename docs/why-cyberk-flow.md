# Tại sao CyberK tạo dự án này?

## 1. Bối cảnh: Thế giới AI đang thay đổi ngành phần mềm

Thế giới AI đang vận hành liên tục và không có dấu hiệu chậm lại. Sự ra đời của hàng loạt AI model và AI workflow như **Claude Code**, **Cursor**, **GitHub Copilot Workspace**, **Devin**, **Windsurf**, **Amp**, **OpenClaw**, **Gas Town**... đã rút ngắn đáng kể thời gian phát triển ứng dụng — từ hàng tuần xuống còn vài ngày, thậm chí vài giờ.

Vai trò của AI agent trong ngành lập trình ngày càng lớn. Theo Gartner dự đoán, đến 2027, **khoảng 80% code trên thế giới sẽ được tạo ra bởi AI** và được con người review. Lập trình viên đang chuyển từ "người viết code" sang "người hướng dẫn và kiểm duyệt AI".

Trong một thời gian ngắn nữa, với việc:

- Các AI model ngày càng rẻ và mạnh hơn
- Các nền tảng AI bot, customized workflow dần hoàn thiện (n8n, Zapier AI, Vellum, OpenClaw...)
- Các công cụ orchestration như Gas Town cho phép chạy hàng chục agent song song

...thì các tổ chức, các công ty hoàn toàn có thể tích hợp "nhân viên AI" vào quy trình một cách dễ dàng và có hệ thống.

**CyberK cũng cần thay đổi.** Thích ứng với hệ tư tưởng mới, hệ thống workflow mới. Vai trò và nhiệm vụ của lập trình viên cần được định vị lại — không chỉ là người code, mà là người thiết kế, hướng dẫn, review và đảm bảo chất lượng cho AI.

**Dự án này là bước đầu tiên cho bức tranh của CyberK** — hướng tới AI toàn diện, bắt kịp thế giới về cách áp dụng và tích hợp AI vào toàn bộ giai đoạn phát triển phần mềm.

---

## 2. Tầm nhìn và mục tiêu

### Xây dựng bộ khung AI Workflow

Với triết lý:

- **Linh hoạt, không cứng nhắc** — workflow có thể thích ứng với từng dự án, từng team
- **Dễ dàng, không phức tạp** — bất kỳ ai cũng có thể bắt đầu mà không cần đào tạo phức tạp
- **Dễ hiểu, minh bạch** — ai cũng có thể đọc và hiểu toàn bộ workflow
- **Flexible, không phụ thuộc** — không bị khoá vào một service, một provider, hay một tool duy nhất

### Tech Stack

- **Cập nhật công nghệ theo tiêu chuẩn mới** — luôn theo kịp xu hướng và best practices
- **Không bó buộc vào người khổng lồ** — tránh vendor lock-in, ưu tiên open-source và standard
- **Xuyên suốt và tái sử dụng** — từ Frontend → Mobile → Backend → Infrastructure, cùng một hệ sinh thái
- **Đảm bảo về các practice** — coding standards, testing, security, performance đều được đặt làm nền tảng

### Tính hồi tố (Retrospective & Knowledge Management)

- **Lưu lại toàn bộ quá trình** — mọi quyết định, mọi thay đổi đều có lịch sử rõ ràng
- **Lưu lại toàn bộ knowledge** — kiến thức được tích luỹ, không bị mất theo thời gian hay theo người
- **Spec luôn luôn là latest** — tài liệu spec được cập nhật liên tục, phản ánh trạng thái thực tế của hệ thống, không bao giờ lỗi thời

---

## 3. Cách triển khai

- **Module và không ràng buộc** — workflow và tech stack mang tính module, hoàn toàn có thể chỉ áp dụng workflow vào các dự án đã có sẵn mà không cần xây lại từ đầu
- **Cung cấp môi trường chuẩn** — mọi thành viên CyberK đều có môi trường làm việc với AI theo tiêu chuẩn, **không ai bị bỏ lại phía sau**
- **Matrix đánh giá rõ ràng** — có bộ tiêu chí đánh giá mức độ phổ cập AI workflow trong team và dự án
- **Open cho việc sửa đổi** — không cứng nhắc và áp đặt; workflow được thiết kế để cộng đồng nội bộ đóng góp và cải tiến liên tục

---

## 4. Chúng ta đang ở đâu?

### 8 giai đoạn tiến hoá của Developer với AI

Theo Steve Yegge trong bài viết [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04), hành trình của developer với AI có thể chia thành 8 giai đoạn:

| Giai đoạn | Mô tả |
| :---: | :--- |
| **1** | **Zero hoặc gần zero AI** — chỉ dùng code completion, thỉnh thoảng hỏi Chat |
| **2** | **Coding agent trong IDE** — agent hẹp trong sidebar, hỏi xin quyền chạy tool |
| **3** | **Agent trong IDE, YOLO mode** — tăng trust, tắt permissions, agent hoạt động rộng hơn |
| **4** | **Agent rộng trong IDE** — agent dần chiếm toàn bộ màn hình, code chỉ để xem diff |
| **5** | **CLI, single agent, YOLO** — diff cuộn qua, có thể không cần nhìn |
| **6** | **CLI, multi-agent, YOLO** — thường xuyên chạy 3-5 agent song song, tốc độ rất cao |
| **7** | **10+ agents, quản lý thủ công** — bắt đầu chạm giới hạn quản lý bằng tay |
| **8** | **Tự xây orchestrator** — tiên phong, tự động hoá toàn bộ workflow |

### CyberK đang ở giai đoạn 4

Phần lớn team đang sử dụng AI agent trong IDE ở mức rộng — code chủ yếu để review diff, AI đảm nhận phần lớn việc viết code. Một số thành viên đã bắt đầu chuyển sang CLI agent.

### Nhìn nhận nghiêm túc

Trong bức tranh "tăm tối" nhất, AI có thể hoàn toàn thay thế developer phổ thông. Tầm nhìn này **có thể đúng, có thể sai** — nhưng điều quan trọng là:

> **Chúng ta cần chuẩn bị cho mọi kịch bản.**

Không phải để hoảng loạn, mà để chủ động thích ứng. Dự án này chính là cách CyberK chuẩn bị — xây dựng nền tảng, quy trình và tư duy để team có thể phát triển cùng AI, thay vì bị AI bỏ lại phía sau.
