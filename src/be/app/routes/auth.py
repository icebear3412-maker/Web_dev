# Import Flask tools for creating routes and reading requests
from flask import Blueprint, request

# Import bcrypt for securely hashing and checking passwords
import bcrypt

# Import PyJWT for creating access tokens
import jwt

# Import date and time tools for setting the token expiration time
from datetime import datetime, timedelta

# Import the database connection function
from app.database import get_db


# Secret key used to sign JWT access tokens
# This is acceptable for local development.
# For production, this should be stored in an environment variable.
JWT_SECRET = "change-this-to-a-random-secret"


# Create a group of authentication routes
auth_router = Blueprint("auth", __name__)


# Signup endpoint
# The frontend sends a new user's email and password here
@auth_router.route("/signup", methods=["POST"])
def signup():
    # Get the JSON data sent by the frontend
    data = request.get_json()

    # Get the email and password from the request
    email = data.get("email")
    password = data.get("password")

    # Check that both email and password were provided
    if not email or not password:
        return {"error": "Email and password are required"}, 400

    # Hash the password before storing it in the database
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

    # Handle errors when creating the user
    except Exception:
        db.close()
        return {"error": "Email already exists"}, 409

    # Close the database connection
    db.close()

    # Tell the frontend that the account was created
    return {"message": "User created successfully"}, 201


# Login endpoint
# The frontend sends an email and password here
@auth_router.route("/login", methods=["POST"])
def login():
    # Get the JSON data sent by the frontend
    data = request.get_json()

    # Get the email and password from the request
    email = data.get("email")
    password = data.get("password")

    # Check that both email and password were provided
    if not email or not password:
        return {"error": "Email and password are required"}, 400

    # Connect to the database
    db = get_db()

    # Find the user with the provided email
    user = db.execute(
        "SELECT id, email, password_hash FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    # Close the database connection
    db.close()

    # Reject the login if the email does not exist
    if user is None:
        return {"error": "Invalid email or password"}, 401

    # Convert the stored bcrypt hash into bytes
    stored_hash = user["password_hash"].encode("utf-8")

    # Check whether the entered password matches the stored hash
    password_correct = bcrypt.checkpw(
        password.encode("utf-8"),
        stored_hash
    )

    # Reject the login if the password is incorrect
    if not password_correct:
        return {"error": "Invalid email or password"}, 401

    # Create an access token for the logged-in user
    access_token = jwt.encode(
        {
            "user_id": user["id"],
            "email": user["email"],
            "exp": datetime.utcnow() + timedelta(minutes=15)
        },
        JWT_SECRET,
        algorithm="HS256"
    )

    # Send the access token and user information back to the frontend
    return {
        "message": "Login successful",
        "accessToken": access_token,
        "user": {
            "id": user["id"],
            "email": user["email"]
        }
    }, 200
