from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import hashlib
import base64
import cloudinary
import cloudinary.uploader
import cloudinary.api

from ..config import settings
from ..database import get_db
from ..dependencies import get_current_admin
from ..models.user import User
from ..models.place import Place, PlaceStatus
from ..models.verification import Verification
from ..models.city import City
from ..schemas.admin import (
    DashboardStats, DashboardTrends, PaginatedUsersResponse,
    ActivityStatResponse, ActivityStatItem, VerificationStatResponse, VerificationStatItem,
    ActivityFeedResponse, ActivityFeedItem, TopCityItem,
    UserUpdate, AdminUserResponse,
    PlaceUpdate,
    AdminVerificationItem, PaginatedVerificationsResponse,
    PlaceImageItem, PlaceImagesResponse, DeletedCountResponse, SuccessResponse
)
from ..schemas.place import PlacesResponse

# Cloudinary Setup
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],
)

def _pct_change(current: int, previous: int) -> Optional[float]:
    if previous == 0:
        return None
    return round(((current - previous) / previous) * 100.0, 1)

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_places = db.query(Place).count()
    pending_places = db.query(Place).filter(Place.is_active == False).count()
    total_verifications = db.query(Verification).count()

    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    fourteen_days_ago = now - timedelta(days=14)

    cur_users = db.query(User).filter(User.created_at >= seven_days_ago).count()
    prev_users = db.query(User).filter(User.created_at >= fourteen_days_ago, User.created_at < seven_days_ago).count()

    cur_places = db.query(Place).filter(Place.created_at >= seven_days_ago).count()
    prev_places = db.query(Place).filter(Place.created_at >= fourteen_days_ago, Place.created_at < seven_days_ago).count()

    cur_pending = db.query(Place).filter(Place.is_active == False, Place.created_at >= seven_days_ago).count()
    prev_pending = db.query(Place).filter(Place.is_active == False, Place.created_at >= fourteen_days_ago, Place.created_at < seven_days_ago).count()

    cur_verif = db.query(Verification).filter(Verification.created_at >= seven_days_ago).count()
    prev_verif = db.query(Verification).filter(Verification.created_at >= fourteen_days_ago, Verification.created_at < seven_days_ago).count()

    return DashboardStats(
        total_users=total_users,
        total_places=total_places,
        pending_places=pending_places,
        total_verifications=total_verifications,
        trends=DashboardTrends(
            users_pct=_pct_change(cur_users, prev_users),
            places_pct=_pct_change(cur_places, prev_places),
            pending_pct=_pct_change(cur_pending, prev_pending),
            verifications_pct=_pct_change(cur_verif, prev_verif)
        )
    )

@router.get("/stats/activity", response_model=ActivityStatResponse)
def get_activity_stats(days: int = 7, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc).date()
    start_date = now - timedelta(days=days - 1)
    
    date_list = [start_date + timedelta(days=x) for x in range(days)]
    data = {}
    for d in date_list:
        data[str(d)] = {"date": str(d), "new_users": 0, "new_places": 0}
        
    u_stats = db.query(func.date(User.created_at).label('d'), func.count(User.id)).filter(User.created_at >= start_date).group_by('d').all()
    for row in u_stats:
        d_str = str(row[0])
        if d_str in data:
            data[d_str]["new_users"] = row[1]
            
    p_stats = db.query(func.date(Place.created_at).label('d'), func.count(Place.id)).filter(Place.created_at >= start_date).group_by('d').all()
    for row in p_stats:
        d_str = str(row[0])
        if d_str in data:
            data[d_str]["new_places"] = row[1]
            
    return ActivityStatResponse(data=[ActivityStatItem(**v) for v in data.values()])


@router.get("/stats/verifications", response_model=VerificationStatResponse)
def get_verification_stats(days: int = 7, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc).date()
    start_date = now - timedelta(days=days - 1)
    
    date_list = [start_date + timedelta(days=x) for x in range(days)]
    data = {}
    for d in date_list:
        data[str(d)] = {"date": str(d), "open": 0, "closed": 0, "unknown": 0}
        
    v_stats = db.query(func.date(Verification.created_at).label('d'), Verification.status, func.count(Verification.id)).filter(Verification.created_at >= start_date).group_by('d', Verification.status).all()
    for row in v_stats:
        d_str = str(row[0])
        status = row[1].value if hasattr(row[1], 'value') else str(row[1])
        status_name = status.replace('PlaceStatus.', '')
        if d_str in data and status_name in data[d_str]:
            data[d_str][status_name] = row[2]
            
    return VerificationStatResponse(data=[VerificationStatItem(**v) for v in data.values()])

def deduce_auth_method(email: str) -> str:
    if email.endswith("@lnc.app"):
        phone = email.replace("@lnc.app", "")
        if any(c.isdigit() for c in phone):
            if phone.startswith("91") or phone.startswith("+91"):
                return "whatsapp"
            else:
                return "phone"
        return "phone"
    return "google"

