# ZaloDesk

Copyright © 2026 HAVY.

Bản 0.4.22 đổi Lorem ipsum sang thay trực tiếp các nút chữ hiển thị, giữ nền và định dạng gốc. Rê chuột, tạm tắt hoặc đổi hiệu ứng sẽ khôi phục chữ thật; tin nhắn cập nhật được theo dõi và khôi phục theo nội dung mới nhất. Ảnh/media vẫn làm mờ khi bật che chat.

Bản 0.4.21 thêm **Chữ giả (Lorem ipsum)** trong kiểu che nội dung. Lớp chữ mẫu phủ kín nội dung thật, rê chuột để xem. Thanh mức độ đổi cỡ chữ mẫu 11–20 px; không sửa tin nhắn gốc.

Bản 0.4.20 làm lớp ô vuông mềm hơn bằng Gaussian 2 px sau khi phủ kín. Mép tan dần ra nền, thay đường cắt bo góc.

Bản 0.4.19 chỉnh lớp ô vuông theo tông sáng/tối của Zalo, giảm tương phản giữa các ô và bo nhẹ mép vùng che. Kích thước vẫn theo thanh mức độ, không lấy màu từ tin nhắn.

Bản 0.4.18 giảm kích thước ô vuông: thanh mức độ 2–20 tương ứng ô 2–20 px (mặc định 8 px thay vì 24 px). Kéo thanh cập nhật ngay kích thước ô và phần xem thử; bên dưới hiện kích thước thực tế.

Bản 0.4.17 đổi ô vuông thành lớp phủ kín màu xám, không đọc hoặc tính màu nội dung gốc. Thanh mức độ chỉnh kích thước ô. Hạt Telegram dùng bụi mịn sáng/tối, chuyển động liên tục và xuất hiện/tan dần theo tuổi hạt thay cho vòng lặp ảnh ngắn. Đây vẫn là bản mô phỏng.

Bản 0.4.16 sửa hiệu ứng che: hạt động phủ kín kiểu Telegram, mosaic lấy mẫu màu thành ô vuông và thanh đen. Menu có vùng xem thử, rê chuột để xem. Hạt dừng khi tắt chuyển động hoặc hệ thống yêu cầu giảm chuyển động. Mosaic dùng bản đồ PNG và công thức displacement của W3C, làm mượt trước khi lấy mẫu; không còn dùng lớp nhiễu tĩnh để giả hiệu ứng Telegram.

