import json
import uuid

from flask import Blueprint, g, jsonify, request

from backend.app.db import get_db_connection
from app.security import require_user

bookings_router = Blueprint("bookings", __name__)

BOOKING_DETAILS_SELECT = """SELECT b.booking_ref, b.status, b.total_amount, b.created_at,
                                  s.id AS showtime_id, s.show_date, s.show_time, s.format,
                                  m.id AS movie_id, m.title AS movie_title, m.title_vn, m.poster,
                                  cr.room_number, cr.name AS room_name, c.name AS cinema_name,
                                  COALESCE((json_agg(json_build_object(
                                      'id', st.id, 'seat_code', st.seat_code
                                  )) FILTER (WHERE st.id IS NOT NULL))::jsonb,
                                  b.data_json::jsonb -> 'seat_codes', '[]'::jsonb)::json AS seats
                           FROM bookings b
                           JOIN showtimes s ON s.id = b.showtime_id
                           JOIN movies m ON m.id = s.movie_id
                           JOIN cinema_rooms cr ON cr.room_number = s.cinema_room_number
                           JOIN cinemas c ON c.id = cr.cinema_id
                           LEFT JOIN booking_seats bs ON bs.booking_ref = b.booking_ref
                           LEFT JOIN seats st ON st.id = bs.seat_id"""

ADMIN_BOOKINGS_SELECT = """SELECT b.booking_ref, b.status, b.total_amount, b.created_at,
                                 b.user_id, u.name AS customer_name, u.email AS customer_email,
                                 s.id AS showtime_id, s.show_date, s.show_time, s.format,
                                 m.id AS movie_id, m.title AS movie_title, m.title_vn, m.poster,
                                 cr.room_number, cr.name AS room_name, c.name AS cinema_name,
                                 COALESCE((json_agg(json_build_object(
                                     'id', st.id, 'seat_code', st.seat_code
                                 )) FILTER (WHERE st.id IS NOT NULL))::jsonb,
                                 b.data_json::jsonb -> 'seat_codes', '[]'::jsonb)::json AS seats
                          FROM bookings b
                          JOIN users u ON u.id = b.user_id
                          JOIN showtimes s ON s.id = b.showtime_id
                          JOIN movies m ON m.id = s.movie_id
                          JOIN cinema_rooms cr ON cr.room_number = s.cinema_room_number
                          JOIN cinemas c ON c.id = cr.cinema_id
                          LEFT JOIN booking_seats bs ON bs.booking_ref = b.booking_ref
                          LEFT JOIN seats st ON st.id = bs.seat_id"""


@bookings_router.get("/rooms")
def list_cinema_rooms():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, room_number, name, type, capacity FROM cinema_rooms ORDER BY room_number")
            rooms = cur.fetchall()
        return jsonify({"cinema_rooms": rooms})
    finally:
        conn.close()


@bookings_router.post("/showtimes")
@require_user(admin_only=True)
def create_showtime():
    payload = request.get_json(silent=True) or {}
    required = ("id", "movie_id", "cinema_room_number", "show_date", "show_time")
    if not isinstance(payload, dict):
        return jsonify({"error": "A JSON object is required"}), 400
    if any(payload.get(field) in (None, "") for field in required):
        return jsonify({"error": "id, movie_id, cinema_room_number, show_date, and show_time are required"}), 400
    if not isinstance(payload["cinema_room_number"], int) or any(
        not isinstance(payload[field], str)
        for field in ("id", "movie_id", "show_date", "show_time")
    ):
        return jsonify({"error": "Invalid showtime field types"}), 400
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO showtimes (id, movie_id, cinema_room_number, show_date, show_time, format)
                   VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
                (payload["id"], payload["movie_id"], payload["cinema_room_number"],
                 payload["show_date"], payload["show_time"], payload.get("format")),
            )
            showtime = cur.fetchone()
        conn.commit()
        return jsonify({"showtime": showtime}), 201
    except Exception as error:
        conn.rollback()
        if getattr(error, "pgcode", None) == "23505":
            return jsonify({"error": "This showtime already exists"}), 409
        if getattr(error, "pgcode", None) == "23503":
            return jsonify({"error": "The movie or cinema room does not exist"}), 400
        raise
    finally:
        conn.close()


