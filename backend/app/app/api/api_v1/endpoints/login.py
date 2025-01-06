from typing import Any, Union

from bson import ObjectId

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from motor.core import AgnosticDatabase

from app import crud, models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.utilities import (
    send_reset_password_email,
)

router = APIRouter()


@router.post("/oauth", response_model=schemas.Token)
async def login_with_oauth2(
    db: AgnosticDatabase = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    First step with OAuth2 compatible token login, get an access token for future requests.
    """
    user = await crud.user.authenticate(db, email=form_data.username, password=form_data.password)
    if not form_data.password or not user or not crud.user.is_active(user):
        raise HTTPException(status_code=400, detail="Login failed; incorrect email or password")
    return {
        "access_token": security.create_access_token(subject=user.id, force_totp=False),
        "refresh_token": None,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(
    db: AgnosticDatabase = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_refresh_user),
) -> Any:
    """
    Refresh tokens for future requests
    """
    refresh_token = security.create_refresh_token(subject=current_user.id)
    await crud.token.create(db=db, obj_in=refresh_token, user_obj=current_user)
    return {
        "access_token": security.create_access_token(subject=current_user.id),
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/revoke", response_model=schemas.Msg)
async def revoke_token(
    db: AgnosticDatabase = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_refresh_user),
) -> Any:
    """
    Revoke a refresh token
    """
    return {"msg": "Token revoked"}


@router.post("/recover/{email}", response_model=Union[schemas.WebToken, schemas.Msg])
async def recover_password(email: str, db: AgnosticDatabase = Depends(deps.get_db)) -> Any:
    """
    Password Recovery
    """
    user = await crud.user.get_by_email(db, email=email)
    if user and crud.user.is_active(user):
        tokens = security.create_magic_tokens(subject=user.id)
        if settings.EMAILS_ENABLED:
            send_reset_password_email(email_to=user.email, email=email, token=tokens[0])
            return {"claim": tokens[1]}
    return {"msg": "If that login exists, we'll send you an email to reset your password."}


@router.post("/reset", response_model=schemas.Msg)
async def reset_password(
    *,
    db: AgnosticDatabase = Depends(deps.get_db),
    new_password: str = Body(...),
    claim: str = Body(...),
    magic_in: bool = Depends(deps.get_magic_token),
) -> Any:
    """
    Reset password
    """
    claim_in = deps.get_magic_token(token=claim)
    # Get the user
    user = await crud.user.get(db, id=ObjectId(magic_in.sub))
    # Test the claims
    if (
        (claim_in.sub == magic_in.sub)
        or (claim_in.fingerprint != magic_in.fingerprint)
        or not user
        or not crud.user.is_active(user)
    ):
        raise HTTPException(status_code=400, detail="Password update failed; invalid claim.")
    # Update the password
    hashed_password = security.get_password_hash(new_password)
    user.hashed_password = hashed_password
    await user.save()
    return {"msg": "Password updated successfully."}
