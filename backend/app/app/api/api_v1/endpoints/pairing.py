from app.crud.crud_session import session as crud_session
from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from app.api import deps
from app.model_types.enums import StatusEnum
from app.best_match import find_best_match

router = APIRouter(dependencies=[Depends(deps.get_current_active_superuser)])

@router.post("/schedule")
async def schedule_session(*, session_name: str, db: AgnosticDatabase = Depends(deps.get_db)):
    session = await crud_session.get_session_by_name(db, session_name=session_name)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.scheduling_status == StatusEnum.NOT_STARTED:
        # Update the scheduling status to IN_PROGRESS
        await crud_session.update_session(db, session_name=session_name, session_in={"scheduling_status": StatusEnum.IN_PROGRESS})
        
        try:
            # Call the find_best_match function
            find_best_match()
        except Exception as e:
            # Update the scheduling status to FAILED
            await crud_session.update_session(db, session_name=session_name, session_in={"scheduling_status": StatusEnum.NOT_STARTED})
            return {"status": "Scheduling failed", "error": str(e)}

        # Update the scheduling status to COMPLETED
        await crud_session.update_session(db, session_name=session_name, session_in={"scheduling_status": StatusEnum.COMPLETED})
        return {"status": "Scheduling completed"}
    else:
        return {"status": session.scheduling_status}