from app.crud.crud_session import session as crud_session
from app.crud.crud_pairing import pairing as crud_pairing
from app.schemas.pairing import MatchCreate
from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from app.core import deps

router = APIRouter(dependencies=[Depends(deps.get_current_active_superuser)])

@router.get("/initiate_pairing")
async def initiate_pairing(*, db: AgnosticDatabase = Depends(deps.get_db)):
    try:
        result = await crud_pairing.make_pairs(db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all")
async def get_pairings_for_session(*, session_name: str | None = None, db: AgnosticDatabase = Depends(deps.get_db)):
    if session_name is not None:
        session = await crud_session.get_session_by_name(db, session_name=session_name)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return await crud_pairing.get_multi_by_session_name(db, session_name)
    else:
        return await crud_pairing.get_multi(db)

@router.post("/")
async def create_pairing(*, pairing_in: MatchCreate, db: AgnosticDatabase = Depends(deps.get_db)):
    return await crud_pairing.create(db, obj_in=pairing_in)

@router.get("/")
async def get_pairing(*, session_name: str, mentor_email: str, mentee_email: str, db: AgnosticDatabase = Depends(deps.get_db)):
    pairing = await crud_pairing.get_match(db, session_name, mentor_email, mentee_email)
    if not pairing:
        raise HTTPException(status_code=404, detail="Pairing not found")
    return pairing

@router.put("/")
async def update_pairing(*, pairing_in: MatchCreate, db: AgnosticDatabase = Depends(deps.get_db)):
    pairing = await crud_pairing.get_match(db, pairing_in.session_name, pairing_in.mentor_email, pairing_in.mentee_email)
    if not pairing:
        raise HTTPException(status_code=404, detail="Pairing not found")
    return await crud_pairing.update(db, db_obj=pairing, obj_in=pairing_in)

@router.delete("/")
async def delete_pairing(*, session_name: str, mentor_email: str, mentee_email: str, db: AgnosticDatabase = Depends(deps.get_db)):
    pairing = await crud_pairing.get_match(db, session_name, mentor_email, mentee_email)
    if not pairing:
        raise HTTPException(status_code=404, detail="Pairing not found")
    return await crud_pairing.remove(db, pairing)