@router.get("/activity", response_model=ActivityFeedResponse)
def get_activity_feed(limit: int = 15, db: Session = Depends(get_db)):
    items = []
    # Users
    users = db.query(User).order_by(User.created_at.desc()).limit(limit).all()
    for u in users:
        items.append({
            "type": "new_user",
            "user_name": u.name,
            "auth_method": deduce_auth_method(u.email),
            "created_at": str(u.created_at)
        })
        
    # Places
    places = db.query(Place).order_by(Place.created_at.desc()).limit(limit).all()
    for p in places:
        city_name = "Unknown"
        if p.city_id:
            c = db.query(City).filter(City.id == p.city_id).first()
            if c:
                city_name = c.name
        
        user_name = "Unknown"
        u = db.query(User).filter(User.id == p.added_by_id).first()
        if u:
            user_name = u.name
            
        items.append({
            "type": "new_place",
            "user_name": user_name,
            "place_name": p.name,
            "city": city_name,
            "created_at": str(p.created_at)
        })
        
    # Verifications
    verifs = db.query(Verification).order_by(Verification.created_at.desc()).limit(limit).all()
    for v in verifs:
        user_name = "Unknown"
        u = db.query(User).filter(User.id == v.user_id).first()
        if u:
            user_name = u.name
            
        place_name = "Unknown"
        city_name = "Unknown"
        p = db.query(Place).filter(Place.id == v.place_id).first()
        if p:
            place_name = p.name
            if p.city_id:
                c = db.query(City).filter(City.id == p.city_id).first()
                if c:
                    city_name = c.name
                    
        status_str = v.status.value if hasattr(v.status, 'value') else str(v.status)
        status_str = status_str.replace('PlaceStatus.', '')
                    
        items.append({
            "type": "verification",
            "user_name": user_name,
            "place_name": place_name,
            "city": city_name,
            "status": status_str,
            "created_at": str(v.created_at)
        })
        
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return ActivityFeedResponse(items=items[:limit])


@router.get("/stats/top-cities", response_model=List[TopCityItem])
def get_top_cities(db: Session = Depends(get_db)):
    results = db.query(
        City.name.label("city"),
        func.count(Place.id).label("place_count"),
        func.sum(Place.verification_count).label("verification_count")
    ).select_from(City).join(Place, Place.city_id == City.id).filter(Place.is_active == True).group_by(City.id).order_by(desc("place_count")).limit(10).all()
    
    return [TopCityItem(city=row.city, place_count=row.place_count, verification_count=row.verification_count or 0) for row in results]


