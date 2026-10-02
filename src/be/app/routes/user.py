from flask import Blueprint, request, jsonify

user_router = Blueprint("user", __name__)

MOCK_USER_PROFILE = {
    "full_name": "Nguyễn Văn A",
    "email": "user@gmail.com",
    "membership_tier": "VIP Member",
    "reward_points": 1250
}

MOCK_BOOKING_HISTORY = [
    {
        "id": "CGV10293847",
        "movieTitle": "Mai",
        "cinema": "CGV Vincom Đồng Khởi",
        "showtime": "19:30 - 15/10/2026",
        "seats": "H05, H06",
        "room": "Cinema 3",
        "totalPrice": "220.000 VNĐ",
        "status": "Đã thanh toán"
    },
    {
        "id": "CGV10293811",
        "movieTitle": "Dune: Part Two",
        "cinema": "CGV Landmark 81",
        "showtime": "20:15 - 02/09/2026",
        "seats": "F10, F11",
        "room": "IMAX Hall",
        "totalPrice": "350.000 VNĐ",
        "status": "Đã xem"
    }
]

@user_router.route("/profile", methods=["GET"])
def get_profile():
    return jsonify({
        "status": "success",
        "data": MOCK_USER_PROFILE
    }), 200

@user_router.route("/profile", methods=["PUT"])
def update_profile():
    data = request.get_json() or {}
    
    if "fullName" in data:
        MOCK_USER_PROFILE["full_name"] = data["fullName"]
        
    return jsonify({
        "message": "Cập nhật thông tin cá nhân thành công!",
        "data": MOCK_USER_PROFILE
    }), 200

@user_router.route("/bookings", methods=["GET"])
def get_user_bookings():
    return jsonify({
        "status": "success",
        "data": MOCK_BOOKING_HISTORY
    }), 200