@bookings_router.post("/rooms/<int:room_number>/seats")
@require_user(admin_only=True)
def create_room_seats(room_number):
    payload = request.get_json(silent=True) or {}
    seat_specs = payload.get("seats") if isinstance(payload, dict) else None
    if not isinstance(seat_specs, list) or not seat_specs:
        return jsonify({"error": "seats must be a non-empty array"}), 400
    if any(
        not isinstance(seat, dict)
        or not isinstance(seat.get("seat_code"), str)
        or not seat["seat_code"].strip()
        for seat in seat_specs
    ):
        return jsonify({"error": "Each seat must include a non-empty seat_code"}), 400
    seat_codes = [seat["seat_code"].strip() for seat in seat_specs]
    if len(set(seat_codes)) != len(seat_codes):
        return jsonify({"error": "Duplicate seat codes are not allowed"}), 400
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, capacity FROM cinema_rooms WHERE room_number = %s FOR UPDATE",
                (room_number,),
            )
            room = cur.fetchone()
            if not room:
                conn.rollback()
                return jsonify({"error": "Cinema room not found"}), 404
            cur.execute("SELECT COUNT(*) AS count FROM seats WHERE cinema_room_id = %s", (room["id"],))
            seat_count = cur.fetchone()["count"]
            if seat_count + len(seat_specs) > room["capacity"]:
                conn.rollback()
                return jsonify({"error": "Seat count would exceed the room capacity"}), 400
            cur.executemany(
                """INSERT INTO seats
                   (id, cinema_room_id, seat_code, row_label, seat_number, seat_type)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                [
                    (str(uuid.uuid4()), room["id"], code, seat.get("row_label"),
                     seat.get("seat_number"), seat.get("seat_type", "standard"))
                    for seat, code in zip(seat_specs, seat_codes)
                ],
            )
        conn.commit()
        return jsonify({"created": len(seat_specs)}), 201
    except Exception as error:
        conn.rollback()
        if getattr(error, "pgcode", None) == "23505":
            return jsonify({"error": "One or more seats already exist in this room"}), 409
        raise
    finally:
        conn.close()


@bookings_router.get("/showtimes")
def list_showtimes():
    movie_id = request.args.get("movie_id")
    show_date = request.args.get("date")
    clauses, params = [], []
    if movie_id:
        clauses.append("s.movie_id = %s")
        params.append(movie_id)
    if show_date:
        clauses.append("s.show_date = %s")
        params.append(show_date)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT s.*, m.title AS movie_title, m.title_vn,
                           m.poster, m.base_price, r.id AS cinema_room_id,
                           r.name AS cinema_room_name, r.type AS room_type
                    FROM showtimes s
                    JOIN movies m ON m.id = s.movie_id
                    JOIN cinema_rooms r ON r.room_number = s.cinema_room_number
                    {where}
                    ORDER BY s.show_date, s.show_time""",
                tuple(params),
            )
            showtimes = cur.fetchall()
        return jsonify({"showtimes": showtimes})
    finally:
        conn.close()