Tham khảo kỹ thuật: [Telegram Web DotRenderer](https://github.com/morethanwords/tweb/blob/master/src/components/dotRenderer.ts), [W3C SVG Filter Effects](https://www.w3.org/TR/SVG11/filters). Hiệu ứng hạt là bản mô phỏng riêng, không sao chép trình dựng WebGL của Telegram.

Bản 0.4.15 thêm **Riêng tư → Che nội dung → Kiểu che nội dung**: Mờ mềm, Hạt (kiểu Telegram), Ô vuông (Mosaic). Dùng chung thanh mức độ, rê chuột để xem và lưu lựa chọn tự động. Hiệu ứng hạt là mô phỏng tĩnh.

Bản 0.4.14 ẩn ba nút Zalo Cloud, Chụp màn hình và Công cụ trên thanh bên. Có thể bật lại từng nút trong **ZaloDesk → Giao diện**; lựa chọn được lưu tự động.

Bản 0.4.13 làm mới bộ icon menu: khiên, bảng màu, cờ lê và bánh răng; đồng bộ kích thước và nét vẽ.

Bản 0.4.12 thêm thông tin bản quyền HAVY trong app, menu Cài đặt và metadata EXE.

Bản 0.4.11 thêm ô **Khởi động cùng Windows** trong cửa sổ app. Bật/tắt ghi hoặc gỡ riêng giá trị `ZaloDesk` tại `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`, dùng đường dẫn EXE được đặt trong dấu nháy và tham số `--background`. Không cần quyền admin. Lúc đăng nhập Windows, app chạy thẳng ở khay hệ thống và bắt đầu kết nối Zalo; mở từ menu khay để hiện cửa sổ. Không tự bật tùy chọn khi cập nhật. Nếu chuyển EXE sang thư mục khác, bật lại tùy chọn tại vị trí mới.

Bản 0.4.7: che nhanh dùng **Công cụ → Tạm tắt che nội dung / Bật lại che nội dung** hoặc **Ctrl+Shift+P**. Tạm tắt chỉ bỏ hiệu ứng hiển thị, giữ nguyên các lựa chọn mờ bên trái, nội dung chat, tên, avatar và mức độ mờ. Chỉnh cài đặt trong lúc tạm tắt sẽ cập nhật lựa chọn để dùng khi bật lại. Trạng thái tạm tắt và các lựa chọn đều được lưu qua lần mở lại app. Chặn typing/đã xem không bị ảnh hưởng.

Bản hiện tại 0.4.1: **Riêng tư → Che nội dung** có hai công tắc độc lập: **Làm mờ danh sách trò chuyện** (đoạn xem trước bên trái) và **Làm mờ nội dung chat** (cuộc trò chuyện đang mở). Dùng chung thanh độ mờ. Các lựa chọn được lưu riêng; cài đặt mờ cũ được chuyển sang cả hai để giữ hành vi trước khi nâng cấp.

Bộ tiện ích độc lập cho Zalo PC. Bản 0.2 chèn icon vào thanh bên, phía trên Cloud, dùng cùng cấu trúc icon và lớp CSS với Zalo. Bấm mở menu nhỏ với bốn nhóm: Riêng tư, Giao diện, Công cụ, Cài đặt; rê chuột hoặc bấm để mở menu con.

- Riêng tư: làm mờ tin nhắn/media, che tên, thay avatar bằng ảnh đại diện chung trên máy này; rê chuột để xem lại. Chặn fetch/XHR tới các đường dẫn typing/seen đã tìm thấy trong bundle Zalo 26.11.12 (cá nhân, nhóm, E2EE).
- Giao diện: sáu lựa chọn có hình xem trước, áp dụng ngay; mức độ mờ 2–20 px.
- Công cụ: bật/tắt che nhanh, phím Ctrl+Shift+P.
- Cài đặt: hiệu ứng chuyển động và thông tin phiên bản. Tùy chọn lưu tự động trong localStorage.

Chặn trạng thái chỉ áp dụng với fetch/XHR trong renderer này, chưa bao phủ shared-worker, IPC/native, WebSocket hoặc thiết bị khác. Chưa kiểm chứng đầu cuối bằng hai tài khoản; không coi đây là bảo đảm ẩn “đã xem”.

Bản 0.2.3: **Riêng tư → Ảnh avatar ›** mở menu con có sáu ảnh xem trước: Mặc định, Hacker, Conan, Doraemon, Goku và Avatar nữ. Dùng đúng các URL từ danh sách người dùng cung cấp (zchat.vn và iStock). Bấm chọn áp dụng ngay, có dấu chọn, lưu tự động; không có popup hoặc bước tải ảnh từ máy. Ảnh cần truy cập được nguồn bên ngoài. Avatar được thay cục bộ, không đổi ảnh tài khoản thật.

Bản 0.2.4 đồng bộ menu và popup với Zalo PC: dùng lớp popover/zmenu và modal của Zalo, font/màu/bóng theo giao diện hiện hành, hàng menu 36px, công tắc native. Popup theme có tiêu đề 48px và nút Xong. Escape đóng tầng sâu nhất; mũi tên trái/phải điều hướng các tầng; bấm ngoài đóng menu. Không sửa các cài đặt tài khoản Zalo.

Bản 0.3.0:

- Thanh độ mờ nằm ngay sau **Làm mờ tin nhắn** trong **Riêng tư → Che nội dung**; hỗ trợ cả cấu trúc tin nhắn mới của Zalo.
- **Công cụ → Nút sao chép nhanh**: nút copy cạnh reaction khi rê vào tin nhắn. Sao chép nội dung văn bản, giữ xuống dòng; ảnh được sao chép dạng PNG nếu nguồn ảnh và clipboard cho phép.
- **Công cụ → Thêm nhiều cảm xúc**: nút mặt cười mở bảng 36 lựa chọn. Dùng ID/icon trong bảng reaction Zalo 26.11.12, gọi callback gắn với đúng tin nhắn. Escape hoặc bấm ngoài đóng bảng. Không gửi nếu tin nhắn bị thay trong lúc bảng đang mở.
- Hai tiện ích bật mặc định và có thể tắt riêng. Theo dõi DOM để thêm nút vào tin nhắn mới, không thêm trùng, gỡ khi tắt hoặc dispose.

Kiểm tra reaction dùng callback giả lập, không gửi vào hội thoại thật. Việc server nhận và thiết bị khác hiển thị cần được xác nhận khi người dùng thả cảm xúc thực. Callback nội bộ có thể thay đổi theo bản Zalo.

Bản 0.3.1 chỉnh hai nút copy/cảm xúc cùng nền `--reaction-background`, bóng `--shadow-bubble`, kích thước 24px, không viền và cùng tầng hiển thị với nút like. Công tắc trở lại thanh trượt 30×17px, không phụ thuộc icon font Zalo.

## Chạy

Mở `dist/ZaloDesk.exe`. App tự kết nối nếu Zalo đã bật cổng debug 8315. Nếu chưa, bấm **Mở / kết nối lại Zalo**. App sẽ hỏi trước khi đóng Zalo đang chạy. Bấm icon bốn ô trên thanh bên Zalo để mở bảng, Escape hoặc nút × để đóng.

Đóng cửa sổ ZaloDesk sẽ ẩn xuống khay hệ thống. Chọn **Thoát** trong menu khay để tắt app. Icon đã chèn còn tồn tại đến khi trang Zalo được tải lại hoặc Zalo khởi động lại.

Kết nối CDP chỉ qua loopback 127.0.0.1, bỏ qua proxy hệ thống. Không cần `--remote-allow-origins=*`. Mã giao diện được nhúng vào EXE, không tải script bên ngoài. Ảnh avatar tải từ các URL đã nêu ở trên.

## Phát triển

Yêu cầu .NET 9 SDK với Windows Desktop; phiên bản này dùng SDK có sẵn trên máy phát triển. Nên nâng lên .NET LTS đang được hỗ trợ trước khi phát hành rộng rãi.

```powershell
dotnet build -c Release
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:EnableCompressionInSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o dist
```

`ZaloConnection.cs`: CDP, đăng ký script cho lần tải trang mới, kiểm tra và kết nối lại mỗi 4 giây.

`Assets/menu.js`: icon/menu dùng lớp CSS Zalo và các CSS riêng giới hạn theo ID; MutationObserver khôi phục icon nếu Zalo dựng lại thanh bên. Selector cần được kiểm tra lại khi Zalo cập nhật giao diện.

Kiểm tra tích hợp (không tải lại Zalo, khôi phục các tùy chọn sau khi thử):

```powershell
python -m pip install websocket-client
python tools/cdp_eval.py tools/menu-smoke.js
python tools/cdp_eval.py tools/avatar-menu-smoke.js
python tools/cdp_eval.py tools/native-ui-smoke.js
python tools/cdp_eval.py tools/text-smoke.js
python tools/cdp_eval.py tools/hover-tools-smoke.js
```

Dùng đối số đường dẫn để helper đọc UTF-8 trực tiếp. Không pipe JavaScript có tiếng Việt qua Windows PowerShell vì `$OutputEncoding` mặc định có thể thay ký tự bằng dấu hỏi. Bản 0.2.5 kiểm tra chữ ký tiếng Việt để thay thế mã đã bị lỗi dấu ngay cả khi trùng phiên bản.
