from flask import Blueprint, request
import bcrypt
from app.database import get_db


# Create a group of authentication routes
auth_router = Blueprint("auth", __name__)


# Signup endpoint
# The frontend will send a new user's email and password here
@auth_router.route("/signup", methods=["POST"])
def signup():

    # Get the JSON data sent by the frontend
    data = request.get_json()

    # Get the email from the request
    email = data.get("email")

    # Get the password from the request
    password = data.get("password")

    # Check that both email and password were provided
    if not email or not password:
        return {"error": "Email and password are required"}, 400

    # Hash the password before storing it
    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    # Connect to the database
    db = get_db()

    # Try to create the new user
    try:
        db.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (email, password_hash.decode("utf-8"))
        )

        # Save the new user
        db.commit()

    # If the email already exists, return a conflict error
    except Exception:
        db.close()
        return {"error": "Email already exists"}, 409

    # Close the database connection
    db.close()

    # Tell the frontend that the account was created
    return {"message": "User created successfully"}, 201


# Login endpoint
# The frontend will send an email and password here
@auth_router.route("/login", methods=["POST"])
def login():

    # Get the JSON data sent by the frontend
    data = request.get_json()

    # Get the email from the request
    email = data.get("email")

    # Get the password from the request
    password = data.get("password")

    # Make sure both fields were provided
    if not email or not password:
        return {"error": "Email and password are required"}, 400

    # Connect to our database
    db = get_db()

    # Find the user with this email
    user = db.execute(
        "SELECT id, email, password_hash FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    # Close the database connection
    db.close()

    # If the email does not exist, reject the login
    if user is None:
        return {"error": "Invalid email or password"}, 401

    # Convert the stored bcrypt hash back into bytes
    stored_hash = user["password_hash"].encode("utf-8")

    # Check whether the entered password matches the stored hash
    password_correct = bcrypt.checkpw(
        password.encode("utf-8"),
        stored_hash
    )

    # Reject the login if the password is incorrect
    if not password_correct:
        return {"error": "Invalid email or password"}, 401

    # Login was successful
    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "email": user["email"]
        }
    }, 200