@bookings_router.get("/showtimes/<showtime_id>/seats")
def get_showtime_seats(showtime_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT st.id, st.seat_code, st.row_label, st.seat_number,
                          st.seat_type, (bs.seat_id IS NOT NULL) AS booked
                   FROM showtimes sh
                   JOIN cinema_rooms cr ON cr.room_number = sh.cinema_room_number
                   JOIN seats st ON st.cinema_room_id = cr.id
                   LEFT JOIN booking_seats bs
                     ON bs.seat_id = st.id AND bs.showtime_id = sh.id
                   WHERE sh.id = %s
                   ORDER BY st.row_label, st.seat_number, st.seat_code""",
                (showtime_id,),
            )
            seats = cur.fetchall()
        if not seats:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM showtimes WHERE id = %s", (showtime_id,))
                showtime_exists = cur.fetchone()
            if not showtime_exists:
                return jsonify({"error": "Showtime not found"}), 404
        return jsonify({"showtime_id": showtime_id, "seats": seats})
    finally:
        conn.close()


@bookings_router.post("")
@require_user()
def create_booking():
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return jsonify({"error": "A JSON object is required"}), 400
    showtime_id = payload.get("showtime_id")
    seat_ids = payload.get("seat_ids")
    if not isinstance(showtime_id, str) or not showtime_id:
        return jsonify({"error": "showtime_id is required"}), 400
    if not isinstance(seat_ids, list) or not seat_ids or any(not isinstance(s, str) for s in seat_ids):
        return jsonify({"error": "seat_ids must be a non-empty array of seat ids"}), 400
    seat_ids = list(dict.fromkeys(seat_ids))
    if len(seat_ids) != len(payload["seat_ids"]):
        return jsonify({"error": "Duplicate seat ids are not allowed"}), 400

    booking_ref = f"CGV-{uuid.uuid4().hex[:12].upper()}"
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT s.movie_id, s.cinema_room_number, m.base_price
                   FROM showtimes s JOIN movies m ON m.id = s.movie_id
                   WHERE s.id = %s FOR UPDATE OF s""",
                (showtime_id,),
            )
            showtime = cur.fetchone()
            if not showtime:
                conn.rollback()
                return jsonify({"error": "Showtime not found"}), 404
            cur.execute(
                """SELECT st.id FROM seats st
                   JOIN cinema_rooms cr ON cr.id = st.cinema_room_id
                   WHERE cr.room_number = %s AND st.id = ANY(%s)""",
                (showtime["cinema_room_number"], seat_ids),
            )
            valid_seats = {row["id"] for row in cur.fetchall()}
            if valid_seats != set(seat_ids):
                conn.rollback()
                return jsonify({"error": "One or more seats do not belong to this showtime's room"}), 400

            total_amount = (showtime["base_price"] or 0) * len(seat_ids)
            cur.execute(
                """INSERT INTO bookings
                   (booking_ref, user_id, showtime_id, status, total_amount, data_json)
                   VALUES (%s, %s, %s, 'pending_counter_payment', %s, %s)""",
                (booking_ref, g.current_user["id"], showtime_id, total_amount,
                 json.dumps({"seat_ids": seat_ids})),
            )
            cur.executemany(
                """INSERT INTO booking_seats (id, booking_ref, showtime_id, seat_id)
                   VALUES (%s, %s, %s, %s)""",
                [(str(uuid.uuid4()), booking_ref, showtime_id, seat_id) for seat_id in seat_ids],
            )
        conn.commit()
        return jsonify({
            "booking": {
                "booking_ref": booking_ref,
                "showtime_id": showtime_id,
                "seat_ids": seat_ids,
                "total_amount": total_amount,
                "status": "pending_counter_payment",
            }
        }), 201
    except Exception as error:
        conn.rollback()
        if getattr(error, "pgcode", None) == "23505":
            return jsonify({"error": "One or more seats have already been booked"}), 409
        raise
    finally:
        conn.close()


@bookings_router.get("")
@require_user()
def list_my_bookings():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""{BOOKING_DETAILS_SELECT}
                    WHERE b.user_id = %s
                    GROUP BY b.booking_ref, s.id, m.id, cr.id, c.id
                    ORDER BY b.created_at DESC""",
                (g.current_user["id"],),
            )
            bookings = cur.fetchall()
        return jsonify({"bookings": bookings})
    finally:
        conn.close()


@bookings_router.get("/check/<booking_ref>")
def check_booking(booking_ref):
    """Look up a booking by its private reference code for the ticket-check page."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""{BOOKING_DETAILS_SELECT}
                    WHERE b.booking_ref = %s
                    GROUP BY b.booking_ref, s.id, m.id, cr.id, c.id""",
                (booking_ref.strip(),),
            )
            booking = cur.fetchone()
        if not booking:
            return jsonify({"error": "Không tìm thấy vé với mã này."}), 404
        return jsonify({"booking": booking})
    finally:
        conn.close()


@bookings_router.get("/admin")
@require_user(admin_only=True)
def list_all_bookings():
    status_filter = request.args.get("status", "").strip().lower()
    search = request.args.get("q", "").strip()
    clauses, params = [], []
    if status_filter and status_filter != "all":
        clauses.append("LOWER(b.status) = %s")
        params.append(status_filter)
    if search:
        clauses.append("(b.booking_ref ILIKE %s OR u.name ILIKE %s OR u.email ILIKE %s OR m.title ILIKE %s OR m.title_vn ILIKE %s)")
        params.extend([f"%{search}%"] * 5)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""{ADMIN_BOOKINGS_SELECT}
                    {where}
                    GROUP BY b.booking_ref, u.id, s.id, m.id, cr.id, c.id
                    ORDER BY b.created_at DESC""",
                tuple(params),
            )
            bookings = cur.fetchall()
        return jsonify({"bookings": bookings})
    finally:
        conn.close()