@router.get("/users", response_model=PaginatedUsersResponse)
def list_users(
    page: int = 1,
    size: int = 50,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if search:
        query = query.filter(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
        
    query = query.order_by(User.points.desc())
    total = query.count()
    users = query.offset((page - 1) * size).limit(size).all()
    
    items = []
    for u in users:
        items.append(AdminUserResponse(
            id=str(u.id),
            name=u.name,
            email=u.email,
            role=u.role,
            points=u.points,
            is_active=u.is_active,
            is_verified=u.is_verified,
            created_at=str(u.created_at)
        ))
        
    return PaginatedUsersResponse(total=total, page=page, size=size, items=items)

@router.patch("/users/{user_id}", response_model=AdminUserResponse)
def update_user(user_id: str, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if payload.role is not None:
        if payload.role not in ["user", "moderator", "admin"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = payload.role
        
    if payload.is_active is not None:
        user.is_active = payload.is_active
        
    db.commit()
    db.refresh(user)
    return AdminUserResponse(
        id=str(user.id), name=user.name, email=user.email, role=user.role,
        points=user.points, is_active=user.is_active, is_verified=user.is_verified,
        created_at=str(user.created_at)
    )

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


@router.get("/places", response_model=PlacesResponse)
def list_places(
    page: int = 1,
    size: int = 50,
    city: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    from ..services.place_service import _attach_coords
    query = db.query(Place)
    
    if status == "pending":
        query = query.filter(Place.is_active == False)
    else:
        if status:
            query = query.filter(Place.status == status, Place.is_active == True)
        
    if city:
        query = query.join(City, Place.city_id == City.id).filter(City.name.ilike(f"%{city}%"))
    if category:
        query = query.filter(Place.category == category)
        
    query = query.order_by(Place.created_at.desc())
    total = query.count()
    places = query.offset((page - 1) * size).limit(size).all()
    
    for p in places:
        _attach_coords(db, p)
        p.distance = None
        
    return PlacesResponse(items=places, total=total, page=page, size=size)

@router.patch("/places/{place_id}")
def update_place(place_id: str, payload: PlaceUpdate, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
        
    if payload.is_active is not None:
        place.is_active = payload.is_active
    if payload.name is not None:
        place.name = payload.name
    if payload.category is not None:
        place.category = payload.category
        
    db.commit()
    db.refresh(place)
    from ..services.place_service import _attach_coords
    _attach_coords(db, place)
    place.distance = None
    return place

@router.post("/places/{place_id}/approve", response_model=SuccessResponse)
def approve_place(place_id: str, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    place.is_active = True
    db.commit()
    return SuccessResponse(success=True)

@router.post("/places/{place_id}/reject", response_model=SuccessResponse)
def reject_place(place_id: str, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    place.is_active = False
    db.commit()
    return SuccessResponse(success=True)

@router.delete("/places/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_place(place_id: str, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    db.delete(place)
    db.commit()

@router.get("/verifications", response_model=PaginatedVerificationsResponse)
def list_verifications(
    page: int = 1,
    size: int = 25,
    status: Optional[str] = None,
    place_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Verification, User, Place, City).join(User, Verification.user_id == User.id).join(Place, Verification.place_id == Place.id).outerjoin(City, Place.city_id == City.id)
    
    if status:
        query = query.filter(Verification.status == status)
    if place_id:
        query = query.filter(Verification.place_id == place_id)
        
    query = query.order_by(Verification.created_at.desc())
    total = query.count()
    results = query.offset((page - 1) * size).limit(size).all()
    
    items = []
    for v, u, p, c in results:
        status_str = v.status.value if hasattr(v.status, 'value') else str(v.status)
        status_str = status_str.replace('PlaceStatus.', '')
        
        items.append(AdminVerificationItem(
            id=str(v.id),
            place_id=str(p.id),
            place_name=p.name,
            city=c.name if c else "Unknown",
            user_id=str(u.id),
            user_name=u.name,
            status=status_str,
            created_at=str(v.created_at)
        ))
        
    return PaginatedVerificationsResponse(items=items, total=total, page=page, size=size)

@router.delete("/verifications/{verif_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_verification(verif_id: str, db: Session = Depends(get_db)):
    v = db.query(Verification).filter(Verification.id == verif_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(v)
    db.commit()

def extract_public_id(url: str) -> str:
    # https://res.cloudinary.com/cloud/image/upload/v123456/lnc/places/abc.jpg
    parts = url.split('/upload/')
    if len(parts) == 2:
        path = parts[1]
        if '/' in path:
            path_parts = path.split('/')
            if path_parts[0].startswith('v') and path_parts[0][1:].isdigit():
                path = '/'.join(path_parts[1:])
        return path.rsplit('.', 1)[0]
    return url

@router.get("/places/{place_id}/images", response_model=PlaceImagesResponse)
def get_place_images(place_id: str, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
        
    images = []
    for url in (place.image_urls or []):
        public_id = extract_public_id(url)
        img_id = base64.urlsafe_b64encode(public_id.encode('utf-8')).decode('utf-8')
        
        # Build thumbnail url
        parts = url.split('/upload/')
        if len(parts) == 2:
            thumbnail_url = f"{parts[0]}/upload/w_400,h_300,c_fill/{parts[1]}"
        else:
            thumbnail_url = url
            
        images.append(PlaceImageItem(
            id=img_id,
            public_id=public_id,
            url=url,
            secure_url=url,
            thumbnail_url=thumbnail_url,
            created_at=str(place.created_at) if place.created_at else None
        ))
        
    return PlaceImagesResponse(images=images)

@router.delete("/places/{place_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_place_image(place_id: str, image_id: str, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
        
    try:
        public_id = base64.urlsafe_b64decode(image_id).decode('utf-8')
    except:
        raise HTTPException(status_code=400, detail="Invalid image id")
        
    # Find matching URL
    matched_url = None
    for url in (place.image_urls or []):
        if extract_public_id(url) == public_id:
            matched_url = url
            break
            
    if not matched_url:
        raise HTTPException(status_code=404, detail="Image not found for this place")
        
    try:
        cloudinary.uploader.destroy(public_id, invalidate=True)
    except Exception as e:
        pass # Ignore cloudinary errors or log them
        
    place.image_urls.remove(matched_url)
    # force sqlalchemy to recognize array change
    place.image_urls = list(place.image_urls)
    db.commit()
    
@router.delete("/places/{place_id}/images", response_model=DeletedCountResponse)
def delete_all_place_images(place_id: str, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
        
    if not place.image_urls:
        return DeletedCountResponse(deleted=0)
        
    public_ids = [extract_public_id(url) for url in place.image_urls]
    deleted_count = len(public_ids)
    
    try:
        cloudinary.api.delete_resources(public_ids, invalidate=True)
    except Exception as e:
        pass
        
    place.image_urls = []
    db.commit()
    return DeletedCountResponse(deleted=deleted_count)
