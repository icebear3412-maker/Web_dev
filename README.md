# USTH Cinema

USTH Cinema là website giới thiệu phim và đặt vé xem phim trực tuyến. Người dùng có thể xem phim đang chiếu, chọn lịch chiếu và ghế, xem lịch sử vé trong hồ sơ cá nhân, hoặc tra cứu vé bằng mã đặt chỗ. Quản trị viên có thể quản lý phim, lịch chiếu và giao dịch.

## Công nghệ

- **Frontend:** React, TypeScript, Vite, Material UI.
- **Backend:** Python, Flask, REST API.
- **Database:** PostgreSQL.

## Các trang chính

| Đường dẫn | Chức năng |
| --- | --- |
| `/` | Trang chủ, phim đang chiếu và banner |
| `/event` | Sự kiện, ưu đãi |
| `/movies/:movieId` | Chi tiết phim |
| `/cinemas` | Thông tin rạp và các phòng chiếu |
| `/booking` | Chọn phim, lịch chiếu và ghế để đặt vé |
| `/profile` | Hồ sơ và lịch sử đặt vé |
| `/check_ticket` | Tra cứu vé bằng mã đặt chỗ |
| `/signin`, `/signup` | Đăng nhập, đăng ký |
| `/admin` | Tổng quan quản trị |
| `/admin/movies` | Quản lý phim và lịch chiếu |
| `/admin/transactions` | Xem, đổi ghế hoặc hủy vé |

## Yêu cầu

- Node.js 24 (hoặc phiên bản tương thích với Vite 8) và Corepack/Yarn.
- Python 3.11.
- Docker Desktop với Docker Compose để chạy PostgreSQL cục bộ, hoặc một PostgreSQL đã cài sẵn.

## Chạy ứng dụng trên Windows

Mở 3 cửa sổ PowerShell tại thư mục dự án `C:\Web dev\main`.

### 1. Cấu hình môi trường

Chỉ cần tạo `.env` một lần:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

`.env.example` đã cấu hình PostgreSQL cục bộ tại `localhost:1000`, khớp với dịch vụ database trong `docker-compose.yml`. Trước khi dùng, thay `JWT_SECRET` và `JWT_REFRESH_SECRET` bằng hai chuỗi bí mật riêng biệt. Không đưa `.env` lên Git.

Khi ghép từ `backend_upload`, `.env` cục bộ dùng cùng `DATABASE_URL` với dự án đó. Nếu database đã chạy ở địa chỉ này, bỏ qua bước khởi động PostgreSQL bằng Docker bên dưới và tiếp tục cài backend.

### 2. Khởi động PostgreSQL

Ở cửa sổ PowerShell thứ nhất:

```powershell
docker compose up -d db
docker compose ps
```

Database Docker lắng nghe tại `localhost:1000`, tên database mặc định là `cinema_db`. Nếu `backend_upload` đã chạy PostgreSQL bằng Docker, Compose dùng lại volume `backend_upload_pgdata` của dự án đó. Nếu volume chưa tồn tại, PostgreSQL sẽ tạo database mới. Có thể đổi tên volume bằng `POSTGRES_VOLUME_NAME` trong `.env` để dùng database riêng. Với PostgreSQL đã chạy sẵn ngoài Docker, kết nối bằng `DATABASE_URL` và không cần khởi động container này.

### 3. Khởi động backend

Ở cửa sổ PowerShell thứ hai:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r src/be/requirements.txt
python src/be/init_db.py
python src/be/run.py
```

Backend chạy tại `http://localhost:5000`. Nếu PowerShell chặn kích hoạt môi trường ảo, có thể chạy trực tiếp:

```powershell
.\.venv\Scripts\python.exe -m pip install -r src/be/requirements.txt
.\.venv\Scripts\python.exe src/be/init_db.py
.\.venv\Scripts\python.exe src/be/run.py
```

### 4. Khởi động frontend

Ở cửa sổ PowerShell thứ ba:

```powershell
corepack yarn install
yarn frontend
```

Mở `http://localhost:5173` trên trình duyệt. Frontend mặc định gọi API tại `http://localhost:5000`; nếu backend chạy ở địa chỉ khác, cấu hình `VITE_API_BASE_URL` trong `.env` rồi khởi động lại Vite.

## Database và migration

Backend đọc `DATABASE_URL` trong `.env`. Có thể thay giá trị này để kết nối đến PostgreSQL khác; không cần dùng database Docker nếu đã có database tương thích.

Database được quản lý bằng migration trong `backend/migrations`, ghép từ `backend_upload` và bổ sung các cột mà API hiện tại cần. Lệnh dưới đây đọc `.env` ở thư mục gốc và nâng cấp schema trong một transaction; nếu lỗi, các thay đổi của lần chạy sẽ được rollback:

```powershell
.\.venv\Scripts\python.exe src/be/init_db.py
```

Database mới được tạo sẵn rạp, phòng và ghế theo migration gốc của `backend_upload`; phim, tài khoản và lịch chiếu cần được thêm riêng. Database hiện có được giữ nguyên bản ghi khi nâng cấp. Sao lưu database có dữ liệu quan trọng trước khi nâng cấp schema.

## Tài khoản quản trị

Các trang `/admin`, `/admin/movies` và `/admin/transactions` dành cho tài khoản có quyền quản trị. Backend kiểm tra tài khoản có email `admin@gmail.com` và mật khẩu 12345678 và vai trò `admin`;

## Lệnh hữu ích

```powershell
# Tạo bản build frontend
yarn build

# Chạy kiểm tra định dạng
yarn format:check

# Chạy test frontend hiện có
yarn test:fe

# Dừng riêng PostgreSQL, vẫn giữ dữ liệu trong volume
docker compose stop db
```

Không dùng `docker compose down -v` nếu muốn giữ dữ liệu database; tùy chọn `-v` xóa volume PostgreSQL.

## Cấu trúc thư mục

```text
src/
  assets/       Hình ảnh, poster và banner
  layouts/      Bố cục trang người dùng và quản trị
  pages/        Các trang của website
  routes/       Khai báo route phía người dùng
  services/     Hàm gọi API
  be/           Backend Flask và lệnh khởi tạo database
backend/        Kết nối PostgreSQL, migration Alembic và tài liệu API
tests/          Test frontend
```