@bookings_router.delete("/admin/<booking_ref>")
@require_user(admin_only=True)
def cancel_booking_as_admin(booking_ref):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT status, data_json FROM bookings WHERE booking_ref = %s FOR UPDATE",
                (booking_ref,),
            )
            booking = cur.fetchone()
            if not booking:
                conn.rollback()
                return jsonify({"error": "Không tìm thấy vé."}), 404
            if str(booking["status"]).lower() in {"cancelled", "canceled"}:
                conn.rollback()
                return jsonify({"error": "Vé này đã được hủy trước đó."}), 409

            cur.execute(
                """SELECT st.id, st.seat_code
                   FROM booking_seats bs JOIN seats st ON st.id = bs.seat_id
                   WHERE bs.booking_ref = %s ORDER BY st.seat_code""",
                (booking_ref,),
            )
            booked_seats = cur.fetchall()
            try:
                details = json.loads(booking["data_json"] or "{}")
            except (TypeError, json.JSONDecodeError):
                details = {}
            if not isinstance(details, dict):
                details = {}
            details["seat_ids"] = [seat["id"] for seat in booked_seats]
            details["seat_codes"] = [
                {"id": seat["id"], "seat_code": seat["seat_code"]}
                for seat in booked_seats
            ]
            details["cancelled_by"] = g.current_user["id"]

            # Keep an audit copy of the seat labels in bookings.data_json, then
            # remove the unique seat reservations so those seats become available.
            cur.execute("DELETE FROM booking_seats WHERE booking_ref = %s", (booking_ref,))
            cur.execute(
                """UPDATE bookings SET status = 'cancelled', data_json = %s,
                          updated_at = CURRENT_TIMESTAMP
                   WHERE booking_ref = %s""",
                (json.dumps(details), booking_ref),
            )
        conn.commit()
        return jsonify({"message": "Đã hủy vé và giải phóng ghế.", "booking_ref": booking_ref})
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


