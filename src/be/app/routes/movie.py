from flask import Blueprint, jsonify

movie_router = Blueprint("movie", __name__)

movies = [
    {
        "id": 1,
        "title": "Dune: Part Two",
        "genre": "Sci-Fi",
        "duration": 166,
        "releaseDate": "2026-09-10",
        "status": "Showing",
        "image": "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        "screenings": [
            {"time": "10:00", "room": "Room 1"},
            {"time": "14:00", "room": "Room 2"},
            {"time": "19:30", "room": "Room 1"},
        ],
    },
    {
        "id": 2,
        "title": "How to Train Your Dragon",
        "genre": "Adventure",
        "duration": 125,
        "releaseDate": "2026-09-12",
        "status": "Showing",
        "image": "https://image.tmdb.org/t/p/w500/q5pXRYTycaeW6dEgsCrd4mYPmxM.jpg",
        "screenings": [
            {"time": "11:30", "room": "Room 3"},
            {"time": "18:00", "room": "Room 3"},
        ],
    },
    {
        "id": 3,
        "title": "The Batman",
        "genre": "Action",
        "duration": 176,
        "releaseDate": "2026-08-20",
        "status": "Hidden",
        "image": "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        "screenings": [],
    },
]


@movie_router.route("", methods=["GET"])
def get_movies():
    return jsonify(movies)