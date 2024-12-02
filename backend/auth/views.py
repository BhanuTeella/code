from flask import Blueprint, request, jsonify
from flask_security import auth_token_required,current_user, verify_password, hash_password
from .models import user_datastore, db, User

auth_bp = Blueprint('auth', __name__) 


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.password or not verify_password(password, user.password):
        return jsonify({"message": "Invalid credentials"}), 401

    # Include user role in the response
    role = user.roles[0].name if user.roles else None 
    return jsonify({
        "token": user.get_auth_token(),
        "email": user.email,
        "role": role,
        "id": user.id
    })


@auth_bp.route('/change-password', methods=['POST'])
@auth_token_required
def change_password():
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({"message": "Old password and new password are required"}), 400

    if not verify_password(old_password, current_user.password):
        return jsonify({"message": "Invalid old password"}), 400

    current_user.password = hash_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password changed"})


@auth_bp.route('/delete-account', methods=['DELETE'])
@auth_token_required
def delete_account():
    try:
        # Fetch the current authenticated user
        user = current_user

        # Delete the user from the database
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        # Log the error and return an error response
        # Consider logging the error for debugging purposes
        return jsonify({"message": "Failed to delete account"}), 500