@bookings_router.patch("/admin/<booking_ref>/seats")
@require_user(admin_only=True)
def change_booking_seats_as_admin(booking_ref):
    payload = request.get_json(silent=True) or {}
    seat_ids = payload.get("seat_ids") if isinstance(payload, dict) else None
    if not isinstance(seat_ids, list) or not seat_ids or any(not isinstance(item, str) for item in seat_ids):
        return jsonify({"error": "Chọn danh sách ghế mới hợp lệ."}), 400
    seat_ids = list(dict.fromkeys(seat_ids))
    if len(seat_ids) != len(payload["seat_ids"]):
        return jsonify({"error": "Danh sách ghế có mã bị lặp."}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT b.status, b.data_json, b.showtime_id,
                          s.cinema_room_number
                   FROM bookings b JOIN showtimes s ON s.id = b.showtime_id
                   WHERE b.booking_ref = %s FOR UPDATE OF b""",
                (booking_ref,),
            )
            booking = cur.fetchone()
            if not booking:
                conn.rollback()
                return jsonify({"error": "Không tìm thấy vé."}), 404
            if str(booking["status"]).lower() in {"cancelled", "canceled"}:
                conn.rollback()
                return jsonify({"error": "Không thể đổi ghế của vé đã hủy."}), 409

            cur.execute(
                """SELECT st.id, st.seat_code
                   FROM booking_seats bs JOIN seats st ON st.id = bs.seat_id
                   WHERE bs.booking_ref = %s ORDER BY st.seat_code""",
                (booking_ref,),
            )
            current_seats = cur.fetchall()
            if not current_seats:
                conn.rollback()
                return jsonify({"error": "Vé này không còn ghế để chuyển."}), 409
            if len(seat_ids) != len(current_seats):
                conn.rollback()
                return jsonify({"error": f"Cần chọn đúng {len(current_seats)} ghế để giữ nguyên số vé."}), 400

            cur.execute(
                """SELECT st.id, st.seat_code FROM seats st
                   JOIN cinema_rooms cr ON cr.id = st.cinema_room_id
                   WHERE cr.room_number = %s AND st.id = ANY(%s)
                   FOR UPDATE OF st""",
                (booking["cinema_room_number"], seat_ids),
            )
            selected_seats = cur.fetchall()
            if len(selected_seats) != len(seat_ids):
                conn.rollback()
                return jsonify({"error": "Một hoặc nhiều ghế không thuộc phòng của suất chiếu này."}), 400

            cur.execute(
                """SELECT bs.seat_id FROM booking_seats bs
                   JOIN bookings other_booking ON other_booking.booking_ref = bs.booking_ref
                   WHERE bs.showtime_id = %s AND bs.seat_id = ANY(%s)
                     AND bs.booking_ref <> %s
                     AND LOWER(other_booking.status) NOT IN ('cancelled', 'canceled')
                   FOR UPDATE OF bs""",
                (booking["showtime_id"], seat_ids, booking_ref),
            )
            if cur.fetchall():
                conn.rollback()
                return jsonify({"error": "Một hoặc nhiều ghế vừa được đặt bởi vé khác."}), 409

            previous_codes = [seat["seat_code"] for seat in current_seats]
            selected_codes = [seat["seat_code"] for seat in selected_seats]
            if set(previous_codes) == set(selected_codes):
                conn.rollback()
                return jsonify({"error": "Bạn chưa thay đổi ghế nào."}), 400

            try:
                details = json.loads(booking["data_json"] or "{}")
            except (TypeError, json.JSONDecodeError):
                details = {}
            if not isinstance(details, dict):
                details = {}
            history = details.get("seat_change_history")
            if not isinstance(history, list):
                history = []
            history.append({
                "from": previous_codes,
                "to": selected_codes,
                "changed_by": g.current_user["id"],
            })
            details["seat_change_history"] = history
            details["seat_ids"] = seat_ids
            details["seat_codes"] = [
                {"id": seat["id"], "seat_code": seat["seat_code"]}
                for seat in selected_seats
            ]

            cur.execute("DELETE FROM booking_seats WHERE booking_ref = %s", (booking_ref,))
            cur.executemany(
                """INSERT INTO booking_seats (id, booking_ref, showtime_id, seat_id)
                   VALUES (%s, %s, %s, %s)""",
                [
                    (str(uuid.uuid4()), booking_ref, booking["showtime_id"], seat_id)
                    for seat_id in seat_ids
                ],
            )
            cur.execute(
                """UPDATE bookings SET data_json = %s, updated_at = CURRENT_TIMESTAMP
                   WHERE booking_ref = %s""",
                (json.dumps(details), booking_ref),
            )
        conn.commit()
        return jsonify({
            "message": "Đã chuyển ghế thành công.",
            "booking_ref": booking_ref,
            "seats": selected_codes,
        })
    except Exception as error:
        conn.rollback()
        if getattr(error, "pgcode", None) == "23505":
            return jsonify({"error": "Một hoặc nhiều ghế vừa được đặt bởi vé khác."}), 409
        raise
    finally:
        conn.close()


@bookings_router.get("/<booking_ref>")
@require_user()
def get_booking(booking_ref):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""{BOOKING_DETAILS_SELECT}
                    WHERE b.booking_ref = %s AND b.user_id = %s
                    GROUP BY b.booking_ref, s.id, m.id, cr.id, c.id""",
                (booking_ref, g.current_user["id"]),
            )
            booking = cur.fetchone()
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
        return jsonify({"booking": booking})
    finally:
        conn.close()
