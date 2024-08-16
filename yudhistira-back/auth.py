# auth.py
from flask import Blueprint, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
db = SQLAlchemy()
login_manager = LoginManager()

login_manager.session_protection = "strong"  # Use "basic" for less protection, "strong" for more
login_manager.login_view = "auth.login"  # Redirect to login if not authenticated

# User model for authentication
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        """Hashes the password and stores it."""
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """Checks the hashed password."""
        return check_password_hash(self.password, password)

    # These methods are required by Flask-Login
    @property
    def is_active(self):
        return True

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        login_user(user)
        return jsonify({'message': 'Login successful', 'redirect_url': '/admin'})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST', 'GET'])
# @login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'User already exists'}), 400
    
    hashed_password = generate_password_hash(password, method='sha256')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/auth/check', methods=['GET'])
@login_required
def auth_check():
    return jsonify(authenticated=True)

@auth_bp.route('/current_user', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({'username': current_user.username}), 200
