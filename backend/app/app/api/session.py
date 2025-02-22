from app.crud.crud_session import session as crud_session
from app.schemas.session import SessionCreate, SessionUpdate
from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from app.core import deps
from app.model_types.enums import StatusEnum


router = APIRouter(dependencies=[Depends(deps.get_current_active_superuser)])

@router.get("/")
async def get_session(*, session_name: str | None = None, db: AgnosticDatabase = Depends(deps.get_db)):
    if session_name:
        session = await crud_session.get_session_by_name(db, session_name=session_name)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session = await crud_session.get_all_sessions(db)
    return session

@router.get("/active")
async def get_active_session(*, db: AgnosticDatabase = Depends(deps.get_db)):
    session = await crud_session.get_active_session(db)
    if not session:
        raise HTTPException(status_code=404, detail="No active session")
    return session

@router.post("/")
async def create_session(*, session_in: SessionCreate, db: AgnosticDatabase = Depends(deps.get_db)):
    try:
        session = await crud_session.create_session(db, session_in=session_in)
        return session
    except ValueError as e:
        raise HTTPException(status_code=404, detail="A session is alearly active")

@router.put("/{session_name}")
async def update_session(*, session_name: str, session_in: SessionUpdate, db: AgnosticDatabase = Depends(deps.get_db)):
    try:
        session = await crud_session.update_session(db, session_name=session_name, session_in=session_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Session not found")

@router.delete("/{session_name}")
async def delete_session(*, session_name, db: AgnosticDatabase = Depends(deps.get_db)):
    try:
        await crud_session.remove(db, session_name=session_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail="Session not found")
