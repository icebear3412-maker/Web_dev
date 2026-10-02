from flask import Blueprint, request, jsonify

auth_router = Blueprint("auth", __name__)

# Route Đăng Ký
@auth_router.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")

    # Kiểm tra dữ liệu gửi lên
    if not email or not password:
        return jsonify({"message": "Vui lòng nhập đầy đủ thông tin!"}), 400

    # TODO: Thêm logic lưu thông tin người dùng vào CSDL ở đây

    return jsonify({"message": "Đăng ký tài khoản thành công!", "user": {"email": email, "full_name": full_name}}), 200


# Sửa "/login" thành "/signin"
@auth_router.route("/signin", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    return jsonify({
        "message": "Đăng nhập thành công!",
        "token": "fake-jwt-token-123456",
        "user": {"email": email}
    }), 200