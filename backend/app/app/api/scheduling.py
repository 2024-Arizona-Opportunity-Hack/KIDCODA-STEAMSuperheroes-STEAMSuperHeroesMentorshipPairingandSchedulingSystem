from fastapi import APIRouter, Depends, HTTPException
from app.crud.crud_scheduling import scheduling as crud_scheduling
from motor.core import AgnosticDatabase

from app.crud.crud_session import session as crud_session
from app.core import deps

router = APIRouter(dependencies=[Depends(deps.get_current_active_superuser)])

@router.get("/schedule_meetings")
async def schedule_meetings(*, session_name: str, db: AgnosticDatabase = Depends(deps.get_db)):
    try:
        result = await crud_scheduling.schedule_meetings(db, session_name=session_name)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
