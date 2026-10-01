"""Server-side validation for authentication request data."""

import re
from typing import Any

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_PATTERN = re.compile(r"^[0-9+().\-\s]{8,25}$")
MAX_NAME_LENGTH = 255
MAX_EMAIL_LENGTH = 255
MAX_PASSWORD_LENGTH = 128

def _required_text(request_data: dict[str, Any], field: str, message: str, max_length: int) -> tuple[str | None, str | None]:
    value = request_data.get(field)
    if not isinstance(value, str):
        return None, message
    value = value.strip()
    if not value or len(value) > max_length:
        return None, message
    return value, None

def validate_signup_request(request_data: Any) -> tuple[dict[str, str] | None, str | None]:
    """Validate and normalize sign-up request data before creating an account."""
    if not isinstance(request_data, dict):
        return None, "Request body must be a JSON object."

    name, error = _required_text(request_data, "name", "Họ và tên phải có từ 2 đến 255 ký tự.", MAX_NAME_LENGTH)
    if error or len(name) < 2:
        return None, error or "Họ và tên phải có từ 2 đến 255 ký tự."

    email, error = _required_text(request_data, "email", "Địa chỉ email là bắt buộc và không được vượt quá 255 ký tự.", MAX_EMAIL_LENGTH)
    if error or not EMAIL_PATTERN.fullmatch(email):
        return None, error or "Địa chỉ email không hợp lệ."

    password = request_data.get("password")
    if not isinstance(password, str) or not 6 <= len(password) <= MAX_PASSWORD_LENGTH:
        return None, "Mật khẩu phải có từ 6 đến 128 ký tự."

    confirm_password = request_data.get("confirmPassword")
    if confirm_password is not None and confirm_password != password:
        return None, "Mật khẩu xác nhận không trùng khớp."

    phone = request_data.get("phone", "")
    if phone is None:
        phone = ""
    if not isinstance(phone, str):
        return None, "Số điện thoại không hợp lệ."
    phone = phone.strip()
    if phone and not PHONE_PATTERN.fullmatch(phone):
        return None, "Số điện thoại không hợp lệ."

    return {"name": name, "email": email.lower(), "phone": phone, "password": password}, None

def validate_signin_request(request_data: Any) -> tuple[dict[str, str] | None, str | None]:
    """Validate and normalize sign-in request data before querying for an account."""
    if not isinstance(request_data, dict):
        return None, "Request body must be a JSON object."

    credential = request_data.get("emailOrUsername", request_data.get("username", request_data.get("email")))
    if not isinstance(credential, str):
        return None, "Vui lòng nhập Email hoặc Tên đăng nhập."
    credential = credential.strip().lower()
    if not credential or len(credential) > MAX_EMAIL_LENGTH:
        return None, "Email hoặc Tên đăng nhập không hợp lệ."
    if "@" in credential and not EMAIL_PATTERN.fullmatch(credential):
        return None, "Định dạng Email không hợp lệ."

    password = request_data.get("password")
    if not isinstance(password, str) or not 6 <= len(password) <= MAX_PASSWORD_LENGTH:
        return None, "Mật khẩu phải có từ 6 đến 128 ký tự."

    return {"credential": credential, "password": password}, None
